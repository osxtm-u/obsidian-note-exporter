Option Explicit

Dim fileSystem
Dim projectFolder
Dim launcherPath
Dim sourceShortcutPath
Dim shell
Dim startupFolder
Dim shortcutPath
Dim verification

Set fileSystem = CreateObject("Scripting.FileSystemObject")
projectFolder = fileSystem.GetAbsolutePathName( _
    fileSystem.GetParentFolderName(WScript.ScriptFullName))
launcherPath = fileSystem.BuildPath(projectFolder, "start_server_hidden.vbs")
sourceShortcutPath = fileSystem.BuildPath( _
    projectFolder, "Obsidian Note Exporter Server.lnk")

If Not fileSystem.FileExists(launcherPath) Then
    MsgBox "start_server_hidden.vbs was not found in:" & vbCrLf & projectFolder, _
        vbCritical, "Obsidian Note Exporter"
    WScript.Quit 1
End If

If Not fileSystem.FileExists(sourceShortcutPath) Then
    MsgBox "The prepared Startup shortcut was not found in:" & vbCrLf & projectFolder, _
        vbCritical, "Obsidian Note Exporter"
    WScript.Quit 1
End If

Set shell = CreateObject("WScript.Shell")
startupFolder = shell.SpecialFolders("Startup")
shortcutPath = fileSystem.BuildPath(startupFolder, "Obsidian Note Exporter Server.lnk")

On Error Resume Next
fileSystem.CopyFile sourceShortcutPath, shortcutPath, True

If Err.Number <> 0 Then
    MsgBox "Windows could not copy the shortcut into the Startup folder." & vbCrLf & vbCrLf & _
        "Location:" & vbCrLf & shortcutPath & vbCrLf & vbCrLf & _
        "Error " & Err.Number & ": " & Err.Description, _
        vbCritical, "Obsidian Note Exporter"
    WScript.Quit 1
End If

On Error GoTo 0

If Not fileSystem.FileExists(shortcutPath) Then
    MsgBox "The Startup shortcut was not found after Windows tried to save it.", _
        vbCritical, "Obsidian Note Exporter"
    WScript.Quit 1
End If

Set verification = shell.CreateShortcut(shortcutPath)

If StrComp(verification.TargetPath, launcherPath, vbTextCompare) <> 0 Or _
        StrComp(verification.WorkingDirectory, projectFolder, vbTextCompare) <> 0 Then
    MsgBox "The Startup shortcut was created, but its target or working folder is incorrect.", _
        vbCritical, "Obsidian Note Exporter"
    WScript.Quit 1
End If

MsgBox "Auto-start is enabled." & vbCrLf & vbCrLf & _
    "Shortcut:" & vbCrLf & shortcutPath & vbCrLf & vbCrLf & _
    "Target:" & vbCrLf & launcherPath, _
    vbInformation, "Obsidian Note Exporter"
