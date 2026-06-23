from pathlib import Path
import json

from flask import Flask, jsonify, request


app = Flask(__name__)
CONFIG_FILE = Path(__file__).with_name("vault_path.txt")
NOTES_FILE = Path(__file__).with_name("saved_notes.json")


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

        if safe_part != "":
            safe_parts.append(safe_part)

    filename = safe_parts[-1]

    if not filename.endswith(".md"):
        safe_parts[-1] = filename + ".md"

    return Path(*safe_parts)


def list_vault_notes(vault_path):
    """Find all Markdown notes in the Obsidian vault."""
    note_names = []

    for note_path in vault_path.rglob("*.md"):
        relative_path = note_path.relative_to(vault_path)
        note_name = relative_path.with_suffix("").as_posix()
        note_names.append(note_name)

    note_names.sort(key=str.lower)
    return note_names


def append_text_to_obsidian(vault_path, note_title, text_to_append):
    """Append text to one Obsidian Markdown note as a separate export run."""
    note_path = vault_path / make_safe_path(note_title)

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


@app.get("/notes")
def get_notes():
    """Return all Markdown notes in the saved Obsidian vault."""
    vault_path = get_saved_vault_path()

    if vault_path is None:
        return jsonify({"message": "Vault path is not set.", "notes": []}), 400

    if not vault_path.exists() or not vault_path.is_dir():
        return jsonify({"message": f"Vault path not found: {vault_path}", "notes": []}), 400

    note_names = list_vault_notes(vault_path)
    return jsonify({"notes": note_names}), 200


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

    append_notes_to_obsidian(vault_path, note_title, saved_notes)
    clear_saved_notes()

    return jsonify({"message": f"{len(saved_notes)} notes exported."}), 200


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

    append_text_to_obsidian(vault_path, note_title, selected_text.strip("\r\n"))

    return jsonify({"message": f"Exported to: {note_title}"}), 200


if __name__ == "__main__":
    app.run(host="localhost", port=5000)
