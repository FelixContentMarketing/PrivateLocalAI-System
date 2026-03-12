import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { useHealth } from '../../hooks/useHealth'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/einstellungen': 'Einstellungen',
}

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const { ollamaConnected, openrouterConfigured } = useHealth()

  const title = PAGE_TITLES[location.pathname] || 'Dashboard'

  return (
    <div className="min-h-screen flex bg-bg-dark">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          title={title}
          ollamaConnected={ollamaConnected}
          openrouterConfigured={openrouterConfigured}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
