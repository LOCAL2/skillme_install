import { readFileSync, writeFileSync } from 'fs';
const getScript = readFileSync('api/get.ts', 'utf8');
const testCode = getScript.replace('export default function handler(req: VercelRequest, res: VercelResponse)', 'function handler()') 
  + '\n\nfs.writeFileSync("test.sh", bashScript(getFiles())); fs.writeFileSync("test.ps1", ps1Script(getFiles()));';
writeFileSync('run.ts', testCode);
