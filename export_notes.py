from pathlib import Path
import json
import sys


CONFIG_FILE = Path(__file__).with_name("vault_path.txt")
NOTES_FILE = Path(__file__).with_name("saved_notes.json")


def get_vault_path():
    """Load the saved vault path, or ask for it the first time."""
    if CONFIG_FILE.exists():
        saved_path = CONFIG_FILE.read_text(encoding="utf-8").strip()
        return Path(saved_path)

    vault_path_text = input("Enter the path to your Obsidian vault: ").strip()
    vault_path = Path(vault_path_text)

    CONFIG_FILE.write_text(str(vault_path), encoding="utf-8")
    return vault_path


def make_safe_filename(note_title):
    """Turn a note title into a simple Markdown filename."""
    unsafe_characters = '<>:"/\\|?*'
    filename = note_title.strip()

    for character in unsafe_characters:
        filename = filename.replace(character, "_")

    if not filename.endswith(".md"):
        filename = filename + ".md"

    return filename


def load_saved_notes():
    """Read saved notes, or create the file with an empty list."""
    if not NOTES_FILE.exists():
        NOTES_FILE.write_text("[]", encoding="utf-8")
        return []

    notes_text = NOTES_FILE.read_text(encoding="utf-8").strip()

    if notes_text == "":
        return []

    try:
        notes = json.loads(notes_text)
    except json.JSONDecodeError:
        print("saved_notes.json could not be read.")
        return []

    if not isinstance(notes, list):
        print("saved_notes.json did not contain a list.")
        return []

    return notes


def clear_saved_notes():
    """Clear saved_notes.json after a successful export."""
    NOTES_FILE.write_text("[]", encoding="utf-8")


def append_notes_to_obsidian(vault_path, note_title, saved_notes):
    """Append all saved notes to one Obsidian Markdown note."""
    note_filename = make_safe_filename(note_title)
    note_path = vault_path / note_filename
    text_to_append = "\n\n".join(saved_notes)

    if note_path.exists():
        existing_text = note_path.read_text(encoding="utf-8")

        if existing_text.strip() == "":
            new_text = text_to_append
        else:
            new_text = existing_text.rstrip("\n") + "\n\n" + text_to_append
    else:
        new_text = text_to_append

    note_path.write_text(new_text + "\n", encoding="utf-8")


def main():
    if len(sys.argv) != 2:
        print('Usage: python export_notes.py "Note Title"')
        return

    note_title = sys.argv[1]

    if note_title.strip() == "":
        print("Note title cannot be empty.")
        return

    saved_notes = load_saved_notes()

    if len(saved_notes) == 0:
        print("No notes to export.")
        return

    vault_path = get_vault_path()

    if not vault_path.exists() or not vault_path.is_dir():
        print(f"Vault path not found: {vault_path}")
        print(f"Edit this file and enter the correct path: {CONFIG_FILE}")
        return

    append_notes_to_obsidian(vault_path, note_title, saved_notes)
    clear_saved_notes()

    print(f"{len(saved_notes)} notes exported.")


if __name__ == "__main__":
    main()
