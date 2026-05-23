import { useState, useMemo } from 'react'
import { styles, colors, typography, uxGuidelines, charts, stacks, products, landingPatterns } from './data/skillData'
import './Explorer.css'

type Tab = 'styles' | 'colors' | 'typography' | 'ux' | 'charts' | 'stacks' | 'products' | 'landing'

const TABS: { id: Tab; label: string; count: number; icon: string }[] = [
  { id: 'styles',     label: 'UI Styles',       count: 67,  icon: '🎨' },
  { id: 'colors',     label: 'Color Palettes',  count: 96,  icon: '🎨' },
  { id: 'typography', label: 'Font Pairings',   count: 57,  icon: 'T' },
  { id: 'ux',         label: 'UX Guidelines',   count: 99,  icon: '✓' },
  { id: 'charts',     label: 'Chart Types',     count: 25,  icon: '📊' },
  { id: 'stacks',     label: 'Tech Stacks',     count: 13,  icon: '⚡' },
  { id: 'products',   label: 'Product Types',   count: 96,  icon: '📦' },
  { id: 'landing',    label: 'Landing Patterns',count: 30,  icon: '🚀' },
]

const SEVERITY_COLOR: Record<string, string> = {
  High: 'sev-high',
  Medium: 'sev-medium',
  Low: 'sev-low',
}

function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="search-wrap">
      <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        type="search"
        className="search-input"
        placeholder="Search…"
        value={value}
        onChange={e => onChange(e.target.value)}
        aria-label="Search content"
      />
      {value && (
        <button className="search-clear" onClick={() => onChange('')} aria-label="Clear search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  )
}

function ColorSwatch({ hex }: { hex: string }) {
  return (
    <span
      className="color-swatch"
      style={{ background: hex }}
      title={hex}
      aria-label={`Color ${hex}`}
    />
  )
}

function Badge({ text, variant = 'default' }: { text: string; variant?: string }) {
  return <span className={`badge badge-${variant}`}>{text}</span>
}

// ── Tab Panels ────────────────────────────────────────────────────────────────

function StylesPanel({ q }: { q: string }) {
  const items = useMemo(() => {
    if (!q) return styles
    const lq = q.toLowerCase()
    return styles.filter(s =>
      s.name.toLowerCase().includes(lq) ||
      s.keywords.toLowerCase().includes(lq) ||
      s.bestFor.toLowerCase().includes(lq) ||
      s.type.toLowerCase().includes(lq)
    )
  }, [q])

  return (
    <div className="panel-grid">
      {items.map(s => (
        <div key={s.name} className="card">
          <div className="card-header">
            <span className="card-title">{s.name}</span>
            <Badge text={s.type} variant={s.type === 'Landing Page' ? 'accent' : 'default'} />
          </div>
          <p className="card-keywords">{s.keywords}</p>
          <p className="card-meta"><strong>Best for:</strong> {s.bestFor}</p>
          <div className="card-footer">
            <span className="tag">{s.performance}</span>
            <span className="tag">{s.accessibility}</span>
            <span className="tag tag-muted">{s.era}</span>
            <span className={`tag tag-complexity-${s.complexity.toLowerCase()}`}>{s.complexity}</span>
          </div>
        </div>
      ))}
      {items.length === 0 && <p className="empty">No results for "{q}"</p>}
    </div>
  )
}

function ColorsPanel({ q }: { q: string }) {
  const items = useMemo(() => {
    if (!q) return colors
    const lq = q.toLowerCase()
    return colors.filter(c =>
      c.type.toLowerCase().includes(lq) ||
      c.notes.toLowerCase().includes(lq)
    )
  }, [q])

  return (
    <div className="panel-list">
      {items.map(c => (
        <div key={c.type} className="color-row">
          <div className="color-row-name">{c.type}</div>
          <div className="color-swatches">
            <div className="swatch-item"><ColorSwatch hex={c.primary} /><span>Primary</span><code>{c.primary}</code></div>
            <div className="swatch-item"><ColorSwatch hex={c.secondary} /><span>Secondary</span><code>{c.secondary}</code></div>
            <div className="swatch-item"><ColorSwatch hex={c.cta} /><span>CTA</span><code>{c.cta}</code></div>
            <div className="swatch-item"><ColorSwatch hex={c.bg} /><span>BG</span><code>{c.bg}</code></div>
            <div className="swatch-item"><ColorSwatch hex={c.text} /><span>Text</span><code>{c.text}</code></div>
          </div>
          <div className="color-notes">{c.notes}</div>
        </div>
      ))}
      {items.length === 0 && <p className="empty">No results for "{q}"</p>}
    </div>
  )
}

function TypographyPanel({ q }: { q: string }) {
  const items = useMemo(() => {
    if (!q) return typography
    const lq = q.toLowerCase()
    return typography.filter(t =>
      t.name.toLowerCase().includes(lq) ||
      t.heading.toLowerCase().includes(lq) ||
      t.body.toLowerCase().includes(lq) ||
      t.mood.toLowerCase().includes(lq) ||
      t.bestFor.toLowerCase().includes(lq) ||
      t.category.toLowerCase().includes(lq)
    )
  }, [q])

  return (
    <div className="panel-grid">
      {items.map(t => (
        <div key={t.name} className="card">
          <div className="card-header">
            <span className="card-title">{t.name}</span>
            <Badge text={t.category} />
          </div>
          <div className="font-preview">
            <div className="font-heading" style={{ fontFamily: `'${t.heading}', serif` }}>
              {t.heading}
            </div>
            <div className="font-body">
              Body: {t.body}
            </div>
          </div>
          <p className="card-keywords">{t.mood}</p>
          <p className="card-meta"><strong>Best for:</strong> {t.bestFor}</p>
        </div>
      ))}
      {items.length === 0 && <p className="empty">No results for "{q}"</p>}
    </div>
  )
}

function UXPanel({ q }: { q: string }) {
  const [catFilter, setCatFilter] = useState('All')
  const categories = useMemo(() => ['All', ...Array.from(new Set(uxGuidelines.map(u => u.category)))], [])

  const items = useMemo(() => {
    let list = uxGuidelines
    if (catFilter !== 'All') list = list.filter(u => u.category === catFilter)
    if (!q) return list
    const lq = q.toLowerCase()
    return list.filter(u =>
      u.issue.toLowerCase().includes(lq) ||
      u.description.toLowerCase().includes(lq) ||
      u.category.toLowerCase().includes(lq) ||
      u.doThis.toLowerCase().includes(lq) ||
      u.dontDo.toLowerCase().includes(lq)
    )
  }, [q, catFilter])

  return (
    <div>
      <div className="filter-bar">
        {categories.map(c => (
          <button
            key={c}
            className={`filter-btn ${catFilter === c ? 'active' : ''}`}
            onClick={() => setCatFilter(c)}
          >{c}</button>
        ))}
      </div>
      <div className="panel-list">
        {items.map((u, i) => (
          <div key={i} className="ux-row">
            <div className="ux-row-left">
              <span className={`sev-badge ${SEVERITY_COLOR[u.severity]}`}>{u.severity}</span>
              <div>
                <div className="ux-issue">{u.issue}</div>
                <div className="ux-meta">{u.category} · {u.platform}</div>
              </div>
            </div>
            <div className="ux-desc">{u.description}</div>
            <div className="ux-do-dont">
              <div className="ux-do"><span>✓</span> {u.doThis}</div>
              <div className="ux-dont"><span>✗</span> {u.dontDo}</div>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="empty">No results for "{q}"</p>}
      </div>
    </div>
  )
}

function ChartsPanel({ q }: { q: string }) {
  const items = useMemo(() => {
    if (!q) return charts
    const lq = q.toLowerCase()
    return charts.filter(c =>
      c.dataType.toLowerCase().includes(lq) ||
      c.keywords.toLowerCase().includes(lq) ||
      c.bestChart.toLowerCase().includes(lq) ||
      c.library.toLowerCase().includes(lq)
    )
  }, [q])

  return (
    <div className="panel-grid">
      {items.map(c => (
        <div key={c.dataType} className="card">
          <div className="card-header">
            <span className="card-title">{c.dataType}</span>
          </div>
          <p className="card-keywords">{c.keywords}</p>
          <p className="card-meta"><strong>Best chart:</strong> {c.bestChart}</p>
          <p className="card-meta"><strong>Also consider:</strong> {c.secondary}</p>
          <p className="card-meta"><strong>Library:</strong> {c.library}</p>
          <div className="card-footer">
            <span className="tag">{c.interactive}</span>
            <span className="tag tag-muted">{c.accessibility}</span>
          </div>
        </div>
      ))}
      {items.length === 0 && <p className="empty">No results for "{q}"</p>}
    </div>
  )
}

function StacksPanel() {
  return (
    <div className="panel-grid panel-grid-sm">
      {stacks.map(s => (
        <div key={s.id} className={`card card-stack ${s.default ? 'card-stack-default' : ''}`}>
          <div className="card-header">
            <span className="card-title">{s.label}</span>
            {s.default && <Badge text="DEFAULT" variant="accent" />}
          </div>
          <p className="card-meta">{s.desc}</p>
          <code className="stack-cmd">--stack {s.id}</code>
        </div>
      ))}
    </div>
  )
}

function ProductsPanel({ q }: { q: string }) {
  const items = useMemo(() => {
    if (!q) return products
    const lq = q.toLowerCase()
    return products.filter(p =>
      p.type.toLowerCase().includes(lq) ||
      p.primaryStyle.toLowerCase().includes(lq) ||
      p.colorFocus.toLowerCase().includes(lq) ||
      p.considerations.toLowerCase().includes(lq)
    )
  }, [q])

  return (
    <div className="panel-grid">
      {items.map(p => (
        <div key={p.type} className="card">
          <div className="card-header">
            <span className="card-title">{p.type}</span>
          </div>
          <p className="card-meta"><strong>Style:</strong> {p.primaryStyle}</p>
          <p className="card-meta"><strong>Landing:</strong> {p.landingPattern}</p>
          <p className="card-meta"><strong>Colors:</strong> {p.colorFocus}</p>
          <p className="card-keywords">{p.considerations}</p>
        </div>
      ))}
      {items.length === 0 && <p className="empty">No results for "{q}"</p>}
    </div>
  )
}

function LandingPanel({ q }: { q: string }) {
  const items = useMemo(() => {
    if (!q) return landingPatterns
    const lq = q.toLowerCase()
    return landingPatterns.filter(l =>
      l.name.toLowerCase().includes(lq) ||
      l.keywords.toLowerCase().includes(lq) ||
      l.sections.toLowerCase().includes(lq) ||
      l.conversion.toLowerCase().includes(lq)
    )
  }, [q])

  return (
    <div className="panel-grid">
      {items.map(l => (
        <div key={l.name} className="card">
          <div className="card-header">
            <span className="card-title">{l.name}</span>
          </div>
          <p className="card-keywords">{l.keywords}</p>
          <p className="card-meta"><strong>Sections:</strong> {l.sections}</p>
          <p className="card-meta"><strong>CTA:</strong> {l.ctaPlacement}</p>
          <p className="card-meta card-conversion">{l.conversion}</p>
        </div>
      ))}
      {items.length === 0 && <p className="empty">No results for "{q}"</p>}
    </div>
  )
}

// ── Main Explorer ─────────────────────────────────────────────────────────────
export default function Explorer() {
  const [activeTab, setActiveTab] = useState<Tab>('styles')
  const [query, setQuery] = useState('')

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab)
    setQuery('')
  }

  return (
    <div className="explorer">
      {/* Header */}
      <div className="explorer-header">
        <div className="explorer-title-row">
          <div>
            <h2 className="explorer-title">Skill Contents Explorer</h2>
            <p className="explorer-subtitle">
              Browse all data inside <code>ui-ux-pro-max</code> — the actual source Kiro searches when you ask for UI/UX help
            </p>
          </div>
          <SearchBar value={query} onChange={setQuery} />
        </div>

        {/* Tabs */}
        <div className="explorer-tabs" role="tablist">
          {TABS.map(t => (
            <button
              key={t.id}
              role="tab"
              aria-selected={activeTab === t.id}
              className={`explorer-tab ${activeTab === t.id ? 'active' : ''}`}
              onClick={() => handleTabChange(t.id)}
            >
              <span className="tab-label">{t.label}</span>
              <span className="tab-count">{t.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Panel */}
      <div className="explorer-body" role="tabpanel">
        {activeTab === 'styles'     && <StylesPanel     q={query} />}
        {activeTab === 'colors'     && <ColorsPanel     q={query} />}
        {activeTab === 'typography' && <TypographyPanel q={query} />}
        {activeTab === 'ux'         && <UXPanel         q={query} />}
        {activeTab === 'charts'     && <ChartsPanel     q={query} />}
        {activeTab === 'stacks'     && <StacksPanel />}
        {activeTab === 'products'   && <ProductsPanel   q={query} />}
        {activeTab === 'landing'    && <LandingPanel    q={query} />}
      </div>
    </div>
  )
}
