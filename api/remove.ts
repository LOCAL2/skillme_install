import type { VercelRequest, VercelResponse } from '@vercel/node'

function bashRemove(): string {
  return `#!/usr/bin/env bash
set -euo pipefail

BOLD="\\033[1m"; DIM="\\033[2m"; GREEN="\\033[32m"; RED="\\033[31m"; CYAN="\\033[36m"; RESET="\\033[0m"
DEST=".kiro/steering/ui-ux-pro-max"

printf "\\n  \${BOLD}ui-ux-pro-max\${RESET}  \${DIM}Kiro Skill Uninstaller\${RESET}\\n\\n"

if [ ! -d "\$DEST" ]; then
  printf "  \${YELLOW}!\${RESET}  Skill not found at \${DIM}\$DEST\${RESET}\\n\\n"
  exit 0
fi

rm -rf "\$DEST"

printf "  \${GREEN}✓\${RESET}  \${BOLD}Removed.\${RESET}  \${DIM}.kiro/steering/ui-ux-pro-max deleted\${RESET}\\n\\n"
printf "  \${DIM}Restart Kiro to deactivate the skill.\${RESET}\\n"
printf "  \${DIM}Customized & fixed by \${RESET}\${BOLD}Barron Nelly\${RESET}  \${DIM}- https://ui-ux-pro-max-skill.nextlevelbuilder.io\${RESET}\\n\\n"
`
}

function ps1Remove(): string {
  return `$ErrorActionPreference = 'Stop'
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host ""
Write-Host "  " -NoNewline
Write-Host "ui-ux-pro-max" -NoNewline -ForegroundColor White
Write-Host "  Kiro Skill Uninstaller" -ForegroundColor DarkGray
Write-Host ""

$dest = Join-Path (Get-Location) ".kiro/steering/ui-ux-pro-max"

if (-not (Test-Path $dest)) {
  Write-Host "  ! " -NoNewline -ForegroundColor Yellow
  Write-Host "Skill not found at .kiro/steering/ui-ux-pro-max" -ForegroundColor DarkGray
  Write-Host ""
  exit 0
}

Remove-Item -Recurse -Force $dest

Write-Host "  " -NoNewline
Write-Host "v" -NoNewline -ForegroundColor Green
Write-Host "  Removed.  " -NoNewline -ForegroundColor White
Write-Host ".kiro/steering/ui-ux-pro-max deleted" -ForegroundColor DarkGray
Write-Host ""
Write-Host "  Restart Kiro to deactivate the skill." -ForegroundColor DarkGray
Write-Host "  Customized & fixed by " -NoNewline -ForegroundColor DarkGray
Write-Host "Barron Nelly" -NoNewline -ForegroundColor White
Write-Host "  -  https://ui-ux-pro-max-skill.nextlevelbuilder.io" -ForegroundColor DarkGray
Write-Host ""
`
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  const ua = (req.headers['user-agent'] ?? '').toLowerCase()
  const isPowerShell = ua.includes('powershell') || ua.includes('windowspowershell')

  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('Content-Type', 'text/plain; charset=utf-8')

  return res.status(200).send(isPowerShell ? ps1Remove() : bashRemove())
}
