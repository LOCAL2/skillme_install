import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getToken } from './_auth.js'

export default function handler(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers['x-forwarded-proto']
    ? `${req.headers['x-forwarded-proto']}://${req.headers['x-forwarded-host'] ?? req.headers['host']}`
    : `http://${req.headers['host']}`

  const token = getToken()
  if (!token) {
    return res.status(503).send('# Server error: INSTALL_TOKEN not configured\n')
  }

  const script = `
$ErrorActionPreference = 'Stop'
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$origin = "${origin}"
$token  = if ($env:TOKEN) { $env:TOKEN } else { "" }

if (-not $token) {
  Write-Error "[Kiro Installer] TOKEN is not set. Use the install command from the website."
  exit 1
}

$dest = Join-Path (Get-Location) ".kiro/steering/ui-ux-pro-max"
Write-Host "[Kiro Installer] Fetching skill files..."

$headers = @{ "X-Install-Token" = $token }
try {
  $response = Invoke-RestMethod -Uri "$origin/api/files" -Headers $headers -Method Get
} catch {
  Write-Error "[Kiro Installer] Failed to fetch files: $_"
  exit 1
}

$count = 0
foreach ($file in $response.files) {
  $filePath = Join-Path $dest $file.relativePath
  $dir = Split-Path $filePath -Parent
  if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
  [System.IO.File]::WriteAllText($filePath, $file.content, [System.Text.Encoding]::UTF8)
  $count++
}
Write-Host "[Kiro Installer] Installed $count files to .kiro/steering/ui-ux-pro-max"
`.trim()

  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  return res.status(200).send(script)
}
