@echo off
set "ComSpec=%SystemRoot%\System32\cmd.exe"
cd /d "%~dp0backend"
python -m uvicorn server:app --host 0.0.0.0 --port 8000 --reload
