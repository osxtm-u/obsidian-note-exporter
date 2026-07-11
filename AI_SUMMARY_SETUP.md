# AI Summary Setup

AI summaries use the local Flask server. Your OpenAI API key stays on your computer as a Windows environment variable named `OPENAI_API_KEY`.

Do not paste the key into extension files, Python files, README files, GitHub, or `saved_notes.json`.

## Set The Key For The Current Terminal

Use this when you want to test quickly:

```powershell
$env:OPENAI_API_KEY = "your_api_key_here"
python server.py
```

This only applies to that PowerShell window. If you close the window, set it again before starting the server.

## Set The Key For Your Windows User

Use this if you want the key to be available every time you start the server:

```powershell
setx OPENAI_API_KEY "your_api_key_here"
```

After running `setx`, close and reopen PowerShell before starting the server:

```powershell
python server.py
```

If you use `start_server_hidden.vbs`, restart it after setting the key so the hidden server receives the updated environment.

## Check That It Works

1. Start the Flask server.
2. Reload the Chrome extension in `chrome://extensions`.
3. Highlight text on a webpage, or open a readable article/page.
4. Press `Alt+Shift+D`.

The extension popup should open to the Summary tab and show `Summarizing...`, then the generated summary.

If the key is missing, the Summary tab will show an error explaining that `OPENAI_API_KEY` is not set.

## Optional Model Setting

The server uses `gpt-5.4-mini` by default for summaries. To use a different model locally, set:

```powershell
setx OPENAI_SUMMARY_MODEL "your_model_name_here"
```

Then restart PowerShell and the Flask server.
