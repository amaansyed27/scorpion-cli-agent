$ErrorActionPreference = 'Stop'

$requiredNode = [version]'22.12.0'
$nodeCommand = Get-Command node -ErrorAction SilentlyContinue
$npmCommand = Get-Command npm -ErrorAction SilentlyContinue

if (-not $nodeCommand -or -not $npmCommand) {
    throw 'Node.js 22.12 or newer is required. Install it from https://nodejs.org/ and run this installer again.'
}

$nodeVersion = [version]((& node --version).TrimStart('v'))
if ($nodeVersion -lt $requiredNode) {
    throw "Node.js $requiredNode or newer is required. Detected $nodeVersion."
}

& npm install --global scorpion-cli@latest
if ($LASTEXITCODE -ne 0) {
    throw 'Scorpion installation failed.'
}

Write-Host 'Scorpion CLI installed successfully.' -ForegroundColor Green
Write-Host 'Run: scorpion'
