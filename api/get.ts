import type { VercelRequest, VercelResponse } from '@vercel/node'
import fs from 'fs'
import path from 'path'



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

printf "\\n  \${BOLD}ui-ux-pro-max\${RESET}  \${DIM}Skill Installer\${RESET}\\n\\n"
printf "  \${BOLD}Select your AI Agent (Use Arrow Keys and Enter):\${RESET}\\n"

# ── interactive menu ────────────────────────────────────────────────────────
exec < /dev/tty

agents=("Kiro (Native Skill System)" "Cursor (Cursor IDE)" "Cline (VSCode Extension)" "Claude Code (Anthropic CLI)" "Antigravity (AGY System)" "Copilot (GitHub Copilot)" "Windsurf (Codeium rules)")
paths=(".kiro/steering/" ".cursor/rules/" ".clinerules/" ".claude/" ".agents/skills/" ".github/copilot-instructions/" ".windsurf/rules/")
names=("Kiro" "Cursor" "Cline" "Claude Code" "Antigravity" "Copilot" "Windsurf")

idx=0
# hide cursor
printf "\\e[?25l"
while true; do
  for i in "\${!agents[@]}"; do
    if [ $i -eq $idx ]; then
      printf "\\r\\e[K  > \\e[36m\${agents[$i]}\\e[0m\\n"
    else
      printf "\\r\\e[K    \\e[90m\${agents[$i]}\\e[0m\\n"
    fi
  done
  
  read -rsn1 key
  if [[ $key == $'\\e' ]]; then
    read -rsn2 key2
    if [[ $key2 == '[A' ]]; then # up
      ((idx--))
      [ $idx -lt 0 ] && idx=$((\${#agents[@]}-1))
    elif [[ $key2 == '[B' ]]; then # down
      ((idx++))
      [ $idx -ge \${#agents[@]} ] && idx=0
    fi
  elif [[ $key == "" ]]; then # enter
    break
  fi
  printf "\\e[%sA" "\${#agents[@]}"
done
# show cursor
printf "\\e[?25h"

targetPath="\${paths[$idx]}ui-ux-pro-max"
agentName="\${names[$idx]}"

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

printf "\\n  \${DIM}Fetching ${total} files from server...\${RESET}\\n"

node - <<JSEOF &
const fs = require('fs'), path = require('path')
const files = ${JSON.stringify(files)}
const base  = path.join(process.cwd(), '$targetPath')
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

printf "  \${GREEN}✓\${RESET}  \${BOLD}Done!\${RESET}  ${total} files → \${DIM}\${targetPath}\${RESET}\\n\\n"
printf "  \${DIM}Restart \${agentName} to activate the skill.\${RESET}\\n"
printf "  \${DIM}Customized & fixed by \${RESET}\${BOLD}Barron Nelly\${RESET}  \${DIM}· https://ui-ux-pro-max-skill.nextlevelbuilder.io (ต้นฉบับ)\${RESET}\\n\\n"
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
Write-Host "  Skill Installer" -ForegroundColor DarkGray
Write-Host ""

$agents = @("Kiro (Native Skill System)", "Cursor (Cursor IDE)", "Cline (VSCode Extension)", "Claude Code (Anthropic CLI)", "Antigravity (AGY System)", "Copilot (GitHub Copilot)", "Windsurf (Codeium rules)")
$paths = @(".kiro/steering/", ".cursor/rules/", ".clinerules/", ".claude/", ".agents/skills/", ".github/copilot-instructions/", ".windsurf/rules/")
$names = @("Kiro", "Cursor", "Cline", "Claude Code", "Antigravity", "Copilot", "Windsurf")
$idx = 0

Write-Host "  Select your AI Agent (Use Arrow Keys and Enter):" -ForegroundColor White
$top = [Console]::CursorTop
[Console]::CursorVisible = $false

while ($true) {
    [Console]::CursorTop = $top
    for ($i = 0; $i -lt $agents.Length; $i++) {
        if ($i -eq $idx) {
            Write-Host "  > $($agents[$i])".PadRight(50) -ForegroundColor Cyan
        } else {
            Write-Host "    $($agents[$i])".PadRight(50) -ForegroundColor Gray
        }
    }
    $key = [Console]::ReadKey($true)
    if ($key.Key -eq 'UpArrow') {
        $idx--
        if ($idx -lt 0) { $idx = $agents.Length - 1 }
    } elseif ($key.Key -eq 'DownArrow') {
        $idx++
        if ($idx -ge $agents.Length) { $idx = 0 }
    } elseif ($key.Key -eq 'Enter') {
        break
    }
}
[Console]::CursorVisible = $true
$targetPath = $paths[$idx] + "ui-ux-pro-max"
$agentName = $names[$idx]

Write-Host ""
Write-Host "  Fetching ${total} files from server..." -ForegroundColor DarkGray

$files = '${json}' | ConvertFrom-Json
$base  = Join-Path (Get-Location) $targetPath
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
Write-Host "$count files → $targetPath" -ForegroundColor DarkGray
Write-Host ""
Write-Host "  Restart $agentName to activate the skill." -ForegroundColor DarkGray
Write-Host "  Customized & fixed by " -NoNewline -ForegroundColor DarkGray
Write-Host "Barron Nelly" -NoNewline -ForegroundColor White
Write-Host "  · https://ui-ux-pro-max-skill.nextlevelbuilder.io" -ForegroundColor DarkGray
Write-Host ""
`
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  const ua = (req.headers['user-agent'] ?? '').toLowerCase()
  const isPowerShell = ua.includes('powershell') || ua.includes('windowspowershell')

  const files = getFiles()
  const script = isPowerShell
    ? ps1Script(files)
    : bashScript(files)

  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  res.send(script)
}
