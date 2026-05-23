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
    const { files } = await getJson(`${baseUrl}/api/files.json`);
    
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