import { useState, useEffect } from 'react'
import { useAuth } from '../lib/auth'
import { getSettings, updateSettings } from '../lib/api'
import type { SettingsResponse } from '../lib/types'
import { Key, Cloud, CheckCircle, AlertCircle, Save } from 'lucide-react'

export function EinstellungenPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const [settings, setSettings] = useState<SettingsResponse | null>(null)
  const [apiKey, setApiKey] = useState('')
  const [selectedModel, setSelectedModel] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    getSettings()
      .then((data) => {
        setSettings(data)
        setSelectedModel(data.selected_model)
      })
      .catch(() => {})
  }, [])

  const handleSave = async () => {
    if (!isAdmin) return
    setSaving(true)
    setMessage(null)
    try {
      const data: Record<string, string> = {}
      if (apiKey) data.openrouter_api_key = apiKey
      if (selectedModel !== settings?.selected_model) data.selected_model = selectedModel

      const updated = await updateSettings(data)
      setSettings(updated)
      setApiKey('')
      setMessage({ type: 'success', text: 'Einstellungen gespeichert.' })
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Fehler beim Speichern' })
    } finally {
      setSaving(false)
    }
  }

  if (!settings) {
    return <div className="text-text-muted text-sm">Einstellungen werden geladen...</div>
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <h3 className="text-lg font-bold text-text">Einstellungen</h3>

      {/* OpenRouter API Key */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Cloud size={20} className="text-accent" />
          <h4 className="font-semibold text-text">OpenRouter (Cloud-Modelle)</h4>
        </div>

        <div className="flex items-center gap-2 mb-4">
          {settings.openrouter_api_key_set ? (
            <>
              <CheckCircle size={16} className="text-success" />
              <span className="text-sm text-success">API-Key konfiguriert</span>
            </>
          ) : (
            <>
              <AlertCircle size={16} className="text-warning" />
              <span className="text-sm text-warning">Kein API-Key hinterlegt</span>
            </>
          )}
        </div>

        {isAdmin && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text">
                <Key size={14} className="inline mr-1" />
                API-Key {settings.openrouter_api_key_set ? '(aendern)' : '(setzen)'}
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-or-..."
                className="w-full px-3 py-2.5 text-sm border border-border rounded-lg bg-bg-dark text-text placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text">Standard Cloud-Modell</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-border rounded-lg bg-bg-dark text-text focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
              >
                {settings.available_models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label} -- {m.price}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {!isAdmin && (
          <p className="text-xs text-text-muted">
            Nur Administratoren koennen die API-Einstellungen aendern.
          </p>
        )}
      </div>

      {/* Save */}
      {isAdmin && (
        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-dark text-secondary font-semibold rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Save size={16} />
            {saving ? 'Speichern...' : 'Speichern'}
          </button>

          {message && (
            <span className={`text-sm ${message.type === 'success' ? 'text-success' : 'text-error'}`}>
              {message.text}
            </span>
          )}
        </div>
      )}

      {/* User info */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <h4 className="font-semibold text-text mb-3">Ihr Konto</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <span className="text-text-muted">Name:</span>
          <span className="text-text">{user?.name || '--'}</span>
          <span className="text-text-muted">E-Mail:</span>
          <span className="text-text">{user?.email}</span>
          <span className="text-text-muted">Rolle:</span>
          <span className="text-text">{user?.role === 'admin' ? 'Administrator' : 'Benutzer'}</span>
        </div>
      </div>
    </div>
  )
}
