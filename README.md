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
- Preview AI summaries of highlighted webpage text or readable page content with `Alt+Shift+D`.
- View queued notes from the extension before exporting.
- Export selected queued notes without exporting the full queue.
- Delete individual queued notes or clear the full queue.
- Create new Obsidian notes from the extension.
- Pick existing Obsidian notes from the extension using a searchable flat list.
- Hide Obsidian `.trash` notes from the picker by default, with a Settings toggle to show them.
- Customize the extension popup with Color Palette settings and the Theme Editor.
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

AI summaries also require an OpenAI API key on the Flask server. See [AI_SUMMARY_SETUP.md](AI_SUMMARY_SETUP.md) for the Windows setup steps.

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

By default, `/notes` excludes notes inside any `.trash` folder in the vault. To include those notes in the API response, use:

```powershell
Invoke-RestMethod -Uri "http://localhost:5000/notes?includeTrash=true" -Method Get
```

This only affects which notes are listed. It does not delete, edit, move, export, or create `.trash` files.

Create a new Obsidian note through the API:

```powershell
Invoke-RestMethod -Uri http://localhost:5000/notes -Method Post -ContentType "application/json" -Body '{"title":"My New Note"}'
```

The `/notes` create endpoint accepts JSON in this format:

```json
{
  "title": "My New Note"
}
```

It creates a Markdown file in the configured Obsidian vault. Forward slashes create folders, so `Research/Anime/Ame Notes` creates `Research/Anime/Ame Notes.md` and creates missing folders automatically. If `.md` is already included, the server does not add it twice. Unsafe filename characters are replaced in each path segment. Path traversal, absolute paths, drive letters, and paths outside the configured vault are rejected. Existing notes are not overwritten; if a name already exists, the server creates a safe duplicate such as `My New Note 2` and returns the created note name.

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

Export selected queued notes through the API:

```powershell
Invoke-RestMethod -Uri http://localhost:5000/export-selected -Method Post -ContentType "application/json" -Body '{"title":"Project Notes","indexes":[0,2]}'
```

The `/export-selected` endpoint accepts JSON in this format:

```json
{
  "title": "Note Title",
  "indexes": [0, 2]
}
```

The indexes are zero-based queue positions. The endpoint exports only those queued notes, keeps them in their current queue order, and removes only the exported notes after a successful export. Unselected queued notes stay in `saved_notes.json`. If the export fails, the queue is left unchanged.

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
8. Use the search field to filter the Obsidian note picker.
9. Type a new note name in the search field, then press Enter to create it in the Obsidian vault.
10. Select a note and click Export Notes to export the saved notes.
11. Use the Queue tab to review queued notes before exporting.
12. On any webpage, select text or right-click a link to use the context menu actions.
13. Use `Alt+Shift+S` to save highlighted text, or the current page link when nothing is highlighted, to the queue.
14. Use `Alt+Shift+E` to export highlighted text, or the current page link when nothing is highlighted, directly to the selected note.
15. Use `Alt+Shift+D` to summarize highlighted webpage text, or the readable page content when nothing is highlighted.
16. Use `Alt+Shift+A` to open the extension popup.
17. Use the Settings tab to choose whether notes from `.trash` appear in the note picker and when selected notes are added to Recent Notes.

The extension popup normally has three tabs: Save / Export, Queue, and Settings. A temporary Summary tab appears when a summary is loading or available. The Save / Export tab contains the note textarea, Save Note button, note search/list picker, Export Notes button, and status messages. The Queue tab shows how many notes are waiting to be exported and displays them in a small scrollable list. Multiline notes keep their line breaks. If there are no queued notes, it shows `No queued notes.` The Settings tab contains preferences for Color Palette, showing or hiding notes from `.trash`, choosing when selected notes are added to Recent Notes, and adding capture date/time or source links to saved text.

Color Palette can be set to Afterglow, Ether, Pastel, Neon Rose, or a saved custom theme. Afterglow is the default dark red-to-purple gradient theme, Ether is a dark synth-inspired blue/violet/magenta theme, Pastel uses a softer pastel look, and Neon Rose uses a hot-pink/violet gradient style. These settings are saved in Chrome local storage and apply immediately.

The Settings tab also includes a collapsible Theme Editor. It edits whichever palette is selected in the main Color Palette dropdown. You can edit Background, Surface / card background, Border / focus color, Main text color, Gradient start, Gradient middle, and Gradient end with a color picker or hex field. The collapsible Danger Colors section controls Danger soft background, Danger text, and Neutral button background for destructive UI such as Clear Queue and confirmation buttons. Theme Editor changes are saved and stay active when you switch palettes until you use Reset `[Palette Name]`. Save as New Theme clones the current edited values into a new custom theme, switches to that new theme, and resets the source palette back to its saved default state. Custom themes appear in the Color Palette dropdown under Custom Themes, can be edited, reset to their saved starting values, and deleted with an inline confirmation. Built-in themes cannot be deleted, and reset restores their original built-in values.

The `Alt+Shift+D` shortcut first looks for highlighted webpage text. If text is highlighted, it summarizes only that selection. If nothing is highlighted, it tries to extract readable article or page content from the current tab. It does not summarize Chrome internal pages, extension pages, empty pages, or unusable URLs. When pressed, the extension stores a summary job in Chrome local storage, opens the normal popup, switches to the Summary tab, shows `Summarizing...`, and then displays the generated summary. The Summary tab labels the source as `Highlighted text` or `This page`, and the original text or extracted page content appears in a collapsed section. This first version is preview-only; it does not save or export the summary.

Pressing Enter in the note search field uses the current text as the new note name. It creates the Markdown file in the vault, refreshes the note picker, selects the new note, clears the search field, and saves the new note as the active selected destination. If the search field is empty, the extension shows `Type a note name first.` A folder path such as `Research/Ame Notes` creates `Research/Ame Notes.md`, including the folder when needed. Nested paths such as `Research/Anime/Ame Notes` work the same way and remain displayed in the flat picker. Creating a note does not add it to Recent Notes unless Add selected notes to Recents immediately is enabled. The new note can immediately be used for queued exports and direct selected-text exports.

Each queued note has a checkbox and a small trash button. Select one or more queued notes, then click Export Selected to export only those notes to the currently selected Obsidian note. The selected notes are removed from the queue after a successful export, and unselected notes stay queued. The Queue tab also has Select All, a selected-note count, and a Clear Queue button for deleting all queued notes. Clearing the full queue asks for confirmation inside the Queue tab before deleting anything. Deleting one note does not ask for confirmation.

The extension remembers the last note you selected. When the popup opens again, it selects that note automatically if it still exists in the vault. If that note no longer exists, the note picker falls back to the first available note.

The extension hides notes from the Obsidian `.trash` folder by default. In the Settings tab, turn on Show notes from `.trash` if you want those notes to appear in the picker and search results. This preference is saved in Chrome local storage. If a `.trash` note is selected and the setting is turned off, the extension clears that saved selection and refreshes the picker.

The extension also remembers up to 3 recent notes. Recent notes appear at the top of the picker under:

```text
--- Recent Notes ---
```

The rest of the vault appears under:

```text
--- All Notes ---
```

By default, Recent Notes are updated only after a successful export to that note. Browsing, searching, selecting, or creating a note does not add it to Recent Notes. In Settings, turn on Add selected notes to Recents immediately if you want selecting a note to add or move it to Recent Notes right away, matching the older behavior. Failed exports never add notes to Recent Notes. Recent notes are not duplicated in the All Notes section. If a recent note no longer exists in the vault, the extension removes it from the recent list.

The Add date and time to saved notes and Add source link to saved notes settings are both off by default and are stored in Chrome local storage. They apply immediately to popup saves, context-menu actions, and the `Alt+Shift+S` and `Alt+Shift+E` shortcuts. Date/time uses capture time in a format such as `6-24-26, 2:15 PM`. Source links use the active page title and URL, such as `[Page Title](https://example.com)`. When both are enabled, saved text looks like `Highlighted text – 6-24-26, 2:15 PM – [Page Title](https://example.com)`.

Capture information is added to the text when it is saved or directly exported. Queued notes therefore keep their original capture time and source even when exported later. Existing queued notes remain compatible and export without added metadata.

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

The search field filters the note picker results returned by that endpoint. Notes are shown as a flat list of relative vault paths, so notes inside folders appear like `Research/Book Notes`. Filtering keeps the remembered note selected when it is still visible in the filtered list, and the Recent Notes and All Notes sections update to match the search.

When Show notes from `.trash` is turned on, the popup requests:

```text
http://localhost:5000/notes?includeTrash=true
```

When the setting is off, `.trash` notes are excluded from the picker, search results, recent notes, and normal note lists.

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

The Export Selected button sends a POST request to:

```text
http://localhost:5000/export-selected
```

It sends the selected queue indexes and the currently selected Obsidian note title. This is separate from Export Notes: Export Selected removes only the selected queue items, while Export Notes still exports and clears the entire queue.

When text is selected on a webpage, the extension adds two context menu items:

```text
Save selected text to queue
Export selected text to last selected note
```

Save selected text to queue sends the selected text to `/save`, just like the Save Note button. It adds the selected text to `saved_notes.json` and does not export anything.

Export selected text to last selected note sends the selected text to `/export-direct`. It appends only that selected text to the active destination stored as `activeSelectedNote`, which is updated immediately whenever you select a note in the popup. Recent Notes are export history and are not used to choose the direct-export destination. Direct export does not read queued notes, does not export queued notes, and does not clear `saved_notes.json`. After a successful direct export, that destination is added to Recent Notes.

When you right-click an HTTP or HTTPS link, the extension also shows Save link to queue and Export link to selected Obsidian note. These actions save the destination as a Markdown link using visible link text when available, with the page title or `Source` as a fallback. Browser-internal and extension URLs are not saved.

If no last selected note exists, the extension shows a notification telling you to select a note in the extension first. Success and error messages appear as Chrome notifications. Successful direct exports include the destination note name when possible, such as `Exported to: Project Notes`.

The keyboard shortcuts use the same logic as the context menu actions. `Alt+Shift+S` sends highlighted text to `/save`. `Alt+Shift+E` sends highlighted text to `/export-direct` using the current note selection saved in `activeSelectedNote`. When no webpage text is highlighted, either shortcut falls back to the active tab's HTTP or HTTPS URL and formats it as `[Page Title](URL)`. Chrome address-bar text is never read directly. Browser-internal, extension, empty, and unusable URLs are rejected. Direct export does not fall back to Recent Notes and never reads, exports, or clears queued notes. `Alt+Shift+A` uses Chrome's built-in extension action command to open the existing popup. Shortcuts can be changed or assigned manually at `chrome://extensions/shortcuts`.

`Alt+Shift+D` sends highlighted text or extracted readable page content to `/summarize` through the local Flask server. Page extraction prefers `article`, `main`, likely content containers, and then cleaned body text. The extension includes the page title and URL as metadata, caps page text before sending it to Flask, and asks you to highlight text if readable content cannot be found. The OpenAI API key is read only from the server-side `OPENAI_API_KEY` environment variable. The key is never stored in the Chrome extension, frontend JavaScript, `manifest.json`, or project files.

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

`server.py` starts a local Flask server on `localhost:5000`. Its `/save` endpoint accepts JSON, checks that the note is present, saves it to `saved_notes.json`, and returns a JSON success message. Its `/summarize` endpoint accepts text plus optional title, URL, and mode, reads `OPENAI_API_KEY` from the local server environment, calls the OpenAI Responses API with `gpt-5.4-mini` by default, and returns a concise summary without changing the queue or any Obsidian note. Long summary text is split into chunks first, then combined into one final summary. `GET /notes` lists Markdown notes from the saved Obsidian vault path, excluding `.trash` folders by default unless `includeTrash=true` is used. `POST /notes` creates a new Markdown note in that vault. Its `/queue` endpoint returns the notes waiting in `saved_notes.json`. `DELETE /queue/<index>` removes one queued note by zero-based index, and `DELETE /queue` clears the full queue. Its `/export` endpoint accepts an Obsidian note title, exports all saved notes to that note, clears `saved_notes.json`, and returns how many notes were exported. Its `/export-selected` endpoint accepts a note title and selected queue indexes, exports only those queued notes, and removes only those exported notes after success. Its `/export-direct` endpoint accepts a note title and text, then appends only that text to the chosen Obsidian note without changing the queue.

The `extension` folder contains a basic Chrome extension. `manifest.json` describes the extension, allows it to call the local Flask server, gives it permission to use local extension storage, adds context menus, enables notifications, and registers keyboard shortcuts. `popup.html` creates the popup tabs, note textarea, search input, flat note picker, queued notes list, queue selection controls, queue management buttons, Summary tab, Color Palette controls, Theme Editor, Settings checkboxes, and status messages. `popup.js` switches tabs, loads notes from `/notes`, applies the saved palette and custom theme colors, applies the saved `.trash` visibility setting, applies the saved Recent Notes behavior, renders summary loading/results from Chrome storage, creates new notes with `POST /notes`, loads queued notes from `/queue`, restores the last selected note from Chrome storage, keeps a cleaned list of up to 3 recent notes, filters notes as you type, saves the last selected note when it changes, sends note text to `/save`, sends the selected note to `/export`, sends selected queue indexes to `/export-selected`, updates Recent Notes according to the saved setting and successful exports, deletes queued notes, clears the queue, refreshes the queued notes list after queue changes, and shows whether each action worked.

`background.js` creates the selected-text context menu items and keyboard shortcuts. It sends selected text to `/save` for queueing, sends direct exports to `/export-direct`, and sends highlighted text or extracted page content to `/summarize` for preview summaries. It uses Chrome notifications for save/export messages and Chrome local storage for summary state.

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
