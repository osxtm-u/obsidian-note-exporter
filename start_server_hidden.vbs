Option Explicit

Dim fileSystem
Dim projectFolder
Dim pythonwPath
Dim serverPath
Dim logPath
Dim shell
Dim command
Dim launchResult
Dim http

Set fileSystem = CreateObject("Scripting.FileSystemObject")
projectFolder = fileSystem.GetAbsolutePathName( _
    fileSystem.GetParentFolderName(WScript.ScriptFullName))
pythonwPath = "C:\Python314\pythonw.exe"
serverPath = fileSystem.BuildPath(projectFolder, "server.py")
logPath = fileSystem.BuildPath(projectFolder, "server_startup.log")

Sub WriteLog(message)
    Dim logFile

    On Error Resume Next
    Set logFile = fileSystem.OpenTextFile(logPath, 8, True)
    logFile.WriteLine Now & " | " & message
    logFile.Close
    On Error GoTo 0
End Sub

WriteLog "Hidden launcher started."
WriteLog "Project working directory: " & projectFolder
WriteLog "Python path: " & pythonwPath
WriteLog "Server path: " & serverPath

If Not fileSystem.FileExists(pythonwPath) Then
    WriteLog "FAILED: pythonw.exe was not found."
    WScript.Quit 1
End If

If Not fileSystem.FileExists(serverPath) Then
    WriteLog "FAILED: server.py was not found."
    WScript.Quit 1
End If

On Error Resume Next
Set http = CreateObject("MSXML2.ServerXMLHTTP.6.0")
http.Open "GET", "http://localhost:5000/notes", False
http.SetTimeouts 1000, 1000, 1000, 1000
http.Send

If Err.Number = 0 Then
    If http.Status >= 200 And http.Status < 500 Then
        WriteLog "Server is already responding on localhost:5000. No duplicate was started."
        WScript.Quit 0
    End If
End If

Err.Clear
On Error GoTo 0

Set shell = CreateObject("WScript.Shell")
shell.CurrentDirectory = projectFolder
command = """" & pythonwPath & """ """ & serverPath & """"
WriteLog "Launch command: " & command

On Error Resume Next
launchResult = shell.Run(command, 0, False)

If Err.Number <> 0 Then
    WriteLog "FAILED: Windows could not launch server.py. Error " & _
        Err.Number & ": " & Err.Description
    WScript.Quit 1
End If

On Error GoTo 0

If launchResult <> 0 Then
    WriteLog "FAILED: Windows returned launch code " & launchResult & "."
    WScript.Quit 1
End If

WScript.Sleep 2500

On Error Resume Next
Set http = CreateObject("MSXML2.ServerXMLHTTP.6.0")
http.Open "GET", "http://localhost:5000/notes", False
http.SetTimeouts 2000, 2000, 2000, 2000
http.Send

If Err.Number <> 0 Then
    WriteLog "FAILED: server.py was launched, but localhost:5000 did not respond. Error " & _
        Err.Number & ": " & Err.Description
    WScript.Quit 1
End If

If http.Status >= 200 And http.Status < 500 Then
    WriteLog "SUCCESS: localhost:5000 responded with HTTP " & http.Status & "."
Else
    WriteLog "FAILED: localhost:5000 responded with HTTP " & http.Status & "."
    WScript.Quit 1
End If

On Error GoTo 0
