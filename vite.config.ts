import { defineConfig, type Plugin } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

function skillInstallerPlugin(): Plugin {
  return {
    name: 'skill-installer',
    buildStart() {
      const root = process.cwd()

      // ── 1. Generate / read a stable install token ──────────────────────────
      // In production Vercel reads INSTALL_TOKEN env var.
      // Locally we write one to api/_token.txt so the dev server can use it.
      const tokenFile = path.join(root, 'api', '_token.txt')
      let token = process.env.INSTALL_TOKEN || ''
      if (!token) {
        if (fs.existsSync(tokenFile)) {
          token = fs.readFileSync(tokenFile, 'utf8').trim()
        } else {
          token = crypto.randomBytes(24).toString('hex')
          fs.mkdirSync(path.dirname(tokenFile), { recursive: true })
          fs.writeFileSync(tokenFile, token, 'utf8')
          console.log('[Skill Installer Plugin] Generated new install token → api/_token.txt')
        }
      }

      // ── 2. Remove old static files that should no longer be public ─────────
      const toRemove = [
        path.join(root, 'public', 'install.js'),
        path.join(root, 'public', 'install.sh'),
        path.join(root, 'public', 'install.ps1'),
        path.join(root, 'public', 'api', 'files.json'),
      ]
      for (const f of toRemove) {
        if (fs.existsSync(f)) {
          fs.rmSync(f)
          console.log(`[Skill Installer Plugin] Removed public static: ${path.relative(root, f)}`)
        }
      }
      // Remove empty public/api dir if empty
      const apiDir = path.join(root, 'public', 'api')
      if (fs.existsSync(apiDir) && fs.readdirSync(apiDir).length === 0) {
        fs.rmdirSync(apiDir)
      }

      console.log('[Skill Installer Plugin] Token-protected install API ready.')
    }
  }
}

export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    skillInstallerPlugin(),
  ],
})
