import { useState } from 'react'
import type React from 'react'
import Explorer from './Explorer'
import './App.css'

const SKILL_NAME = 'ui-ux-pro-max'
const SKILL_DEST = '.kiro/steering/ui-ux-pro-max'

const features = [
  { icon: 'palette', label: '67 UI Styles', desc: 'Glassmorphism, Neumorphism, Brutalism, Minimalism and more' },
  { icon: 'swatch', label: '96 Color Palettes', desc: 'Curated palettes for SaaS, e-commerce, healthcare, fintech and more' },
  { icon: 'type', label: '57 Font Pairings', desc: 'Google Fonts combinations with mood and use-case guidance' },
  { icon: 'shield-check', label: '99 UX Guidelines', desc: 'Accessibility, animation, keyboard nav, and anti-patterns' },
  { icon: 'chart-bar', label: '25 Chart Types', desc: 'Data visualization recommendations with library suggestions' },
  { icon: 'stack', label: '13 Tech Stacks', desc: 'React, Next.js, Vue, Svelte, Flutter, SwiftUI and more' },
]

const steps = [
  { num: '01', title: 'Copy install command', desc: 'Pick your shell and copy the one-liner below' },
  { num: '02', title: 'Run in your project root', desc: 'Open the terminal in your project and paste it' },
  { num: '03', title: 'Done', desc: 'Kiro picks up the skill automatically on next session' },
]

const ORIGIN = 'https://skillme-install.vercel.app'

const commands = {
  mac:        `curl -fsSL ${ORIGIN}/get | bash`,
  powershell: `irm ${ORIGIN}/get | iex`,
  windows:    `node -e "require('https').get('${ORIGIN}/get',r=>{let d='';r.on('data',c=>d+=c);r.on('end',()=>eval(d))})"`,
}

type OS = 'mac' | 'windows' | 'powershell'

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

function FeatureIcon({ name }: { name: string }) {
  const icons: Record<string, React.ReactElement> = {
    palette: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor" /><circle cx="17.5" cy="10.5" r=".5" fill="currentColor" /><circle cx="8.5" cy="7.5" r=".5" fill="currentColor" /><circle cx="6.5" cy="12.5" r=".5" fill="currentColor" /><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" /></svg>,
    swatch: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 2H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-7" /><path d="M9 18H4v-5" /><path d="m22 2-5 5" /><path d="M17 2h5v5" /></svg>,
    type: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="4 7 4 4 20 4 20 7" /><line x1="9" y1="20" x2="15" y2="20" /><line x1="12" y1="4" x2="12" y2="20" /></svg>,
    'shield-check': <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" /></svg>,
    'chart-bar': <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" /></svg>,
    stack: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>,
  }
  return icons[name] ?? null
}

export default function App() {
  const [activeOS, setActiveOS] = useState<OS>('mac')

  return (
    <div className="page">
      {/* ── HERO ── */}
      <header className="hero-section">
        <div className="badge">Kiro Skill</div>
        <h1><span className="gradient-text">ui-ux-pro-max</span></h1>
        <p className="hero-desc">
          A comprehensive design intelligence skill for Kiro. Gives your AI agent
          expert-level UI/UX knowledge — styles, colors, typography, UX guidelines,
          and stack-specific best practices, all searchable via BM25.
        </p>
        <div className="hero-stats">
          <div className="stat"><strong>67</strong><span>Styles</span></div>
          <div className="stat-divider" aria-hidden="true" />
          <div className="stat"><strong>96</strong><span>Palettes</span></div>
          <div className="stat-divider" aria-hidden="true" />
          <div className="stat"><strong>57</strong><span>Font Pairs</span></div>
          <div className="stat-divider" aria-hidden="true" />
          <div className="stat"><strong>99</strong><span>UX Rules</span></div>
          <div className="stat-divider" aria-hidden="true" />
          <div className="stat"><strong>13</strong><span>Stacks</span></div>
        </div>
      </header>

      {/* ── INSTALL ── */}
      <section className="install-section" aria-labelledby="install-heading">
        <h2 id="install-heading">Install in one command</h2>
        <p className="section-desc">
          Run from the <strong>root of your project</strong> — installs the skill into{' '}
          <code>{SKILL_DEST}/</code> where Kiro picks it up automatically.
        </p>
        <div className="os-tabs" role="tablist" aria-label="Operating system">
          {(['mac', 'powershell', 'windows'] as OS[]).map((os) => (
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
        <p className="install-note">
          Requires <code>node</code> · Installs to <code>.kiro/steering/{SKILL_NAME}/</code>
        </p>
      </section>

      {/* ── FEATURES ── */}
      <section className="features-section" aria-labelledby="features-heading">
        <h2 id="features-heading">What's inside</h2>
        <p className="section-desc">
          A searchable database powered by BM25 — the same algorithm used in search engines.
          Kiro queries it to get precise, context-aware design recommendations.
        </p>
        <div className="features-grid">
          {features.map((f) => (
            <div key={f.label} className="feature-card">
              <div className="feature-icon" aria-hidden="true"><FeatureIcon name={f.icon} /></div>
              <h3>{f.label}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── EXPLORER ── */}
      <Explorer />

      {/* ── HOW IT WORKS ── */}
      <section className="steps-section" aria-labelledby="steps-heading">
        <h2 id="steps-heading">How it works</h2>
        <div className="steps-list">
          {steps.map((s) => (
            <div key={s.num} className="step">
              <div className="step-num" aria-hidden="true">{s.num}</div>
              <div className="step-content"><h3>{s.title}</h3><p>{s.desc}</p></div>
            </div>
          ))}
        </div>
      </section>

      {/* ── USAGE EXAMPLE ── */}
      <section className="usage-section" aria-labelledby="usage-heading">
        <h2 id="usage-heading">After installing, just ask Kiro</h2>
        <div className="usage-examples">
          <div className="usage-card"><div className="usage-label">Design System</div><p>"Generate a design system for a fintech SaaS dashboard"</p></div>
          <div className="usage-card"><div className="usage-label">Stack Guidelines</div><p>"What are the best practices for React performance?"</p></div>
          <div className="usage-card"><div className="usage-label">UX Review</div><p>"Review my landing page for UX anti-patterns"</p></div>
          <div className="usage-card"><div className="usage-label">Color Palette</div><p>"Suggest a color palette for a healthcare app"</p></div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <p><strong>{SKILL_NAME}</strong> — a Kiro Skill for professional UI/UX design</p>
      </footer>
    </div>
  )
}
