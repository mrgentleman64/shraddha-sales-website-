@echo off
set "ComSpec=%SystemRoot%\System32\cmd.exe"
cd /d "%~dp0frontend"
npm run dev
