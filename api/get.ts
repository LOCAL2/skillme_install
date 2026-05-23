import type { VercelRequest, VercelResponse } from '@vercel/node'
import fs from 'fs'
import path from 'path'

function getOrigin(req: VercelRequest): string {
  const proto = req.headers['x-forwarded-proto'] ?? 'https'
  const host  = req.headers['x-forwarded-host'] ?? req.headers['host']
  return `${proto}://${host}`
}

function getFiles(): { relativePath: string; content: string }[] {
  const skillDir = path.join(process.cwd(), 'skill', 'ui-ux-pro-max')
  const files: { relativePath: string; content: string }[] = []
  function walk(dir: string) {
    if (!fs.existsSync(dir)) return
    for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, item.name)
      if (item.isDirectory()) {
        if (item.name !== '__pycache__') walk(full)
      } else {
        files.push({
          relativePath: path.relative(skillDir, full).replace(/\\/g, '/'),
          content: fs.readFileSync(full, 'utf8'),
        })
      }
    }
  }
  walk(skillDir)
  return files
}

function bashScript(files: { relativePath: string; content: string }[]): string {
  const total = files.length

  return `#!/usr/bin/env bash
set -euo pipefail

# ── colors ──────────────────────────────────────────────────────────────────
BOLD="\\033[1m"; DIM="\\033[2m"; GREEN="\\033[32m"; CYAN="\\033[36m"
YELLOW="\\033[33m"; RESET="\\033[0m"

# ── spinner ──────────────────────────────────────────────────────────────────
spin() {
  local pid=$1 msg=$2
  local frames=("⠋" "⠙" "⠹" "⠸" "⠼" "⠴" "⠦" "⠧" "⠇" "⠏")
  local i=0
  while kill -0 "$pid" 2>/dev/null; do
    printf "\\r  \${CYAN}\${frames[$i]}\${RESET}  %s" "$msg"
    i=$(( (i+1) % \${#frames[@]} ))
    sleep 0.08
  done
  printf "\\r"
}

printf "\\n  \${BOLD}ui-ux-pro-max\${RESET}  \${DIM}Kiro Skill Installer\${RESET}\\n\\n"
printf "  \${DIM}Fetching ${total} files from server...\${RESET}\\n"

node - <<'JSEOF' &
const fs = require('fs'), path = require('path')
const files = ${JSON.stringify(files)}
const base  = path.join(process.cwd(), '.kiro', 'steering', 'ui-ux-pro-max')
const total = files.length

process.stdout.write('\\r  \\x1b[36m◆\\x1b[0m  Writing files...                    ')

files.forEach((f, i) => {
  const p = path.join(base, f.relativePath)
  fs.mkdirSync(path.dirname(p), { recursive: true })
  fs.writeFileSync(p, f.content, 'utf8')

  const pct  = Math.round(((i + 1) / total) * 100)
  const done = Math.round(pct / 5)
  const bar  = '█'.repeat(done) + '░'.repeat(20 - done)
  process.stdout.write('\\r  \\x1b[36m' + bar + '\\x1b[0m  ' + pct + '%  ')
})

process.stdout.write('\\n')
JSEOF

NODE_PID=$!
spin $NODE_PID "Installing..."
wait $NODE_PID

printf "  \${GREEN}✓\${RESET}  \${BOLD}Done!\${RESET}  ${total} files → \${DIM}.kiro/steering/ui-ux-pro-max\${RESET}\\n\\n"
printf "  \${DIM}Restart Kiro to activate the skill.\${RESET}\\n"
printf "  \${DIM}Customized & fixed by \${RESET}\${BOLD}Barron Nelly\${RESET}  \${DIM}· https://ui-ux-pro-max-skill.nextlevelbuilder.io\${RESET}\\n\\n"
`
}

function ps1Script(files: { relativePath: string; content: string }[]): string {
  const json = JSON.stringify(files).replace(/'/g, "''")
  const total = files.length

  return `$ErrorActionPreference = 'Stop'
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host ""
Write-Host "  " -NoNewline
Write-Host "ui-ux-pro-max" -NoNewline -ForegroundColor White
Write-Host "  Kiro Skill Installer" -ForegroundColor DarkGray
Write-Host ""

# Spinner frames
$frames = @("⠋","⠙","⠹","⠸","⠼","⠴","⠦","⠧","⠇","⠏")
$fi = 0

Write-Host "  Fetching ${total} files from server..." -ForegroundColor DarkGray

$files = '${json}' | ConvertFrom-Json
$base  = Join-Path (Get-Location) ".kiro/steering/ui-ux-pro-max"
$count = 0
$t     = $files.Count

foreach ($f in $files) {
  $dest = Join-Path $base $f.relativePath
  $dir  = Split-Path $dest -Parent
  if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
  [System.IO.File]::WriteAllText($dest, $f.content, [System.Text.Encoding]::UTF8)
  $count++

  # Progress bar
  $pct  = [int](($count / $t) * 100)
  $done = [int]($pct / 5)
  $bar  = ("█" * $done) + ("░" * (20 - $done))
  Write-Host ("\r  " + $bar + "  " + $pct + "%   ") -NoNewline -ForegroundColor Cyan
}

Write-Host ""
Write-Host ""
Write-Host "  " -NoNewline
Write-Host "✓" -NoNewline -ForegroundColor Green
Write-Host "  Done!  " -NoNewline -ForegroundColor White
Write-Host "$count files → .kiro/steering/ui-ux-pro-max" -ForegroundColor DarkGray
Write-Host ""
Write-Host "  Restart Kiro to activate the skill." -ForegroundColor DarkGray
Write-Host "  Customized & fixed by " -NoNewline -ForegroundColor DarkGray
Write-Host "Barron Nelly" -NoNewline -ForegroundColor White
Write-Host "  ·  https://ui-ux-pro-max-skill.nextlevelbuilder.io" -ForegroundColor DarkGray
Write-Host ""
`
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  const ua = (req.headers['user-agent'] ?? '').toLowerCase()
  const isPowerShell = ua.includes('powershell') || ua.includes('windowspowershell')

  let files: { relativePath: string; content: string }[]
  try {
    files = getFiles()
  } catch (e) {
    return res.status(500).send('# Error reading skill files\n')
  }

  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('Content-Type', 'text/plain; charset=utf-8')

  if (isPowerShell) {
    return res.status(200).send(ps1Script(files))
  }
  return res.status(200).send(bashScript(files))
}
