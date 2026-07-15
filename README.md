# Obsidian Note Exporter

Obsidian Note Exporter is a lightweight Chrome extension and local Python companion server for saving webpage text, links, and quick notes into an Obsidian vault.

The Chrome extension gives you a popup, queue, context-menu actions, keyboard shortcuts, themes, and optional AI summary previews. The local Flask server runs on your computer at `http://localhost:5000` and handles writing notes to your Obsidian vault.

> **Important:** The Chrome extension requires the local Flask server to be running. The extension cannot write directly to your Obsidian vault by itself.

## Features

- Save short notes to a local queue.
- Export all queued notes to an Obsidian Markdown note.
- Export selected queued notes without clearing the full queue.
- Directly append selected webpage text to the currently selected Obsidian note.
- Save or export links as Markdown links.
- Create new Obsidian notes from the extension.
- Pick existing Obsidian notes from a searchable flat list.
- Hide Obsidian `.trash` notes by default, with a setting to show them.
- Remember the active selected note and up to 3 recent notes.
- Add optional capture date/time and source links to saved text.
- Preview optional AI summaries with `Alt+Shift+D`.
- Customize the popup with built-in themes and saved custom themes.
- Store user settings locally with `chrome.storage.local`.

## How it works

The project has two parts:

1. **Chrome extension**  
   The extension UI lives in the `extension` folder. It provides the popup, queue, settings, context menus, keyboard shortcuts, notifications, themes, and summary preview UI.

2. **Local Flask server**  
   The server runs locally on your computer at `http://localhost:5000`. It receives requests from the extension, reads or writes local runtime files, and appends content to Markdown notes in your Obsidian vault.

Normal note saving and exporting stays on your computer. The only time note/page content is sent to an external service is when you use the optional AI summary feature.

## Requirements

- Google Chrome or another Chromium-based browser that supports Chrome extensions.
- Python 3.
- Obsidian installed with an existing vault.
- Flask for the local server.
- Optional: an OpenAI API key for AI summary previews.

The command-line note scripts use Python's standard library. The local server requires Flask. AI summaries require a server-side `OPENAI_API_KEY`; see `AI_SUMMARY_SETUP.md` for setup steps.

## Quick start

Open a terminal in the project folder.

Install Flask:

```powershell
python -m pip install Flask
```

Start the local server:

```powershell
python server.py
```

The server runs at:

```text
http://localhost:5000
```

The command-line export scripts can prompt for your Obsidian vault path and save it in `vault_path.txt`. The Flask server reads that file; it does not prompt for the path itself. For extension use, make sure `vault_path.txt` exists in the project folder and contains the full path to your Obsidian vault.

Example `vault_path.txt` on Windows:

```text
C:\Users\YourName\Documents\Obsidian Vault
```

To check that the server can see your notes, open or request:

```text
http://localhost:5000/notes
```

If the server is working and your vault path is set, this returns a list of Markdown notes from your vault.

## Load the Chrome extension during development

1. Open Chrome.
2. Go to `chrome://extensions`.
3. Turn on **Developer mode**.
4. Click **Load unpacked**.
5. Select the `extension` folder in this project.
6. Make sure the Flask server is running with `python server.py`.
7. Open the extension popup.

If you change extension files, reload the extension from `chrome://extensions`. If you change backend/server files, restart the Flask server.

## Basic usage

### Save a note from the command line

```powershell
python save_note.py "Follow up on the project timeline."
```

### List queued notes

```powershell
python list_notes.py
```

### Export queued notes to Obsidian

```powershell
python export_notes.py "Meeting Notes"
```

After a successful export, `saved_notes.json` is cleared back to an empty list.

### Append text directly to an Obsidian note

```powershell
python export.py "Meeting Notes" "Text to append"
```

If the note does not exist, it is created. If it already exists, the text is added to the end.

## Extension shortcuts

Default shortcuts:

- `Alt+Shift+A` - open the extension popup.
- `Alt+Shift+S` - save highlighted text to the queue. If no text is highlighted, save the current page as a Markdown link.
- `Alt+Shift+E` - export highlighted text directly to the active selected Obsidian note. If no text is highlighted, export the current page as a Markdown link.
- `Alt+Shift+D` - summarize highlighted text, or summarize readable page content when nothing is highlighted.

Chrome shortcuts can be changed at:

```text
chrome://extensions/shortcuts
```

## Extension tabs

### Save / Export

Use this tab to write a note, save it to the queue, pick an Obsidian note, create a new note, and export queued notes.

The note picker shows up to 3 recent notes at the top and the rest of the vault underneath. Notes inside folders appear as relative paths, such as:

```text
Research/Book Notes
```

Typing a new note name into the search field and pressing Enter creates a new Markdown note in the vault. Folder paths work too, so this creates a note inside nested folders:

```text
Research/Anime/Ame Notes
```

### Queue

Use this tab to review queued notes before exporting. You can:

- export the full queue,
- select and export only specific queued notes,
- delete one queued note,
- or clear the full queue after inline confirmation.

Direct export is separate from the queue. Direct export does not read, export, or clear queued notes.

### Settings

Use this tab to customize behavior and appearance:

- show or hide `.trash` notes,
- choose when notes are added to Recent Notes,
- add capture date/time to saved notes,
- add source links to saved notes,
- choose a Color Palette,
- edit theme colors,
- save custom themes.

Theme settings are saved in Chrome local storage and apply immediately.

## AI summary previews

AI summaries are optional. They require an OpenAI API key set on the local Flask server side.

The extension does not store the API key in Chrome storage, frontend JavaScript, `manifest.json`, or project files. The server reads it from the local `OPENAI_API_KEY` environment variable.

`Alt+Shift+D` works like this:

1. If text is highlighted, the extension summarizes only the highlighted text.
2. If no text is highlighted, the extension tries to extract readable page content.
3. The extension sends the text to the local Flask server at `/summarize`.
4. The local server sends the text to OpenAI using your own API key.
5. The extension shows the result in a temporary Summary tab.

The first version is preview-only. It does not save or export the summary automatically.

For setup steps, see:

```text
AI_SUMMARY_SETUP.md
```

## Local runtime files

The project uses these local runtime files:

- `vault_path.txt` - stores the path to your Obsidian vault.
- `saved_notes.json` - stores notes waiting to be exported.

These files may contain personal data, such as your local vault path or private notes. Do not commit them to Git or share them publicly.

If `saved_notes.json` is missing, empty, invalid JSON, or does not contain a list, the scripts and server treat it as an empty queue.

## Privacy notes

Normal save, queue, export, note picker, theme, and settings behavior stays local.

Data stored locally:

- Queued notes are stored in `saved_notes.json`.
- The Obsidian vault path is stored in `vault_path.txt`.
- Recent notes, active selected note, settings, themes, and summary UI state are stored in `chrome.storage.local`.

Data sent locally:

- The extension sends requests to the local Flask server at `http://localhost:5000`.
- The server writes to local files and to the configured Obsidian vault.

Data sent externally:

- AI summary content is sent to OpenAI only when the user uses the summary feature.
- The PayPal donate button opens an external PayPal page. It does not send note content.

For a fuller public policy, use a separate `PRIVACY_POLICY.md` or hosted privacy-policy page.

## API endpoints

The local Flask server provides these endpoints.

### `GET /notes`

Lists Markdown notes from the configured Obsidian vault.

By default, `.trash` folders are excluded. To include them:

```text
http://localhost:5000/notes?includeTrash=true
```

### `POST /notes`

Creates a new Markdown note in the configured Obsidian vault.

```json
{
  "title": "Research/Ame Notes"
}
```

Forward slashes create folders. Unsafe filename characters are replaced. Path traversal, absolute paths, drive letters, and paths outside the configured vault are rejected.

### `GET /queue`

Returns notes currently waiting in `saved_notes.json`.

### `DELETE /queue/<index>`

Deletes one queued note by zero-based index.

### `DELETE /queue`

Clears the full queue without changing any Obsidian notes.

### `POST /save`

Saves text to the queue.

```json
{
  "note": "Review the project notes."
}
```

### `POST /export`

Exports all queued notes to the selected Obsidian note and clears the queue after success.

```json
{
  "title": "Project Notes"
}
```

### `POST /export-selected`

Exports only selected queued notes and removes only those notes after success.

```json
{
  "title": "Project Notes",
  "indexes": [0, 2]
}
```

### `POST /export-direct`

Appends text directly to the selected Obsidian note without reading or clearing the queue.

```json
{
  "title": "Project Notes",
  "text": "Selected text from a webpage."
}
```

### `POST /summarize`

Summarizes highlighted text or extracted readable page content through the local server using the server-side `OPENAI_API_KEY`.

## Project files

- `server.py` - local Flask server.
- `save_note.py` - saves a note to `saved_notes.json`.
- `list_notes.py` - lists queued notes.
- `export_notes.py` - exports queued notes to Obsidian and clears the queue after success.
- `export.py` - appends one piece of text directly to an Obsidian note.
- `extension/` - Chrome extension files.
- `vault_path.txt` - local runtime vault path file. Do not commit.
- `saved_notes.json` - local runtime queue file. Do not commit.

## Chrome Web Store note

For Chrome Web Store publishing, the extension package should contain the Chrome extension files from the `extension` folder.

The Flask server is a separate local companion server. Users need to install and run it separately for the extension to write to their Obsidian vault.

## Troubleshooting

### The extension says the server is not running

Start the local server:

```powershell
python server.py
```

Then test:

```text
http://localhost:5000/notes
```

### No Obsidian notes appear

Make sure `vault_path.txt` exists and points to the correct Obsidian vault folder.

### `.trash` notes are missing

This is expected by default. Turn on the `.trash` setting in the extension, or request:

```text
http://localhost:5000/notes?includeTrash=true
```

### AI summaries do not work

Make sure the local server has `OPENAI_API_KEY` set. See `AI_SUMMARY_SETUP.md`.

### Keyboard shortcuts do not work

Check or reassign shortcuts at:

```text
chrome://extensions/shortcuts
```

## Project status

Obsidian Note Exporter is a lightweight local-first tool for capturing webpage text, links, quick notes, and optional summary previews into an Obsidian vault.

## Support

For support, bug reports, or feature requests, please open an issue on GitHub:

https://github.com/osxtm-u/obsidian-note-exporter/issues

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
