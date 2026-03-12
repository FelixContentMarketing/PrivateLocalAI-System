import { useState, useEffect, useCallback } from 'react'
import { getUsers, activateUser, deactivateUser, changeUserRole, deleteUser } from '../lib/api'
import type { ManagedUser } from '../lib/types'
import { UserCheck, UserX, Shield, Trash2, RefreshCw } from 'lucide-react'

export function BenutzerPage() {
  const [users, setUsers] = useState<ManagedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getUsers()
      setUsers(data.users)
    } catch {
      setMessage({ type: 'error', text: 'Fehler beim Laden der Benutzer' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const handleAction = async (action: () => Promise<unknown>, userId: string) => {
    setActionLoading(userId)
    setMessage(null)
    try {
      await action()
      await loadUsers()
      setMessage({ type: 'success', text: 'Aktion erfolgreich ausgefuehrt.' })
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Fehler' })
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (user: ManagedUser) => {
    if (!confirm(`Benutzer ${user.email} wirklich loeschen?`)) return
    await handleAction(() => deleteUser(user.id), user.id)
  }

  if (loading) {
    return <div className="text-text-muted text-sm">Benutzer werden geladen...</div>
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-text">Benutzerverwaltung</h3>
        <button
          onClick={loadUsers}
          className="flex items-center gap-2 px-3 py-2 text-sm text-text-muted hover:text-text transition-colors cursor-pointer"
        >
          <RefreshCw size={16} />
          Aktualisieren
        </button>
      </div>

      {message && (
        <div className={`px-4 py-3 rounded-lg text-sm ${
          message.type === 'success'
            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
            : 'bg-red-500/10 text-red-400 border border-red-500/20'
        }`}>
          {message.text}
        </div>
      )}

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-4 py-3 text-text-muted font-medium">Name</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">E-Mail</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Rolle</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Status</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Registriert</th>
              <th className="text-right px-4 py-3 text-text-muted font-medium">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const isActive = Boolean(user.is_active)
              const isLoading = actionLoading === user.id
              return (
                <tr key={user.id} className="border-b border-border/50 last:border-0 hover:bg-surface-light/50">
                  <td className="px-4 py-3 text-text">{user.name || '--'}</td>
                  <td className="px-4 py-3 text-text">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                      user.role === 'admin'
                        ? 'bg-accent/20 text-accent'
                        : 'bg-primary/20 text-blue-300'
                    }`}>
                      {user.role === 'admin' ? 'Admin' : 'Benutzer'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                      isActive
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {isActive ? 'Aktiv' : 'Wartend'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-muted">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString('de-DE') : '--'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {!isActive ? (
                        <button
                          onClick={() => handleAction(() => activateUser(user.id), user.id)}
                          disabled={isLoading}
                          title="Freischalten"
                          className="p-1.5 rounded hover:bg-green-500/20 text-green-400 transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          <UserCheck size={16} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAction(() => deactivateUser(user.id), user.id)}
                          disabled={isLoading}
                          title="Deaktivieren"
                          className="p-1.5 rounded hover:bg-orange-500/20 text-orange-400 transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          <UserX size={16} />
                        </button>
                      )}

                      <button
                        onClick={() => handleAction(
                          () => changeUserRole(user.id, user.role === 'admin' ? 'user' : 'admin'),
                          user.id,
                        )}
                        disabled={isLoading}
                        title={user.role === 'admin' ? 'Zum Benutzer machen' : 'Zum Admin machen'}
                        className="p-1.5 rounded hover:bg-accent/20 text-accent transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        <Shield size={16} />
                      </button>

                      <button
                        onClick={() => handleDelete(user)}
                        disabled={isLoading}
                        title="Loeschen"
                        className="p-1.5 rounded hover:bg-red-500/20 text-red-400 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="px-4 py-8 text-center text-text-muted text-sm">
            Keine Benutzer vorhanden.
          </div>
        )}
      </div>
    </div>
  )
}
