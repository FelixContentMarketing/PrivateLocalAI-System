import { Lock } from 'lucide-react'
import { StatusIndicator } from '../molecules/StatusIndicator'

interface HeaderProps {
  ollamaConnected: boolean | null
}

export function Header({ ollamaConnected }: HeaderProps) {
  return (
    <header className="bg-dark-surface border-b border-dark-border sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Lock size={22} className="text-accent-500" />
          <div>
            <h1 className="text-base sm:text-lg font-bold text-dark-text leading-tight">PrivateLocalAI</h1>
            <p className="text-xs text-dark-muted">100% lokale KI-Verarbeitung</p>
          </div>
        </div>
        <StatusIndicator connected={ollamaConnected} />
      </div>
    </header>
  )
}
