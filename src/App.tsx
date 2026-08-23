import { useState } from 'react'
import type React from 'react'
import Explorer from './Explorer'
import './App.css'
import './tailwind-polyfill.css'
import { SupportedAgents } from './SupportedAgents'



type OS = 'mac' | 'windows' | 'powershell'



const ORIGIN = 'https://skillme-install.vercel.app'

function getCommands() {
  return {
    mac:        `curl -fsSL ${ORIGIN}/install | bash`,
    powershell: `irm ${ORIGIN}/install | iex`,
    windows:    `powershell -c "irm ${ORIGIN}/install | iex"`,
  }
}

function getRemoveCommands() {
  return {
    mac:        `curl -fsSL ${ORIGIN}/remove | bash`,
    powershell: `irm ${ORIGIN}/remove | iex`,
    windows:    `powershell -c "irm ${ORIGIN}/remove | iex"`,
  }
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(text) }
    catch {
      const el = document.createElement('textarea')
      el.value = text; document.body.appendChild(el); el.select()
      document.execCommand('copy'); document.body.removeChild(el)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button type="button" className={`copy-btn ${copied ? 'copied' : ''}`} onClick={handleCopy} aria-label={copied ? 'Copied!' : 'Copy command'}>
      {copied ? (
        <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>Copied</>
      ) : (
        <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>Copy</>
      )}
    </button>
  )
}

export default function App() {
  const [activeOS, setActiveOS] = useState<OS>('windows')
  const [activeUninstallOS, setActiveUninstallOS] = useState<OS>('windows')

  const commands = getCommands()
  const removeCommands = getRemoveCommands()

  return (
    <div className="page" style={{ '--agent-color': '#ec4899' } as React.CSSProperties}>
      <div className="ambient-glow" />

      {/* ── HERO ── */}
      <header className="hero-section">
        <h1><span className="gradient-text">ui-ux-pro-max</span></h1>
        <p className="hero-desc">
          A comprehensive design intelligence skill for your AI Agent. Gives your AI agent
          expert-level UI/UX knowledge — styles, colors, typography, UX guidelines,
          and stack-specific best practices, all searchable via BM25.
        </p>

        <SupportedAgents />
      </header>



      {/* ── INSTALL ── */}
      <section className="install-section" aria-labelledby="install-heading">
        <h2 id="install-heading">Install in one command</h2>
        <p className="section-desc">
          Run from the <strong>root of your project</strong> — installs the skill into{' '}
          <code className="highlight-path">your agent's config folder</code> where your AI picks it up automatically.
        </p>
        <div className="os-tabs" role="tablist" aria-label="Operating system">
          {(['windows', 'powershell', 'mac'] as OS[]).map((os) => (
            <button key={os} role="tab" type="button" aria-selected={activeOS === os}
              className={`os-tab ${activeOS === os ? 'active' : ''}`} onClick={() => setActiveOS(os)}>
              {os === 'mac' ? 'macOS / Linux' : os === 'powershell' ? 'PowerShell' : 'Windows (CMD)'}
            </button>
          ))}
        </div>
        <div className="command-box" role="tabpanel">
          <span className="prompt" aria-hidden="true">$</span>
          <code className="command-text">{commands[activeOS]}</code>
          <CopyButton text={commands[activeOS]} />
        </div>
      </section>

      {/* ── UNINSTALL ── */}
      <section className="uninstall-section" aria-labelledby="uninstall-heading">
        <h3 id="uninstall-heading">Uninstall</h3>
        <div className="uninstall-row">
          <div className="os-tabs os-tabs-sm" role="tablist" aria-label="OS for uninstall">
            {(['windows', 'powershell', 'mac'] as OS[]).map((os) => (
              <button key={os} role="tab" type="button" aria-selected={activeUninstallOS === os}
                className={`os-tab ${activeUninstallOS === os ? 'active' : ''}`} onClick={() => setActiveUninstallOS(os)}>
                {os === 'mac' ? 'macOS / Linux' : os === 'powershell' ? 'PowerShell' : 'Windows (CMD)'}
              </button>
            ))}
          </div>
          <div className="command-box command-box-sm" role="tabpanel">
            <span className="prompt" aria-hidden="true">$</span>
            <code className="command-text">{removeCommands[activeUninstallOS]}</code>
            <CopyButton text={removeCommands[activeUninstallOS]} />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="steps-section" aria-labelledby="steps-heading">
        <h2 id="steps-heading">How it works</h2>
        <div className="steps-list">
            <div className="step">
              <div className="step-num" aria-hidden="true">01</div>
              <div className="step-content"><h3>Copy install command</h3><p>Pick your shell and copy the one-liner below</p></div>
            </div>
            <div className="step">
              <div className="step-num" aria-hidden="true">02</div>
              <div className="step-content"><h3>Run in your project root</h3><p>Open the terminal in your project and paste it</p></div>
            </div>
            <div className="step">
              <div className="step-num" aria-hidden="true">03</div>
              <div className="step-content"><h3>Done</h3><p>Your AI Agent picks up the skill automatically on next session</p></div>
            </div>
        </div>
      </section>

      {/* ── EXPLORER ── */}
      <Explorer />
    </div>
  )
}
