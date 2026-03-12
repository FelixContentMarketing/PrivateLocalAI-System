import { Menu } from 'lucide-react'
import { StatusIndicator } from '../molecules/StatusIndicator'

interface TopBarProps {
  title: string
  ollamaConnected: boolean | null
  openrouterConfigured: boolean
  onMenuClick: () => void
}

export function TopBar({ title, ollamaConnected, openrouterConfigured, onMenuClick }: TopBarProps) {
  return (
    <header className="bg-surface border-b border-border sticky top-0 z-30">
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden text-text-muted hover:text-text cursor-pointer"
          >
            <Menu size={22} />
          </button>
          <h2 className="text-base sm:text-lg font-bold text-text">{title}</h2>
        </div>
        <div className="flex items-center gap-3">
          <StatusIndicator connected={ollamaConnected} label="Ollama" />
          {openrouterConfigured && (
            <div className="flex items-center gap-1.5 text-xs text-text-muted">
              <div className="w-2 h-2 rounded-full bg-success" />
              Cloud
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
