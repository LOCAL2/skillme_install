import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getToken } from './_auth.js'

export default function handler(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers['x-forwarded-proto']
    ? `${req.headers['x-forwarded-proto']}://${req.headers['x-forwarded-host'] ?? req.headers['host']}`
    : `http://${req.headers['host']}`

  const token = getToken()

  const script = `#!/bin/bash
set -e
ORIGIN="${origin}"
TOKEN="\${TOKEN:-}"

if [ -z "$TOKEN" ]; then
  echo "[Kiro Installer] Error: TOKEN is not set."
  echo "  Use the install command from the website — it includes your token."
  exit 1
fi

DEST=".kiro/steering/ui-ux-pro-max"

echo "[Kiro Installer] Fetching skill files..."
RESPONSE=$(curl -fsSL -H "X-Install-Token: $TOKEN" "$ORIGIN/api/files")

if echo "$RESPONSE" | grep -q '"error"'; then
  echo "[Kiro Installer] Error: Invalid token or server error."
  exit 1
fi

if command -v node &> /dev/null; then
  echo "$RESPONSE" | node -e "
const fs = require('fs'), path = require('path');
let data = '';
process.stdin.on('data', c => data += c);
process.stdin.on('end', () => {
  const { files } = JSON.parse(data);
  const dest = path.join(process.cwd(), '${DEST.replace(/'/g, "\\'")}');
  let count = 0;
  for (const f of files) {
    const p = path.join(dest, f.relativePath);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, f.content, 'utf8');
    count++;
  }
  console.log('[Kiro Installer] Installed ' + count + ' files to ${DEST}');
});
"
elif command -v python3 &> /dev/null; then
  echo "$RESPONSE" | python3 -c "
import sys, json, os
data = json.load(sys.stdin)
dest = os.path.join(os.getcwd(), '${DEST}')
count = 0
for f in data['files']:
    p = os.path.join(dest, f['relativePath'])
    os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, 'w', encoding='utf-8').write(f['content'])
    count += 1
print(f'[Kiro Installer] Installed {count} files to ${DEST}')
"
else
  echo "[Kiro Installer] Error: node or python3 required."
  exit 1
fi
`

  // Validate token is configured
  if (!token) {
    return res.status(503).send('# Server error: INSTALL_TOKEN not configured\n')
  }

  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  return res.status(200).send(script)
}
