from pathlib import Path
import sys


CONFIG_FILE = Path(__file__).with_name("vault_path.txt")


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


def append_to_note(vault_path, note_title, text_to_append):
    """Create the note if needed, then append the new text."""
    note_filename = make_safe_filename(note_title)
    note_path = vault_path / note_filename

    if note_path.exists():
        with note_path.open("a", encoding="utf-8") as note_file:
            note_file.write("\n" + text_to_append + "\n")
        print(f"Appended text to: {note_path}")
    else:
        with note_path.open("w", encoding="utf-8") as note_file:
            note_file.write(text_to_append + "\n")
        print(f"Created note: {note_path}")


def main():
    if len(sys.argv) != 3:
        print('Usage: python export.py "Note Title" "Text to append"')
        return

    note_title = sys.argv[1]
    text_to_append = sys.argv[2]

    if note_title.strip() == "":
        print("Note title cannot be empty.")
        return

    vault_path = get_vault_path()

    if not vault_path.exists() or not vault_path.is_dir():
        print(f"Vault path not found: {vault_path}")
        print(f"Edit this file and enter the correct path: {CONFIG_FILE}")
        return

    append_to_note(vault_path, note_title, text_to_append)


if __name__ == "__main__":
    main()
