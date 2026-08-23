@echo off
REM Wrapper so scripts that call "bash" work on Windows without Git for Windows installed.
REM Routes to the Hermes internal Git Bash.
"C:\Users\HP\AppData\Local\hermes\git\usr\bin\bash.exe" %*
