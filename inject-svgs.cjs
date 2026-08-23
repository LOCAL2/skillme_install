const fs = require('fs');

const cursor = fs.readFileSync('cursor_alt.svg', 'utf8').replace(/<svg /, '<svg width="28" height="28" ').replace(/\\n/g, '').replace(/\\r/g, '').trim();
const claude = fs.readFileSync('claude.svg', 'utf8').replace('<svg ', '<svg width="28" height="28" ').replace(/\\n/g, '').replace(/\\r/g, '').trim();
const gemini = fs.readFileSync('gemini.svg', 'utf8').replace('<svg ', '<svg width="28" height="28" ').replace(/\\n/g, '').replace(/\\r/g, '').trim();
const copilot = fs.readFileSync('copilot.svg', 'utf8').replace('<svg ', '<svg width="28" height="28" ').replace(/\\n/g, '').replace(/\\r/g, '').trim();
const codeium = fs.readFileSync('codeium.svg', 'utf8').replace('<svg ', '<svg width="28" height="28" ').replace(/\\n/g, '').replace(/\\r/g, '').trim();

let appTsx = fs.readFileSync('src/App.tsx', 'utf8');

const newIconFunc = `
function AgentLogoIcon({ id }: { id: string }) {
  switch (id) {
    case 'cursor':
      return (
        ${cursor}
      );
    case 'cline':
      return (
        ${claude}
      );
    case 'antigravity':
      return (
        ${gemini}
      );
    case 'copilot':
      return (
        ${copilot}
      );
    case 'windsurf':
      return (
        ${codeium}
      );
    case 'kiro':
    default:
      return null;
  }
}
`;

appTsx = appTsx.replace(/function AgentLogoIcon.*?\n}\n/s, newIconFunc.trim() + '\\n');
// Also need to adjust 'class=' to 'className=' in the SVGs if there are any
appTsx = appTsx.replace(/class=/g, 'className=');

fs.writeFileSync('src/App.tsx', appTsx);
console.log('App.tsx updated!');
