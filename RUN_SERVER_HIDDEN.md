# Run the Flask Server Hidden

This is an optional, advanced Windows setup. The standard public setup is to run:

```powershell
python server.py
```

Use the hidden launcher only if you want the local Flask server to run without a visible terminal window.

## Start the server

Double-click `start_server_hidden.vbs`.

The launcher starts `server.py` with `pythonw.exe`, uses this project folder as the working directory, and does not leave a Command Prompt window open.

Before using it, open `start_server_hidden.vbs` and check the `pythonwPath` value. The included script may contain a Python path from the original development machine, such as:

```text
C:\Python314\pythonw.exe
```

Change that value to the `pythonw.exe` path on your own computer if needed.

If this project's server is already running, the launcher exits without starting a duplicate process.

## Start automatically at login

Auto-start is optional and may require manual setup.

The included `enable_auto_start.vbs` helper expects a prepared Windows shortcut file named:

```text
Obsidian Note Exporter Server.lnk
```

If that shortcut is not included in your copy of the project, create a shortcut manually instead of using `enable_auto_start.vbs`.

Windows runs shortcuts from this Startup folder when you log in:

```text
%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup
```

The shortcut should launch `start_server_hidden.vbs`, so no Command Prompt window appears.

After setting up auto-start, press `Windows key + R`, enter `shell:startup`, and confirm that `Obsidian Note Exporter Server.lnk` appears. Its target should be the absolute path to this project's `start_server_hidden.vbs`, and its working directory should be this project folder.

Manual setup:

1. Press `Windows key + R`.
2. Enter `shell:startup`.
3. Create a shortcut in that folder.
4. Set the shortcut target to this project's `start_server_hidden.vbs`.
5. Set the shortcut working directory to this project folder.

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
