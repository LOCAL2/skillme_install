import { useState, useMemo } from 'react'
import './FileExplorer.css'

// ── Static file data bundled at build time ────────────────────────────────────
const RAW_FILES = import.meta.glob(
  '/skill/ui-ux-pro-max/**',
  { query: '?raw', import: 'default', eager: true }
)

interface FileEntry {
  path: string        // full relative path from skill root, e.g. "data/colors.csv"
  name: string        // filename only
  ext:  string        // extension without dot
  content: string
}

// Build flat list from glob keys
const FILES: FileEntry[] = Object.entries(RAW_FILES)
  .filter(([k]) => !k.includes('__pycache__') && !k.endsWith('.pyc'))
  .map(([k, content]) => {
    // k looks like "/skill/ui-ux-pro-max/data/colors.csv"
    const path = k.replace('/skill/ui-ux-pro-max/', '')
    const name = path.split('/').pop()!
    const ext  = name.includes('.') ? name.split('.').pop()! : ''
    return { path, name, ext, content: content as string }
  })
  .sort((a, b) => {
    // folders before files, then alphabetical
    const aDepth = a.path.split('/').length
    const bDepth = b.path.split('/').length
    if (aDepth !== bDepth) return aDepth - bDepth
    return a.path.localeCompare(b.path)
  })

// ── Tree builder ──────────────────────────────────────────────────────────────
interface TreeNode {
  name: string
  path: string
  isDir: boolean
  children: TreeNode[]
  file?: FileEntry
}

function buildTree(files: FileEntry[]): TreeNode[] {
  const root: TreeNode[] = []

  for (const file of files) {
    const parts = file.path.split('/')
    let nodes = root

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      const isLast = i === parts.length - 1
      const existing = nodes.find(n => n.name === part)

      if (existing) {
        nodes = existing.children
      } else {
        const node: TreeNode = {
          name: part,
          path: parts.slice(0, i + 1).join('/'),
          isDir: !isLast,
          children: [],
          file: isLast ? file : undefined,
        }
        nodes.push(node)
        nodes = node.children
      }
    }
  }

  return root
}

// ── Syntax highlight (no deps) ────────────────────────────────────────────────
function highlight(code: string, ext: string): string {
  const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  if (ext === 'csv') {
    return code
      .split('\n')
      .map((line, i) => {
        if (i === 0) {
          // header row
          const cells = line.split(',').map(c => `<span class="csv-header">${esc(c)}</span>`)
          return cells.join('<span class="csv-comma">,</span>')
        }
        const cells = line.split(',').map(c => `<span class="csv-cell">${esc(c)}</span>`)
        return cells.join('<span class="csv-comma">,</span>')
      })
      .join('\n')
  }

  if (ext === 'py') {
    let h = esc(code)
    // strings
    h = h.replace(/(&#x27;&#x27;&#x27;[\s\S]*?&#x27;&#x27;&#x27;|&quot;&quot;&quot;[\s\S]*?&quot;&quot;&quot;|&#x27;[^&#x27;\n]*&#x27;|&quot;[^&quot;\n]*&quot;)/g,
      '<span class="py-str">$1</span>')
    // comments
    h = h.replace(/(#[^\n]*)/g, '<span class="py-comment">$1</span>')
    // keywords
    h = h.replace(/\b(def|class|import|from|return|if|elif|else|for|while|in|not|and|or|True|False|None|try|except|with|as|pass|raise|yield|lambda|global|nonlocal|del|assert|break|continue)\b/g,
      '<span class="py-kw">$1</span>')
    // builtins / decorators
    h = h.replace(/(@\w+)/g, '<span class="py-dec">$1</span>')
    // numbers
    h = h.replace(/\b(\d+\.?\d*)\b/g, '<span class="py-num">$1</span>')
    return h
  }

  if (ext === 'md') {
    return code
      .split('\n')
      .map(line => {
        const e = esc(line)
        if (/^#{1,6} /.test(line)) return `<span class="md-heading">${e}</span>`
        if (/^```/.test(line))      return `<span class="md-fence">${e}</span>`
        if (/^\s*[-*] /.test(line)) return `<span class="md-li">${e}</span>`
        if (/^\|/.test(line))       return `<span class="md-table">${e}</span>`
        return e
      })
      .join('\n')
  }

  if (ext === 'json') {
    let h = esc(code)
    h = h.replace(/(&quot;[^&]*&quot;)\s*:/g, '<span class="json-key">$1</span>:')
    h = h.replace(/:\s*(&quot;[^&]*&quot;)/g, ': <span class="json-str">$1</span>')
    h = h.replace(/:\s*(\d+\.?\d*)/g, ': <span class="json-num">$1</span>')
    h = h.replace(/:\s*(true|false|null)/g, ': <span class="json-kw">$1</span>')
    return h
  }

  return esc(code)
}

// ── File icon ─────────────────────────────────────────────────────────────────
function FileIcon({ ext, isDir }: { ext: string; isDir: boolean }) {
  if (isDir) return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="tree-icon dir-icon" aria-hidden="true">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
    </svg>
  )
  if (ext === 'csv') return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="tree-icon csv-icon" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="8" y1="13" x2="16" y2="13"/>
      <line x1="8" y1="17" x2="16" y2="17"/>
    </svg>
  )
  if (ext === 'py') return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="tree-icon py-icon" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
      <path d="M8 12h8M12 8v8"/>
    </svg>
  )
  if (ext === 'md') return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="tree-icon md-icon" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="8" y1="13" x2="16" y2="13"/>
      <line x1="8" y1="17" x2="12" y2="17"/>
    </svg>
  )
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="tree-icon file-icon" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
    </svg>
  )
}

// ── Tree node ─────────────────────────────────────────────────────────────────
function TreeNodeItem({
  node, depth, selected, onSelect,
}: {
  node: TreeNode
  depth: number
  selected: string
  onSelect: (f: FileEntry) => void
}) {
  const [open, setOpen] = useState(depth === 0)

  if (node.isDir) {
    return (
      <div>
        <button
          className="tree-row tree-dir"
          style={{ paddingLeft: `${8 + depth * 16}px` }}
          onClick={() => setOpen(o => !o)}
          aria-expanded={open}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            className={`chevron ${open ? 'open' : ''}`} aria-hidden="true">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
          <FileIcon ext="" isDir />
          <span>{node.name}</span>
        </button>
        {open && node.children.map(child => (
          <TreeNodeItem key={child.path} node={child} depth={depth + 1} selected={selected} onSelect={onSelect} />
        ))}
      </div>
    )
  }

  return (
    <button
      className={`tree-row tree-file ${selected === node.path ? 'active' : ''}`}
      style={{ paddingLeft: `${8 + depth * 16}px` }}
      onClick={() => node.file && onSelect(node.file)}
    >
      <span className="tree-indent" />
      <FileIcon ext={node.file?.ext ?? ''} isDir={false} />
      <span>{node.name}</span>
    </button>
  )
}

// ── CSV Table viewer ──────────────────────────────────────────────────────────
function CsvViewer({ content, search }: { content: string; search: string }) {
  const { headers, rows } = useMemo(() => {
    const lines = content.split('\n').filter(l => l.trim())
    const parse = (line: string) => {
      const res: string[] = []
      let cur = '', inQ = false
      for (const ch of line) {
        if (ch === '"') { inQ = !inQ }
        else if (ch === ',' && !inQ) { res.push(cur); cur = '' }
        else cur += ch
      }
      res.push(cur)
      return res
    }
    return { headers: parse(lines[0] ?? ''), rows: lines.slice(1).map(parse) }
  }, [content])

  const filtered = useMemo(() => {
    if (!search) return rows
    const lq = search.toLowerCase()
    return rows.filter(r => r.some(c => c.toLowerCase().includes(lq)))
  }, [rows, search])

  return (
    <div className="csv-wrap">
      <div className="csv-meta">{filtered.length} / {rows.length} rows · {headers.length} columns</div>
      <div className="csv-scroll">
        <table className="csv-table">
          <thead>
            <tr>{headers.map((h, i) => <th key={i}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {filtered.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => <td key={ci}>{cell}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Main FileExplorer ─────────────────────────────────────────────────────────
export default function FileExplorer() {
  const [selected, setSelected] = useState<FileEntry | null>(
    FILES.find(f => f.name === 'SKILL.md') ?? FILES[0] ?? null
  )
  const [search, setSearch] = useState('')
  const [treeSearch, setTreeSearch] = useState('')

  const visibleFiles = useMemo(() => {
    if (!treeSearch) return FILES
    const lq = treeSearch.toLowerCase()
    return FILES.filter(f => f.path.toLowerCase().includes(lq))
  }, [treeSearch])

  const filteredTree = useMemo(() => buildTree(visibleFiles), [visibleFiles])

  // Guard: no files loaded (glob failed)
  if (!selected || FILES.length === 0) {
    return (
      <div className="fe-root fe-empty">
        <p>No skill files found. Make sure <code>skill/ui-ux-pro-max/</code> exists.</p>
      </div>
    )
  }

  const lines = selected.content.split('\n').length
  const size  = (selected.content.length / 1024).toFixed(1)

  const highlighted = useMemo(
    () => highlight(selected.content, selected.ext),
    [selected]
  )

  return (
    <div className="fe-root">
      {/* ── Sidebar ── */}
      <aside className="fe-sidebar">
        <div className="fe-sidebar-header">
          <span className="fe-sidebar-title">ui-ux-pro-max</span>
          <span className="fe-file-count">{FILES.length} files</span>
        </div>
        <div className="fe-tree-search">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="search"
            placeholder="Filter files…"
            value={treeSearch}
            onChange={e => setTreeSearch(e.target.value)}
            aria-label="Filter files"
          />
        </div>
        <div className="fe-tree">
          {filteredTree.map(node => (
            <TreeNodeItem
              key={node.path}
              node={node}
              depth={0}
              selected={selected.path}
              onSelect={f => { setSelected(f); setSearch('') }}
            />
          ))}
        </div>
      </aside>

      {/* ── Viewer ── */}
      <div className="fe-viewer">
        {/* Breadcrumb + meta */}
        <div className="fe-viewer-header">
          <div className="fe-breadcrumb">
            <span className="fe-breadcrumb-root">ui-ux-pro-max</span>
            {selected.path.split('/').map((part, i, arr) => (
              <span key={i} className="fe-breadcrumb-part">
                <span className="fe-breadcrumb-sep">/</span>
                <span className={i === arr.length - 1 ? 'fe-breadcrumb-active' : ''}>{part}</span>
              </span>
            ))}
          </div>
          <div className="fe-viewer-meta">
            <span className="fe-badge fe-badge-ext">.{selected.ext}</span>
            <span className="fe-meta-item">{lines} lines</span>
            <span className="fe-meta-item">{size} KB</span>
          </div>
        </div>

        {/* Search bar for CSV */}
        {selected.ext === 'csv' && (
          <div className="fe-csv-search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="search"
              placeholder="Search rows…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Search CSV rows"
            />
            {search && (
              <button onClick={() => setSearch('')} aria-label="Clear">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="fe-content">
          {selected.ext === 'csv' ? (
            <CsvViewer content={selected.content} search={search} />
          ) : (
            <div className="fe-code-wrap">
              <div className="fe-line-nums" aria-hidden="true">
                {selected.content.split('\n').map((_, i) => (
                  <span key={i}>{i + 1}</span>
                ))}
              </div>
              <pre
                className="fe-code"
                dangerouslySetInnerHTML={{ __html: highlighted }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
