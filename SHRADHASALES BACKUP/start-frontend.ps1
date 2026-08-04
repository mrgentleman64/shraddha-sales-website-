$env:ComSpec = "$env:SystemRoot\System32\cmd.exe"
Set-Location -LiteralPath "$PSScriptRoot\frontend"
cmd /c npm run dev
