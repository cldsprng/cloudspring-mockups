# CloudSpring -- start self-hosted n8n.
#
# Owned by the Automation Engineer. Canonical copy lives in the repo at
# automation/n8n/host/start-n8n.ps1; this is the deployed copy on the box.
#
# Run by hand:            powershell -ExecutionPolicy Bypass -File C:\Users\ACenteno\cloudspring-n8n\start-n8n.ps1
# Run at logon:           Scheduled Task "CloudSpring n8n" (see automation/n8n/README.md)

$ErrorActionPreference = 'Stop'

$Root    = 'C:\Users\ACenteno\cloudspring-n8n'
$LogDir  = Join-Path $Root 'logs'
$EnvFile = Join-Path $Root '.env'

if (-not (Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir | Out-Null }

# n8n keeps its SQLite database and encryption key under this folder.
$env:N8N_USER_FOLDER = $Root

# Load KEY=VALUE lines from .env. Secrets never go in the repo.
if (Test-Path $EnvFile) {
  foreach ($line in Get-Content $EnvFile) {
    $trimmed = $line.Trim()
    if ($trimmed -eq '' -or $trimmed.StartsWith('#')) { continue }
    $idx = $trimmed.IndexOf('=')
    if ($idx -lt 1) { continue }
    $key = $trimmed.Substring(0, $idx).Trim()
    $val = $trimmed.Substring($idx + 1).Trim().Trim('"')
    Set-Item -Path "env:$key" -Value $val
  }
}

$stamp  = Get-Date -Format 'yyyyMMdd-HHmmss'
$stdout = Join-Path $LogDir "n8n-$stamp.log"

Write-Host "Starting n8n"
Write-Host "  user folder : $($env:N8N_USER_FOLDER)"
Write-Host "  editor      : $($env:N8N_EDITOR_BASE_URL)"
Write-Host "  log         : $stdout"

# Prune logs older than 14 days so the box does not fill up.
Get-ChildItem $LogDir -Filter 'n8n-*.log' |
  Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-14) } |
  Remove-Item -Force -ErrorAction SilentlyContinue

$n8nCmd = Join-Path $env:APPDATA 'npm\n8n.cmd'
if (-not (Test-Path $n8nCmd)) {
  throw "n8n not found at $n8nCmd -- run: npm install -g n8n"
}

& $n8nCmd start *>&1 | Tee-Object -FilePath $stdout
