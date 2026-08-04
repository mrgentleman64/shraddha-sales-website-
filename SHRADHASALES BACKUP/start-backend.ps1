$env:ComSpec = "$env:SystemRoot\System32\cmd.exe"
Set-Location -LiteralPath "$PSScriptRoot\backend"
python -m uvicorn server:app --host 0.0.0.0 --port 8000 --reload
