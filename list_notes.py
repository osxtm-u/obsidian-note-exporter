from pathlib import Path
import json


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
        print("saved_notes.json could not be read.")
        return []

    if not isinstance(notes, list):
        print("saved_notes.json did not contain a list.")
        return []

    return notes


def main():
    notes = load_notes()

    if len(notes) == 0:
        print("No saved notes.")
        return

    for number, note in enumerate(notes, start=1):
        print(f"{number}. {note}")


if __name__ == "__main__":
    main()
