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
  // Embed files as a JSON payload inside the bash script — no second request needed
  const payload = JSON.stringify(files)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "'\\''")

  return `#!/usr/bin/env bash
set -euo pipefail

DEST="\${PWD}/.kiro/steering/ui-ux-pro-max"

echo "  Installing ui-ux-pro-max..."

node - <<'JSEOF'
const fs = require('fs'), path = require('path')
const files = ${JSON.stringify(files)}
const base  = path.join(process.cwd(), '.kiro', 'steering', 'ui-ux-pro-max')
files.forEach(f => {
  const p = path.join(base, f.relativePath)
  fs.mkdirSync(path.dirname(p), { recursive: true })
  fs.writeFileSync(p, f.content, 'utf8')
})
console.log('  ✓ Installed ' + files.length + ' files → .kiro/steering/ui-ux-pro-max')
JSEOF
`
}

function ps1Script(files: { relativePath: string; content: string }[]): string {
  const json = JSON.stringify(files).replace(/'/g, "''")
  return `$ErrorActionPreference = 'Stop'
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "  Installing ui-ux-pro-max..."

$files = '${json}' | ConvertFrom-Json
$base  = Join-Path (Get-Location) ".kiro/steering/ui-ux-pro-max"

foreach ($f in $files) {
  $dest = Join-Path $base $f.relativePath
  $dir  = Split-Path $dest -Parent
  if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
  [System.IO.File]::WriteAllText($dest, $f.content, [System.Text.Encoding]::UTF8)
}

Write-Host "  v Installed $($files.Count) files -> .kiro/steering/ui-ux-pro-max"
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
