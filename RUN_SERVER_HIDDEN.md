# Run the Flask Server Hidden

## Start the server

Double-click `start_server_hidden.vbs`.

The launcher starts `server.py` with `C:\Python314\pythonw.exe`, uses this project folder as the working directory, and does not leave a Command Prompt window open.

If this project's server is already running, the launcher exits without starting a duplicate process.

## Start automatically at login

Double-click `enable_auto_start.vbs` once to create the Startup shortcut.

Windows will then run the `Obsidian Note Exporter Server.lnk` shortcut when you log in. The shortcut is stored in:

```text
%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup
```

The shortcut launches `start_server_hidden.vbs`, so no Command Prompt window appears.

After enabling auto-start, press `Windows key + R`, enter `shell:startup`, and confirm that `Obsidian Note Exporter Server.lnk` appears. Its target is the absolute path to this project's `start_server_hidden.vbs`, and its working directory is this project folder.

If Windows blocks the installer, use the manual fallback:

1. Press `Windows key + R`.
2. Enter `shell:startup`.
3. Drag `Obsidian Note Exporter Server.lnk` from this project folder into the Startup folder.

The prepared shortcut already contains the correct absolute launcher path and working directory.

## Disable auto-start

Press `Windows key + R`, enter:

```text
shell:startup
```

Delete `Obsidian Note Exporter Server.lnk` from the folder that opens. This disables future automatic launches but does not stop a server that is already running.

To start the server manually later, double-click `start_server_hidden.vbs` in this project folder.

## Check that it started

Open this address in your browser:

<http://localhost:5000/notes>

A JSON response means the Flask server is running. The response may contain a vault-related message if `vault_path.txt` is not configured, but that still confirms the server answered.

## Startup troubleshooting

The hidden launcher writes diagnostic information to `server_startup.log` in this project folder. The log records:

- when the launcher runs
- the resolved project working directory
- the exact `pythonw.exe` and `server.py` paths
- the launch command
- whether a duplicate server was already running
- whether `localhost:5000` responded after launch
- launch or health-check errors

If the extension cannot connect after login, first check that the Startup shortcut exists with `shell:startup`, then open `server_startup.log`.

## Stop the server

Open PowerShell and run this command from the project folder:

```powershell
Get-CimInstance Win32_Process -Filter "Name = 'pythonw.exe'" |
    Where-Object { $_.CommandLine -like '*obsidian-note-exporter*server.py*' } |
    ForEach-Object { Stop-Process -Id $_.ProcessId }
```

This targets the hidden Python process running this project's `server.py` instead of stopping every Python process.

The Flask server continues to bind only to `localhost:5000`; the Startup shortcut does not expose it to the network.
