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

# The engine log is written by n8n itself (N8N_LOG_OUTPUT=console,file), not by
# this script. An earlier version piped the console through Tee-Object; the file
# was never created, because PowerShell block-buffers a native command's output
# and n8n is long-running, so nothing ever flushed. n8n's own logger writes
# through and rotates itself -- N8N_LOG_FILE_SIZE_MAX / N8N_LOG_FILE_COUNT_MAX.
$EngineLog = if ($env:N8N_LOG_FILE_LOCATION) { $env:N8N_LOG_FILE_LOCATION }
             else { Join-Path $LogDir 'n8n.log' }

# Console capture is a secondary: it catches anything that dies before the
# logger is up. Named console-* so pruning can never touch n8n's rotated logs.
$stamp   = Get-Date -Format 'yyyyMMdd-HHmmss'
$console = Join-Path $LogDir "console-$stamp.log"

Write-Host "Starting n8n"
Write-Host "  user folder : $($env:N8N_USER_FOLDER)"
Write-Host "  editor      : $($env:N8N_EDITOR_BASE_URL)"
Write-Host "  engine log  : $EngineLog"
Write-Host "  console log : $console"

# Prune console captures older than 14 days so the box does not fill up.
# Scoped to console-*.log on purpose: n8n rotates its own engine logs.
Get-ChildItem $LogDir -Filter 'console-*.log' -ErrorAction SilentlyContinue |
  Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-14) } |
  Remove-Item -Force -ErrorAction SilentlyContinue

$n8nCmd = Join-Path $env:APPDATA 'npm\n8n.cmd'
if (-not (Test-Path $n8nCmd)) {
  throw "n8n not found at $n8nCmd -- run: npm install -g n8n"
}

& $n8nCmd start *>&1 | Tee-Object -FilePath $console
