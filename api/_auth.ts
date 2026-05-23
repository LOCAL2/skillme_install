/**
 * Shared token auth helper for Vercel API routes.
 * Reads INSTALL_TOKEN from env. If not set, falls back to a build-time
 * generated token stored in api/_token.txt (written by vite.config.ts).
 */
import fs from 'fs'
import path from 'path'

export function getToken(): string {
  if (process.env.INSTALL_TOKEN) return process.env.INSTALL_TOKEN
  // fallback: read from file generated at build time
  try {
    const p = path.join(process.cwd(), 'api', '_token.txt')
    return fs.readFileSync(p, 'utf8').trim()
  } catch {
    return ''
  }
}

export function checkAuth(req: { headers: Record<string, string | string[] | undefined> }): boolean {
  const token = getToken()
  if (!token) return false
  const header = req.headers['x-install-token']
  const value = Array.isArray(header) ? header[0] : header
  return value === token
}
