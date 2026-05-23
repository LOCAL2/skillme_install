if (-not $origin) {
    $origin = "http://localhost:5173"
}
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$runner = ""
if (Get-Command node -ErrorAction SilentlyContinue) {
    $runner = "node"
} elseif (Get-Command bun -ErrorAction SilentlyContinue) {
    $runner = "bun"
} else {
    Write-Error "Error: Node.js or Bun is required to run this installer. Please install Node.js or Bun."
    exit 1
}
$js = Invoke-RestMethod -Uri "$origin/install.js"
& $runner -e "$js" -- "$origin"