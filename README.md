# Obsidian Note Exporter

A beginner-friendly Python command-line project for saving short notes and exporting them into an Obsidian vault.

## Features

- Save notes locally in `saved_notes.json`.
- List saved notes before exporting them.
- Export saved notes into an Obsidian Markdown note.
- Append text directly to an Obsidian note.
- Save notes through a local Flask API at `http://localhost:5000/save`.
- Save and export notes from a basic Chrome extension popup.
- Save or directly export selected webpage text from Chrome context menus.
- View queued notes from the extension before exporting.
- Delete individual queued notes or clear the full queue.
- Pick existing Obsidian notes from the extension using a searchable dropdown.
- Remember the last selected Obsidian note and the 3 most recent notes in the extension.
- Create the Obsidian note if it does not already exist.
- Handle missing, empty, invalid, or unexpected `saved_notes.json` data gracefully.
- Reject empty note text and empty note titles.
- Keep the code simple and beginner-friendly.

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

The command-line scripts use Python's standard library. The local server uses Flask. Install Flask before running `server.py`:

```powershell
python -m pip install Flask
```

To use the Chrome extension, start the Flask server first:

```powershell
python server.py
```

Then load the `extension` folder in Chrome as an unpacked extension.

If the extension was already loaded before these features were added, reload it from `chrome://extensions` so Chrome picks up the new context menu and notification permissions.

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

Run the local Flask server:

```powershell
python server.py
```

The server runs at:

```text
http://localhost:5000
```

List Obsidian notes through the API:

```powershell
Invoke-RestMethod -Uri http://localhost:5000/notes -Method Get
```

The `/notes` endpoint reads the saved vault path from `vault_path.txt`, finds Markdown files in the vault and its subfolders, and returns note names without `.md`:

```json
{
  "notes": [
    "Meeting Notes",
    "Projects/Obsidian Exporter",
    "Research/Book Notes"
  ]
}
```

If `vault_path.txt` is missing or the vault folder cannot be found, the server returns a clear error message and an empty notes list.

List queued notes through the API:

```powershell
Invoke-RestMethod -Uri http://localhost:5000/queue -Method Get
```

The `/queue` endpoint reads `saved_notes.json` and returns the notes currently waiting to be exported:

```json
{
  "notes": [
    "note 1",
    "note 2"
  ]
}
```

If `saved_notes.json` is missing, empty, invalid JSON, or does not contain a list, the endpoint handles it gracefully and returns an empty notes list.

Delete one queued note by its zero-based index:

```powershell
Invoke-RestMethod -Uri http://localhost:5000/queue/0 -Method Delete
```

If the index exists, the server deletes only that queued note and returns a success message. If the index does not exist, it returns a clear error message.

Clear all queued notes:

```powershell
Invoke-RestMethod -Uri http://localhost:5000/queue -Method Delete
```

This clears `saved_notes.json` without changing any Obsidian notes, recent notes, or the last selected note.

Save a note through the API:

```powershell
Invoke-RestMethod -Uri http://localhost:5000/save -Method Post -ContentType "application/json" -Body '{"note":"Review the project notes."}'
```

The `/save` endpoint accepts JSON in this format:

```json
{
  "note": "text"
}
```

If the note is saved, the server returns:

```json
{
  "message": "Note saved"
}
```

If the JSON is missing or the note is empty, the server returns a clear error message.

Export saved notes through the API:

```powershell
Invoke-RestMethod -Uri http://localhost:5000/export -Method Post -ContentType "application/json" -Body '{"title":"Project Notes"}'
```

The `/export` endpoint accepts JSON in this format:

```json
{
  "title": "Note Title"
}
```

The endpoint exports all saved notes to the requested Obsidian note using the same formatting rules as `export_notes.py`. If the title is empty, the vault path is missing, or there are no saved notes, the server returns a clear error message.

Export text directly through the API without using the queue:

```powershell
Invoke-RestMethod -Uri http://localhost:5000/export-direct -Method Post -ContentType "application/json" -Body '{"title":"Project Notes","text":"Selected text from a webpage."}'
```

The `/export-direct` endpoint accepts JSON in this format:

```json
{
  "title": "Note Title",
  "text": "selected text"
}
```

This endpoint appends only the provided text to the requested Obsidian note. It does not read from `saved_notes.json`, does not export queued notes, and does not clear the queue.

Use the Chrome extension:

1. Open Chrome and go to `chrome://extensions`.
2. Turn on Developer mode.
3. Click Load unpacked.
4. Select the `extension` folder in this project.
5. Make sure the Flask server is running with `python server.py`.
6. Open the extension popup.
7. Use the Save / Export tab to type a note and click Save Note.
8. Use the search field to filter the Obsidian note dropdown.
9. Select a note and click Export Notes to export the saved notes.
10. Use the Queue tab to review queued notes before exporting.
11. On any webpage, select text and right-click to use the context menu actions.

The extension popup has two tabs: Save / Export and Queue. The Save / Export tab contains the note textarea, Save Note button, note search/dropdown, Export Notes button, and status messages. The Queue tab shows how many notes are waiting to be exported and displays them in a small scrollable list. Multiline notes keep their line breaks. If there are no queued notes, it shows `No queued notes.`

Each queued note has a small trash button that deletes only that note. The Queue tab also has a Clear Queue button for deleting all queued notes. Clearing the full queue asks for confirmation first. Deleting one note does not ask for confirmation.

The extension remembers the last note you selected. When the popup opens again, it selects that note automatically if it still exists in the vault. If that note no longer exists, the dropdown falls back to the first available note.

The extension also remembers the 3 most recently selected or exported notes. Recent notes appear at the top of the dropdown under:

```text
--- Recent Notes ---
```

The rest of the vault appears under:

```text
--- All Notes ---
```

Recent notes are not duplicated in the All Notes section. If a recent note no longer exists in the vault, the extension removes it from the recent list.

The Save Note button sends a POST request to:

```text
http://localhost:5000/save
```

It sends JSON in this format:

```json
{
  "note": "text"
}
```

If the save works, the popup shows a success message. If the note is empty or the Flask server is not running, it shows an error message.

When the popup opens, it sends a GET request to:

```text
http://localhost:5000/notes
```

The search field filters the dropdown options returned by that endpoint. Filtering keeps the remembered note selected when it is still visible in the filtered list, and the Recent Notes and All Notes sections update to match the search.

The popup also sends a GET request to:

```text
http://localhost:5000/queue
```

The queued notes list refreshes when the popup opens, when the Queue tab is opened, after saving a note, and after exporting notes.

It also refreshes after deleting a single queued note or clearing the full queue.

The Export Notes button sends a POST request to:

```text
http://localhost:5000/export
```

It sends JSON in this format:

```json
{
  "title": "Note Title"
}
```

If the export works, the popup shows how many notes were exported. If no note is selected, there are no saved notes, or the Flask server is not running, it shows an error message.

When text is selected on a webpage, the extension adds two context menu items:

```text
Save selected text to queue
Export selected text to last selected note
```

Save selected text to queue sends the selected text to `/save`, just like the Save Note button. It adds the selected text to `saved_notes.json` and does not export anything.

Export selected text to last selected note sends the selected text to `/export-direct`. It appends only that selected text to the most recently selected or exported Obsidian note. It does not read queued notes, does not export queued notes, and does not clear `saved_notes.json`.

If no last selected note exists, the extension shows a notification telling you to select a note in the extension first. Success and error messages appear as Chrome notifications. Successful direct exports include the destination note name when possible, such as `Exported to: Project Notes`.

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

The exported notes are written exactly as they were saved. Notes in the same export are joined with one newline:

```markdown
Follow up on the project timeline.
Review the research notes before Friday.
```

Separate export runs are separated by exactly one blank line. Empty notes do not get a blank line at the top.

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

Empty note titles are rejected by `export.py`, `export_notes.py`, and the server `/export` endpoint:

```text
Note title cannot be empty.
```

## How It Works

`save_note.py` reads `saved_notes.json`, adds the new note to the list, and writes the list back to the file.

`server.py` starts a local Flask server on `localhost:5000`. Its `/save` endpoint accepts JSON, checks that the note is present, saves it to `saved_notes.json`, and returns a JSON success message. Its `/notes` endpoint lists Markdown notes from the saved Obsidian vault path. Its `/queue` endpoint returns the notes waiting in `saved_notes.json`. `DELETE /queue/<index>` removes one queued note by zero-based index, and `DELETE /queue` clears the full queue. Its `/export` endpoint accepts an Obsidian note title, exports all saved notes to that note, clears `saved_notes.json`, and returns how many notes were exported. Its `/export-direct` endpoint accepts a note title and text, then appends only that text to the chosen Obsidian note without changing the queue.

The `extension` folder contains a basic Chrome extension. `manifest.json` describes the extension, allows it to call the local Flask server, gives it permission to use local extension storage, adds context menus, and enables notifications. `popup.html` creates the two-tab popup, note textarea, search input, note dropdown, queued notes list, queue management buttons, and status message. `popup.js` switches tabs, loads notes from `/notes`, loads queued notes from `/queue`, restores the last selected note from Chrome storage, keeps a cleaned list of the 3 most recent notes, filters notes as you type, saves the selected note when it changes, sends note text to `/save`, sends the selected note to `/export`, deletes queued notes, clears the queue, refreshes the queued notes list after queue changes, and shows whether each action worked.

`background.js` creates the selected-text context menu items. It sends selected text to `/save` for queueing, or to `/export-direct` for direct export to the last selected note. It uses Chrome notifications for success and error messages.

`list_notes.py` reads `saved_notes.json` and prints each saved note with a number. Multiline notes keep their line breaks when displayed.

`export_notes.py` reads all saved notes, finds the selected Obsidian note, appends the saved notes, and then clears `saved_notes.json`.

`export.py` appends one piece of text directly to an Obsidian note without using the saved-notes queue.

The scripts are intentionally simple and beginner-friendly. They use `pathlib` for file paths, `json` for saved note data, `sys.argv` for command-line input, and Flask for the local server endpoint.

## Runtime Files

The project uses two small runtime files:

- `vault_path.txt` stores the path to your Obsidian vault.
- `saved_notes.json` stores notes waiting to be exported.

These files are created or used while the scripts run. They may contain personal data, such as your local vault path or private notes, so they should not be committed to Git or shared publicly.

If `saved_notes.json` is missing, empty, invalid JSON, or does not contain a list, the scripts handle it gracefully and treat it as empty.

## Project Status

This is a lightweight command-line utility for capturing and exporting notes to Obsidian.
