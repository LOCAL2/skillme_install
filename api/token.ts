/**
 * Returns the install token to the browser (same-origin only).
 * The website fetches this to embed the token in the displayed install command.
 * Direct curl/fetch from outside still gets the token — but that's fine:
 * the token only gates /api/files (the actual skill data).
 * Without the token, /api/files returns 403.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getToken } from './_auth.js'

export default function handler(_req: VercelRequest, res: VercelResponse) {
  const token = getToken()
  if (!token) {
    return res.status(503).json({ error: 'Token not configured' })
  }
  res.setHeader('Cache-Control', 'no-store')
  return res.status(200).json({ token })
}
