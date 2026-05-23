import FileExplorer from './FileExplorer'
import './Explorer.css'

export default function Explorer() {
  return (
    <div className="explorer">
      <div className="explorer-header">
        <div className="explorer-title-row">
          <div>
            <h2 className="explorer-title">Skill Contents Explorer</h2>
            <p className="explorer-subtitle">
              Browse the actual source files inside <code>ui-ux-pro-max</code> — click any file to view its raw content
            </p>
          </div>
        </div>
      </div>
      <div className="explorer-body">
        <FileExplorer />
      </div>
    </div>
  )
}
