const fs = require('fs');
const https = require('https');

async function fetchSvg(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function main() {
  const svgs = {
    cursor: 'https://cdn.simpleicons.org/cursor/ffffff',
    cursor_alt: 'https://www.cursor.com/assets/images/logo.svg',
    claude: 'https://cdn.simpleicons.org/claude/ffffff',
    gemini: 'https://cdn.simpleicons.org/googlegemini/ffffff',
    copilot: 'https://cdn.simpleicons.org/githubcopilot/ffffff',
    windsurf: 'https://cdn.simpleicons.org/windsurf/ffffff',
    codeium: 'https://cdn.simpleicons.org/codeium/ffffff'
  };

  for (const [name, url] of Object.entries(svgs)) {
    try {
      const data = await fetchSvg(url);
      fs.writeFileSync(`${name}.svg`, data);
      console.log(`Saved ${name}.svg`);
    } catch (e) {
      console.log(`Failed ${name}:`, e.message);
    }
  }
}
main();
