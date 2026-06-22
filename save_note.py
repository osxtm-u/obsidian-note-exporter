from pathlib import Path
import json
import sys


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
        print("saved_notes.json could not be read, so a new notes list will be started.")
        return []

    if not isinstance(notes, list):
        print("saved_notes.json did not contain a list, so a new notes list will be started.")
        return []

    return notes


def save_notes(notes):
    """Save the notes list to the JSON file."""
    notes_text = json.dumps(notes, indent=2)
    NOTES_FILE.write_text(notes_text, encoding="utf-8")


def main():
    if len(sys.argv) != 2:
        print('Usage: python save_note.py "my note"')
        return

    note_text = sys.argv[1].strip()

    if note_text == "":
        print("Note text cannot be empty.")
        return

    notes = load_notes()
    notes.append(note_text)
    save_notes(notes)

    print("Note saved")


if __name__ == "__main__":
    main()
