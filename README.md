# Obsidian Note Exporter

A beginner-friendly Python command-line project for saving short notes and exporting them into an Obsidian vault.

## Features

- Save notes locally in `saved_notes.json`.
- List saved notes before exporting them.
- Export saved notes into an Obsidian Markdown note.
- Append text directly to an Obsidian note.
- Create the Obsidian note if it does not already exist.
- Handle missing, empty, invalid, or unexpected `saved_notes.json` data gracefully.
- Reject empty note text and empty note titles.
- Use only Python's standard library.

## Quick Start

Open a terminal in this folder.

Save a note:

```powershell
python save_note.py "Follow up on the project timeline."
```

List saved notes:

```powershell
python list_notes.py
```

Export all saved notes into an Obsidian note:

```powershell
python export_notes.py "Meeting Notes"
```

The first time an export command needs your Obsidian vault, it asks for the vault path and saves it in `vault_path.txt`.

## Commands

Save one note to `saved_notes.json`:

```powershell
python save_note.py "my note"
```

If the note is saved, the script prints:

```text
Note saved
```

Empty note text is rejected:

```text
Note text cannot be empty.
```

List all currently saved notes:

```powershell
python list_notes.py
```

Example output:

```text
1. Follow up on the project timeline.
2. Review the research notes before Friday.
```

If there are no saved notes, the script prints:

```text
No saved notes.
```

Export all saved notes into one Obsidian note:

```powershell
python export_notes.py "Note Title"
```

The exported notes are written exactly as they were saved. Notes in the same export are separated with one blank line:

```markdown
Follow up on the project timeline.

Review the research notes before Friday.
```

Separate export runs are also separated by exactly one blank line. Empty notes do not get a blank line at the top.

After a successful export, `saved_notes.json` is cleared back to an empty list.

If there are no saved notes to export, the script prints:

```text
No notes to export.
```

If notes are exported, the script prints how many were exported:

```text
3 notes exported.
```

Append text directly to an Obsidian note:

```powershell
python export.py "Note Title" "Text to append"
```

If the note does not exist, it is created. If it already exists, the text is added to the end.

Empty note titles are rejected by `export.py` and `export_notes.py`:

```text
Note title cannot be empty.
```

## How It Works

`save_note.py` reads `saved_notes.json`, adds the new note to the list, and writes the list back to the file.

`list_notes.py` reads `saved_notes.json` and prints each saved note with a number. Multiline notes keep their line breaks when displayed.

`export_notes.py` reads all saved notes, finds the selected Obsidian note, appends the saved notes, and then clears `saved_notes.json`.

`export.py` appends one piece of text directly to an Obsidian note without using the saved-notes queue.

The scripts are intentionally simple and beginner-friendly. They use `pathlib` for file paths, `json` for saved note data, and `sys.argv` for command-line input.

## Runtime Files

The project uses two small runtime files:

- `vault_path.txt` stores the path to your Obsidian vault.
- `saved_notes.json` stores notes waiting to be exported.

These files are created or used while the scripts run. They may contain personal data, such as your local vault path or private notes, so they should not be committed to Git or shared publicly.

If `saved_notes.json` is missing, empty, invalid JSON, or does not contain a list, the scripts handle it gracefully and treat it as empty.

## Project Status

This is a lightweight command-line utility for capturing and exporting notes to Obsidian.
