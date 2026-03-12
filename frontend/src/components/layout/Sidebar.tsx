import { NavLink } from 'react-router-dom'
import { useAuth } from '../../lib/auth'
import { LayoutDashboard, Settings, Users, LogOut, X } from 'lucide-react'

interface SidebarProps {
  open: boolean
  onClose: () => void
}

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, adminOnly: false },
  { to: '/benutzer', label: 'Benutzerverwaltung', icon: Users, adminOnly: true },
  { to: '/einstellungen', label: 'Einstellungen', icon: Settings, adminOnly: false },
]

export function Sidebar({ open, onClose }: SidebarProps) {
  const { user, logout } = useAuth()

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-secondary z-50
          flex flex-col border-r border-border
          transition-transform duration-200
          lg:translate-x-0 lg:static lg:z-auto
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo area */}
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-accent font-bold text-sm">KK</span>
            </div>
            <div>
              <h1 className="text-sm font-bold text-text leading-tight">Kanzlei Kissling</h1>
              <p className="text-xs text-text-muted">KI-Assistent</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-text-muted hover:text-text cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {NAV_ITEMS
            .filter(item => !item.adminOnly || user?.role === 'admin')
            .map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary/20 text-accent'
                    : 'text-text-muted hover:text-text hover:bg-surface-light'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User info + logout */}
        {user && (
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary/30 flex items-center justify-center text-xs font-bold text-accent">
                {(user.name || user.email)[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text truncate">{user.name || user.email}</p>
                <p className="text-xs text-text-muted truncate">{user.role === 'admin' ? 'Administrator' : 'Benutzer'}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 text-sm text-text-muted hover:text-error transition-colors w-full cursor-pointer"
            >
              <LogOut size={16} />
              Abmelden
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
