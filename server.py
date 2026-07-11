from pathlib import Path
import json
import os
import re
import urllib.error
import urllib.request

from flask import Flask, jsonify, request


app = Flask(__name__)
CONFIG_FILE = Path(__file__).with_name("vault_path.txt")
NOTES_FILE = Path(__file__).with_name("saved_notes.json")
OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses"
SUMMARY_TEXT_LIMIT = 60000
SUMMARY_CHUNK_SIZE = 9000
PLAIN_TEXT_SUMMARY_INSTRUCTIONS = (
    "Return plain text only. Do not use Markdown formatting. "
    "Do not use bold markers, headings, blockquotes, code blocks, or Markdown links. "
    "When a list makes sense, use simple bullet lines that start with '- '."
)


def load_notes():
    """Read the saved notes, or start with an empty list."""
    if not NOTES_FILE.exists():
        return []

    notes_text = NOTES_FILE.read_text(encoding="utf-8").strip()

    if notes_text == "":
        return []

    try:
        notes = json.loads(notes_text)
    except json.JSONDecodeError:
        return []

    if not isinstance(notes, list):
        return []

    return notes


def save_notes(notes):
    """Save the notes list to the JSON file."""
    notes_text = json.dumps(notes, indent=2)
    NOTES_FILE.write_text(notes_text, encoding="utf-8")


def clear_saved_notes():
    """Clear saved_notes.json after a successful export."""
    NOTES_FILE.write_text("[]", encoding="utf-8")


def get_saved_vault_path():
    """Read the saved Obsidian vault path."""
    if not CONFIG_FILE.exists():
        return None

    vault_path_text = CONFIG_FILE.read_text(encoding="utf-8").strip()

    if vault_path_text == "":
        return None

    return Path(vault_path_text)


def make_safe_path(note_title):
    """Turn a note title into a safe Markdown path."""
    unsafe_characters = '<>:"/\\|?*'
    path_parts = note_title.strip().replace("\\", "/").split("/")
    safe_parts = []

    for part in path_parts:
        safe_part = part.strip()

        for character in unsafe_characters:
            safe_part = safe_part.replace(character, "_")

        if safe_part not in ("", ".", ".."):
            safe_parts.append(safe_part)

    if len(safe_parts) == 0:
        return None

    filename = safe_parts[-1]

    if not filename.endswith(".md"):
        safe_parts[-1] = filename + ".md"

    return Path(*safe_parts)


def make_safe_creation_path(note_title):
    """Create a safe relative path for a new note and its folders."""
    cleaned_title = note_title.strip()

    if cleaned_title.startswith(("/", "\\")):
        raise ValueError("Note paths must be relative to the Obsidian vault.")

    if re.match(r"^[A-Za-z]:", cleaned_title):
        raise ValueError("Drive letters are not allowed in note paths.")

    raw_parts = cleaned_title.split("/")
    safe_parts = []
    invalid_characters = '<>:"\\|?*'
    reserved_names = {
        "CON", "PRN", "AUX", "NUL",
        "COM1", "COM2", "COM3", "COM4", "COM5", "COM6", "COM7", "COM8", "COM9",
        "LPT1", "LPT2", "LPT3", "LPT4", "LPT5", "LPT6", "LPT7", "LPT8", "LPT9"
    }

    for raw_part in raw_parts:
        part = raw_part.strip()

        if part in ("", ".", ".."):
            raise ValueError("Note paths cannot contain empty, current, or parent folder segments.")

        for character in invalid_characters:
            part = part.replace(character, "_")

        part = "".join(
            character if ord(character) >= 32 else "_"
            for character in part
        ).rstrip(" .")

        if part == "":
            raise ValueError("Each folder and note name must contain a valid character.")

        name_without_extension = Path(part).stem if part.lower().endswith(".md") else part

        if name_without_extension.upper() in reserved_names:
            part = part + "_"

        safe_parts.append(part)

    filename = safe_parts[-1]

    while filename.lower().endswith(".md.md"):
        filename = filename[:-3]

    if not filename.lower().endswith(".md"):
        filename = filename + ".md"

    safe_parts[-1] = filename
    return Path(*safe_parts)


def path_is_inside_vault(vault_path, note_path):
    """Check that a note path resolves inside the configured vault."""
    try:
        note_path.resolve().relative_to(vault_path.resolve())
        return True
    except ValueError:
        return False


def note_path_to_name(vault_path, note_path):
    """Turn a Markdown file path into an Obsidian note name."""
    relative_path = note_path.relative_to(vault_path)
    return relative_path.with_suffix("").as_posix()


def make_duplicate_note_path(note_path):
    """Find a safe duplicate path if the note already exists."""
    if not note_path.exists():
        return note_path

    folder = note_path.parent
    stem = note_path.stem
    suffix = note_path.suffix
    number = 2

    while True:
        duplicate_path = folder / f"{stem} {number}{suffix}"

        if not duplicate_path.exists():
            return duplicate_path

        number = number + 1


def list_vault_notes(vault_path, include_trash=False):
    """Find all Markdown notes in the Obsidian vault."""
    note_names = []

    for note_path in vault_path.rglob("*.md"):
        relative_path = note_path.relative_to(vault_path)

        if not include_trash and ".trash" in relative_path.parts:
            continue

        note_name = relative_path.with_suffix("").as_posix()
        note_names.append(note_name)

    note_names.sort(key=str.lower)
    return note_names


def append_text_to_obsidian(vault_path, note_title, text_to_append):
    """Append text to one Obsidian Markdown note as a separate export run."""
    safe_path = make_safe_path(note_title)

    if safe_path is None:
        raise ValueError("Note title cannot be empty.")

    note_path = vault_path / safe_path

    if note_path.exists():
        existing_text = note_path.read_text(encoding="utf-8")

        if existing_text.strip() == "":
            new_text = text_to_append
        else:
            new_text = existing_text.rstrip("\n") + "\n\n" + text_to_append
    else:
        new_text = text_to_append

    note_path.parent.mkdir(parents=True, exist_ok=True)
    note_path.write_text(new_text + "\n", encoding="utf-8")


def append_notes_to_obsidian(vault_path, note_title, saved_notes):
    """Append all saved notes to one Obsidian Markdown note."""
    text_to_append = "\n".join(saved_notes)
    append_text_to_obsidian(vault_path, note_title, text_to_append)


def extract_openai_text(response_data):
    """Pull plain text out of a Responses API result."""
    output_text = response_data.get("output_text", "")

    if isinstance(output_text, str) and output_text.strip() != "":
        return output_text.strip()

    text_parts = []

    for output_item in response_data.get("output", []):
        if not isinstance(output_item, dict):
            continue

        for content_item in output_item.get("content", []):
            if not isinstance(content_item, dict):
                continue

            text = content_item.get("text", "")

            if isinstance(text, str) and text.strip() != "":
                text_parts.append(text.strip())

    return "\n".join(text_parts).strip()


def call_openai_summary_api(prompt, max_output_tokens=260):
    """Send one summary prompt to OpenAI."""
    api_key = os.environ.get("OPENAI_API_KEY", "").strip()

    if api_key == "":
        raise ValueError("OPENAI_API_KEY is not set on the Flask server.")

    model = os.environ.get("OPENAI_SUMMARY_MODEL", "gpt-5.4-mini").strip()

    if model == "":
        model = "gpt-5.4-mini"

    request_body = {
        "model": model,
        "input": prompt,
        "max_output_tokens": max_output_tokens
    }
    request_data = json.dumps(request_body).encode("utf-8")
    api_request = urllib.request.Request(
        OPENAI_RESPONSES_URL,
        data=request_data,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        },
        method="POST"
    )

    try:
        with urllib.request.urlopen(api_request, timeout=45) as response:
            response_text = response.read().decode("utf-8")
    except urllib.error.HTTPError as error:
        try:
            error_data = json.loads(error.read().decode("utf-8"))
            message = error_data.get("error", {}).get("message", "")
        except (json.JSONDecodeError, UnicodeDecodeError):
            message = ""

        if message == "":
            message = "The AI summary request failed."

        raise RuntimeError(message) from error
    except urllib.error.URLError as error:
        raise RuntimeError("Could not reach the AI API.") from error

    try:
        response_data = json.loads(response_text)
    except json.JSONDecodeError as error:
        raise RuntimeError("The AI API returned an unexpected response.") from error

    summary = extract_openai_text(response_data)

    if summary == "":
        raise RuntimeError("The AI API did not return a summary.")

    return summary


def split_summary_text(text_to_summarize):
    """Split long page text into readable chunks."""
    chunks = []
    remaining_text = text_to_summarize.strip()

    while remaining_text:
        if len(remaining_text) <= SUMMARY_CHUNK_SIZE:
            chunks.append(remaining_text)
            break

        split_at = remaining_text.rfind("\n", 0, SUMMARY_CHUNK_SIZE)

        if split_at < SUMMARY_CHUNK_SIZE // 2:
            split_at = remaining_text.rfind(" ", 0, SUMMARY_CHUNK_SIZE)

        if split_at < SUMMARY_CHUNK_SIZE // 2:
            split_at = SUMMARY_CHUNK_SIZE

        chunks.append(remaining_text[:split_at].strip())
        remaining_text = remaining_text[split_at:].strip()

    return chunks


def create_ai_summary(text_to_summarize, mode="selected", title="", url=""):
    """Ask OpenAI for a concise summary using the server-side API key."""
    clean_mode = mode if mode in ("selected", "page") else "selected"
    source_label = "highlighted text" if clean_mode == "selected" else "webpage/article"
    metadata_lines = []

    if isinstance(title, str) and title.strip() != "":
        metadata_lines.append(f"Title: {title.strip()}")

    if isinstance(url, str) and url.strip() != "":
        metadata_lines.append(f"URL: {url.strip()}")

    metadata = "\n".join(metadata_lines)
    chunks = split_summary_text(text_to_summarize)

    if len(chunks) == 1:
        prompt = (
            f"Summarize the {source_label} clearly and concisely. "
            "Use 2 to 5 short bullet points. Preserve important names, facts, and conclusions. "
            f"{PLAIN_TEXT_SUMMARY_INSTRUCTIONS}"
        )

        if metadata != "":
            prompt = prompt + f"\n\nMetadata:\n{metadata}"

        prompt = prompt + f"\n\nText:\n{chunks[0]}"
        return call_openai_summary_api(prompt)

    partial_summaries = []

    for index, chunk in enumerate(chunks, start=1):
        prompt = (
            f"Summarize part {index} of {len(chunks)} from this {source_label}. "
            "Keep only the most important points, names, facts, and conclusions. "
            f"{PLAIN_TEXT_SUMMARY_INSTRUCTIONS}\n\n"
            f"Text part {index}:\n{chunk}"
        )
        partial_summaries.append(call_openai_summary_api(prompt, max_output_tokens=220))

    final_prompt = (
        f"Combine these partial summaries into one concise summary of the full {source_label}. "
        "Use 3 to 6 short bullet points. Remove repetition and keep the most important ideas. "
        f"{PLAIN_TEXT_SUMMARY_INSTRUCTIONS}"
    )

    if metadata != "":
        final_prompt = final_prompt + f"\n\nMetadata:\n{metadata}"

    final_prompt = final_prompt + "\n\nPartial summaries:\n" + "\n\n".join(partial_summaries)
    return call_openai_summary_api(final_prompt, max_output_tokens=320)


@app.post("/save")
def save_note():
    """Save a note sent as JSON."""
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"message": "Please send JSON with a note."}), 400

    note_text = data.get("note", "")

    if not isinstance(note_text, str) or note_text.strip() == "":
        return jsonify({"message": "Note text cannot be empty."}), 400

    notes = load_notes()
    notes.append(note_text.strip())
    save_notes(notes)

    return jsonify({"message": "Note saved"}), 201


@app.post("/summarize")
def summarize_text():
    """Summarize highlighted or extracted page text without changing the note queue."""
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"message": "Please send JSON with text."}), 400

    text_to_summarize = data.get("text", "")
    title = data.get("title", "")
    url = data.get("url", "")
    mode = data.get("mode", "selected")

    if not isinstance(text_to_summarize, str) or text_to_summarize.strip() == "":
        return jsonify({"message": "Highlight text first."}), 400

    clean_text = text_to_summarize.strip()

    if len(clean_text) > SUMMARY_TEXT_LIMIT:
        return jsonify({
            "message": f"Text is too long to summarize. Please use {SUMMARY_TEXT_LIMIT} characters or fewer."
        }), 400

    try:
        summary = create_ai_summary(clean_text, mode, title, url)
    except ValueError as error:
        return jsonify({"message": str(error)}), 400
    except RuntimeError as error:
        return jsonify({"message": str(error)}), 502

    return jsonify({
        "summary": summary,
        "message": "Summary ready."
    }), 200


@app.get("/notes")
def get_notes():
    """Return all Markdown notes in the saved Obsidian vault."""
    include_trash = request.args.get("includeTrash", "").lower() == "true"
    vault_path = get_saved_vault_path()

    if vault_path is None:
        return jsonify({"message": "Vault path is not set.", "notes": []}), 400

    if not vault_path.exists() or not vault_path.is_dir():
        return jsonify({"message": f"Vault path not found: {vault_path}", "notes": []}), 400

    note_names = list_vault_notes(vault_path, include_trash)
    return jsonify({"notes": note_names}), 200


@app.post("/notes")
def create_note():
    """Create a new Markdown note in the saved Obsidian vault."""
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"message": "Please send JSON with a note title."}), 400

    note_title = data.get("title", data.get("name", ""))

    if not isinstance(note_title, str) or note_title.strip() == "":
        return jsonify({"message": "Note title cannot be empty."}), 400

    vault_path = get_saved_vault_path()

    if vault_path is None:
        return jsonify({"message": "Vault path is not set."}), 400

    if not vault_path.exists() or not vault_path.is_dir():
        return jsonify({"message": f"Vault path not found: {vault_path}"}), 400

    try:
        safe_path = make_safe_creation_path(note_title)
    except ValueError as error:
        return jsonify({"message": str(error)}), 400

    requested_note_path = vault_path / safe_path

    if not path_is_inside_vault(vault_path, requested_note_path):
        return jsonify({"message": "The note path must stay inside the Obsidian vault."}), 400

    note_path = make_duplicate_note_path(requested_note_path)
    note_path.parent.mkdir(parents=True, exist_ok=True)
    note_path.write_text("", encoding="utf-8")
    note_name = note_path_to_name(vault_path, note_path)

    return jsonify({
        "message": f"Created note: {note_name}",
        "note": note_name
    }), 201


@app.get("/queue")
def get_queue():
    """Return the notes currently waiting to be exported."""
    saved_notes = load_notes()
    return jsonify({"notes": saved_notes}), 200


@app.delete("/queue/<int:index>")
def delete_queue_note(index):
    """Delete one queued note by zero-based index."""
    saved_notes = load_notes()

    if index < 0 or index >= len(saved_notes):
        return jsonify({"message": "Queue index not found."}), 404

    deleted_note = saved_notes.pop(index)
    save_notes(saved_notes)

    return jsonify({
        "message": "Queued note deleted.",
        "deleted": deleted_note,
        "notes": saved_notes
    }), 200


@app.delete("/queue")
def clear_queue():
    """Clear all queued notes without changing Obsidian notes."""
    save_notes([])
    return jsonify({"message": "Queue cleared.", "notes": []}), 200


@app.post("/export")
def export_notes():
    """Export saved notes to an Obsidian note."""
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"message": "Please send JSON with a title."}), 400

    note_title = data.get("title", "")

    if not isinstance(note_title, str) or note_title.strip() == "":
        return jsonify({"message": "Note title cannot be empty."}), 400

    saved_notes = load_notes()

    if len(saved_notes) == 0:
        return jsonify({"message": "No notes to export."}), 400

    vault_path = get_saved_vault_path()

    if vault_path is None:
        return jsonify({"message": "Vault path is not set. Run an export command first or create vault_path.txt."}), 400

    if not vault_path.exists() or not vault_path.is_dir():
        return jsonify({"message": f"Vault path not found: {vault_path}"}), 400

    try:
        append_notes_to_obsidian(vault_path, note_title, saved_notes)
    except ValueError as error:
        return jsonify({"message": str(error)}), 400

    clear_saved_notes()

    return jsonify({"message": f"{len(saved_notes)} notes exported."}), 200


@app.post("/export-selected")
def export_selected_notes():
    """Export selected queued notes and remove only those notes after success."""
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"message": "Please send JSON with a title and indexes."}), 400

    note_title = data.get("title", "")
    selected_indexes = data.get("indexes", [])

    if not isinstance(note_title, str) or note_title.strip() == "":
        return jsonify({"message": "Note title cannot be empty."}), 400

    if not isinstance(selected_indexes, list) or len(selected_indexes) == 0:
        return jsonify({"message": "Select at least one queued note first."}), 400

    saved_notes = load_notes()

    if len(saved_notes) == 0:
        return jsonify({"message": "No notes to export."}), 400

    clean_indexes = []

    for index in selected_indexes:
        if not isinstance(index, int):
            return jsonify({"message": "Selected note indexes must be numbers."}), 400

        if index < 0 or index >= len(saved_notes):
            return jsonify({"message": "One or more selected notes were not found."}), 400

        if index not in clean_indexes:
            clean_indexes.append(index)

    clean_indexes.sort()
    selected_notes = [saved_notes[index] for index in clean_indexes]

    vault_path = get_saved_vault_path()

    if vault_path is None:
        return jsonify({"message": "Vault path is not set. Run an export command first or create vault_path.txt."}), 400

    if not vault_path.exists() or not vault_path.is_dir():
        return jsonify({"message": f"Vault path not found: {vault_path}"}), 400

    try:
        append_notes_to_obsidian(vault_path, note_title, selected_notes)
    except ValueError as error:
        return jsonify({"message": str(error)}), 400

    for index in sorted(clean_indexes, reverse=True):
        saved_notes.pop(index)

    save_notes(saved_notes)

    return jsonify({
        "message": f"{len(selected_notes)} selected notes exported.",
        "notes": saved_notes
    }), 200


@app.post("/export-direct")
def export_direct():
    """Export provided text directly to an Obsidian note without changing the queue."""
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"message": "Please send JSON with a title and text."}), 400

    note_title = data.get("title", "")
    selected_text = data.get("text", "")

    if not isinstance(note_title, str) or note_title.strip() == "":
        return jsonify({"message": "Note title cannot be empty."}), 400

    if not isinstance(selected_text, str) or selected_text.strip() == "":
        return jsonify({"message": "Text cannot be empty."}), 400

    vault_path = get_saved_vault_path()

    if vault_path is None:
        return jsonify({"message": "Vault path is not set. Run an export command first or create vault_path.txt."}), 400

    if not vault_path.exists() or not vault_path.is_dir():
        return jsonify({"message": f"Vault path not found: {vault_path}"}), 400

    try:
        append_text_to_obsidian(vault_path, note_title, selected_text.strip("\r\n"))
    except ValueError as error:
        return jsonify({"message": str(error)}), 400

    return jsonify({"message": f"Exported to: {note_title}"}), 200


if __name__ == "__main__":
    app.run(host="localhost", port=5000)
