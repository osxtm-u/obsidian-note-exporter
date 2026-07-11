# Local Server Setup

Obsidian Note Exporter uses a small local Flask server to connect the Chrome extension to your Obsidian vault.

The Chrome extension itself runs in Chrome, but Chrome extensions cannot directly write to files inside your Obsidian vault. The local server runs on your own computer at `http://localhost:5000` and handles the local file work.

## What the local server does

The local server can:

- save queued notes to `saved_notes.json`
- list Markdown notes from your Obsidian vault
- create new Markdown notes in your vault
- export queued notes into a selected Obsidian note
- export selected webpage text directly into a selected Obsidian note
- optionally send highlighted text or readable page content to OpenAI for AI summary previews, if you set up your own API key

Normal note saving and exporting stays on your computer. AI summaries are the only feature that can send note or page content outside your computer, and only when you use the summary feature.

## Requirements

You need:

- Python installed
- Flask installed
- the Obsidian Note Exporter project files
- an Obsidian vault on your computer
- Chrome with the extension installed or loaded unpacked

AI summaries are optional. They require your own `OPENAI_API_KEY` set on the local server side.

Check the project README or `AI_SUMMARY_SETUP.md` for the exact AI setup steps.

## 1. Install Python

Download and install Python from the official Python website.

During installation on Windows, turn on:

```text
Add python.exe to PATH
```

After installing, open a terminal and check:

```powershell
python --version
```

If that does not work, try:

```powershell
py --version
```

## 2. Open the project folder

Open a terminal in the main project folder, not the `extension` folder.

The main project folder should contain files such as:

```text
server.py
save_note.py
export_notes.py
saved_notes.json
extension/
```

## 3. Install server dependencies

Install Flask:

```powershell
python -m pip install Flask
```

If the project includes a `requirements.txt` file, you can use that instead:

```powershell
python -m pip install -r requirements.txt
```

## 4. Set your Obsidian vault path

The local server reads your vault path from this file:

```text
vault_path.txt
```

The first time an export command needs your vault, the project may ask for your Obsidian vault path and save it there.

You can also create or edit `vault_path.txt` yourself. It should contain the full path to your Obsidian vault.

Example on Windows:

```text
C:\Users\YourName\Documents\Obsidian Vault
```

Example on macOS or Linux:

```text
/Users/YourName/Documents/Obsidian Vault
```

Do not commit or share `vault_path.txt`. It may reveal private information about your computer or folders.

## 5. Start the local server

From the main project folder, run:

```powershell
python server.py
```

The server should run at:

```text
http://localhost:5000
```

Keep the terminal window open while using the extension. If the server stops, the extension will not be able to save, list, create, or export notes.

## 6. Test the server

With the server running, open this in your browser:

```text
http://localhost:5000/notes
```

If everything is working, you should see a response with your Obsidian note names, or an empty notes list with a clear message.

If you see a browser error, the server is probably not running or is blocked.

## 7. Load or install the Chrome extension

For development/unpacked use:

1. Open Chrome.
2. Go to `chrome://extensions`.
3. Turn on Developer mode.
4. Click Load unpacked.
5. Select the `extension` folder inside this project.
6. Make sure the local Flask server is running.
7. Open the extension popup.

For Chrome Web Store use, install the extension from the store, then run the local server separately.

## 8. Optional: run the server hidden on Windows

The project may include a Windows helper file:

```text
start_server_hidden.vbs
```

On Windows, you can double-click this file to start the Flask server without keeping a terminal window open.

To start it automatically when Windows starts, place a shortcut to `start_server_hidden.vbs` in the Windows Startup folder.

This hidden launcher is Windows-specific. On macOS or Linux, use your system’s normal startup tools if you want the server to start automatically.

## 9. Stop or restart the hidden server on Windows

If you started the server with `start_server_hidden.vbs`, it may not show a terminal window.

To stop it:

1. Press `Ctrl + Shift + Esc` to open Task Manager.
2. Look for a Python or `pythonw.exe` process related to the server.
3. End that task.

To restart it:

1. Double-click `start_server_hidden.vbs` again.
2. Reload the Chrome extension.

## 10. Optional: set up AI summaries

AI summaries are optional.

When you use the summary shortcut, the extension sends highlighted text or extracted readable page content to the local Flask server. The local server then sends that text to OpenAI using your own `OPENAI_API_KEY`.

The API key is read by the local server. It is not stored in the Chrome extension, `manifest.json`, frontend JavaScript, or project files.

Do not share your API key or commit it to GitHub.

See:

```text
AI_SUMMARY_SETUP.md
```

for the exact setup steps.

## Runtime files

The local server and scripts may use these local runtime files:

```text
vault_path.txt
saved_notes.json
```

`vault_path.txt` stores your Obsidian vault path.

`saved_notes.json` stores notes waiting to be exported.

These files may contain personal data. Do not commit them to GitHub or share them publicly.

## Troubleshooting

### The extension says the server is not running

Start the server:

```powershell
python server.py
```

Then reload the extension from `chrome://extensions`.

### `http://localhost:5000/notes` does not open

Make sure:

- you are in the main project folder
- Flask is installed
- `server.py` is running
- another app is not already using port `5000`

### The note picker is empty

Check that:

- `vault_path.txt` exists
- the path inside `vault_path.txt` points to your real Obsidian vault
- your vault contains `.md` files
- notes are not only inside `.trash`, which is hidden by default

### Exports fail

Check that:

- the local server is running
- the selected Obsidian note exists or can be created
- the vault path is valid
- the note title is not empty
- `saved_notes.json` is valid JSON, or delete it and let the project recreate it

### AI summaries fail

Check that:

- AI summaries are set up intentionally
- `OPENAI_API_KEY` is set in the server environment
- the setup in `AI_SUMMARY_SETUP.md` has been completed
- the server was restarted after setting the API key
- the selected page has readable text, or you highlighted text first

## Privacy note

Obsidian Note Exporter is designed to keep normal note saving and exporting local to your computer.

The local server writes to your local Obsidian vault and local runtime files. The extension communicates with the server through `http://localhost:5000`.

AI summaries are different: when you use the summary feature, selected text or readable page content may be sent to OpenAI through your local server. Do not use AI summaries with text you do not want sent to OpenAI.

For more detail, see:

```text
PRIVACY_POLICY.md
```
