import { defineConfig, type Plugin } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import fs from 'fs'
import path from 'path'

function skillInstallerPlugin(): Plugin {
  return {
    name: 'skill-installer',
    buildStart() {
      const skillDir = path.resolve(process.cwd(), 'skill/ui-ux-pro-max')
      const publicDir = path.resolve(process.cwd(), 'public')
      const apiDir = path.join(publicDir, 'api')

      // Ensure directories exist
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true })
      }
      if (!fs.existsSync(apiDir)) {
        fs.mkdirSync(apiDir, { recursive: true })
      }

      // 1. Gather all files in skill/ui-ux-pro-max recursively
      const files: { relativePath: string; content: string }[] = []
      function getFilesRecursively(dir: string) {
        if (!fs.existsSync(dir)) return
        const items = fs.readdirSync(dir, { withFileTypes: true })
        for (const item of items) {
          const fullPath = path.join(dir, item.name)
          if (item.isDirectory()) {
            if (item.name !== '__pycache__') {
              getFilesRecursively(fullPath)
            }
          } else if (item.isFile()) {
            const relativePath = path.relative(skillDir, fullPath).replace(/\\/g, '/')
            const content = fs.readFileSync(fullPath, 'utf8')
            files.push({ relativePath, content })
          }
        }
      }
      getFilesRecursively(skillDir)

      // Write files.json
      fs.writeFileSync(path.join(apiDir, 'files.json'), JSON.stringify({ files }), 'utf8')

      // 2. Generate static install.js
      const installScript = `
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const baseUrl = process.argv[2] || 'http://localhost:5173';
const destRoot = path.join(process.cwd(), '.kiro', 'steering', 'ui-ux-pro-max');

function getJson(url) {
  return new Promise((resolve, reject) => {
    const getter = url.startsWith('https') ? https : http;
    getter.get(url, (res) => {
      if (res.statusCode !== 200) {
        res.resume();
        reject(new Error('Request Failed. Status Code: ' + res.statusCode));
        return;
      }
      let data = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function install() {
  console.log('[Kiro Installer] Installing ui-ux-pro-max skill...');
  try {
    const { files } = await getJson(\`\${baseUrl}/api/files.json\`);
    
    let count = 0;
    for (const file of files) {
      const destPath = path.join(destRoot, file.relativePath);
      const destDir = path.dirname(destPath);
      
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      
      fs.writeFileSync(destPath, file.content, 'utf8');
      count++;
    }
    console.log('[Kiro Installer] [SUCCESS] Installed ' + count + ' files to .kiro/steering/ui-ux-pro-max/');
  } catch (err) {
    console.error('[Kiro Installer] [ERROR] Installation failed:', err.message);
    process.exit(1);
  }
}

install();
`
      fs.writeFileSync(path.join(publicDir, 'install.js'), installScript.trim(), 'utf8')

      // 3. Generate static install.sh
      const shScript = `#!/bin/bash
ORIGIN=$1
if [ -z "$ORIGIN" ]; then
  ORIGIN="http://localhost:5173"
fi

if command -v node &> /dev/null; then
  node -e "$(curl -fsSL $ORIGIN/install.js)" -- "$ORIGIN"
elif command -v bun &> /dev/null; then
  bun -e "$(curl -fsSL $ORIGIN/install.js)" -- "$ORIGIN"
else
  echo "Error: Node.js or Bun is required to run this installer. Please install Node.js or Bun."
  exit 1
fi
`
      fs.writeFileSync(path.join(publicDir, 'install.sh'), shScript.trim(), 'utf8')

      // 4. Generate static install.ps1
      const psScript = `
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
`
      fs.writeFileSync(path.join(publicDir, 'install.ps1'), psScript.trim(), 'utf8')

      console.log('[Skill Installer Plugin] Static installation assets generated successfully in public/')
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    skillInstallerPlugin()
  ],
})
