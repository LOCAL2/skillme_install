import type { VercelRequest, VercelResponse } from '@vercel/node'
import fs from 'fs'
import path from 'path'
import { checkAuth } from './_auth.js'

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Block direct browser access — require token header
  if (!checkAuth(req as any)) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  const skillDir = path.join(process.cwd(), 'skill', 'ui-ux-pro-max')
  const files: { relativePath: string; content: string }[] = []

  function walk(dir: string) {
    if (!fs.existsSync(dir)) return
    for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, item.name)
      if (item.isDirectory()) {
        if (item.name !== '__pycache__') walk(full)
      } else {
        const relativePath = path.relative(skillDir, full).replace(/\\/g, '/')
        files.push({ relativePath, content: fs.readFileSync(full, 'utf8') })
      }
    }
  }
  walk(skillDir)

  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Cache-Control', 'no-store')
  return res.status(200).json({ files })
}
