import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { UserPlus, CheckCircle } from 'lucide-react'

export function RegisterPage() {
  const { register } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      const message = await register(name, email, password)
      setSuccess(message)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registrierung fehlgeschlagen')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-surface border border-border rounded-xl p-8">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-accent font-bold text-lg">KK</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-text">Kanzlei Kissling</h1>
              <p className="text-sm text-text-muted">Registrierung</p>
            </div>
          </div>

          {success ? (
            <div className="text-center">
              <CheckCircle size={48} className="text-success mx-auto mb-4" />
              <p className="text-sm text-text mb-4">{success}</p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-dark text-secondary font-semibold rounded-lg transition-colors"
              >
                Zum Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <div className="p-3 text-sm text-error bg-error/10 border border-error/20 rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-text" htmlFor="name">Name</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ihr vollstaendiger Name"
                  required
                  className="w-full px-3 py-2.5 text-sm border border-border rounded-lg bg-bg-dark text-text placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-text" htmlFor="reg-email">E-Mail</label>
                <input
                  id="reg-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ihre@email.de"
                  required
                  className="w-full px-3 py-2.5 text-sm border border-border rounded-lg bg-bg-dark text-text placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-text" htmlFor="reg-password">Passwort</label>
                <input
                  id="reg-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mindestens 8 Zeichen"
                  required
                  minLength={8}
                  className="w-full px-3 py-2.5 text-sm border border-border rounded-lg bg-bg-dark text-text placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
                />
              </div>

              <div className="p-3 text-xs text-text-muted bg-surface-light border border-border rounded-lg">
                Nach der Registrierung muss ein Administrator Ihren Zugang freischalten.
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-dark text-secondary font-semibold rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
              >
                <UserPlus size={18} />
                {loading ? 'Registrieren...' : 'Registrieren'}
              </button>

              <p className="text-center text-sm text-text-muted">
                Bereits registriert?{' '}
                <Link to="/login" className="text-accent hover:underline font-medium">
                  Anmelden
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
