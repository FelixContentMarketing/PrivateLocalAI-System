import { useState } from 'react'
import { Shield, X } from 'lucide-react'

export function DsgvoNotice() {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div className="bg-accent-500/10 border border-accent-500/20 rounded-lg p-4 flex items-start gap-3">
      <Shield size={20} className="text-accent-500 mt-0.5 shrink-0" />
      <div className="flex-1">
        <p className="text-sm text-dark-text font-medium">Datenschutzhinweis</p>
        <p className="text-xs text-dark-muted mt-1">
          Im lokalen Modus (Ollama) werden alle Daten ausschliesslich auf diesem Computer verarbeitet.
          Im Cloud-Modus werden Transkriptdaten an OpenRouter uebermittelt -- es gelten deren Datenschutzrichtlinien.
          Es erfolgt keine dauerhafte Speicherung von Transkripten.
          Beim Schliessen des Browsers werden alle eingegebenen Daten geloescht.
        </p>
      </div>
      <button onClick={() => setDismissed(true)} className="text-dark-muted hover:text-dark-text cursor-pointer">
        <X size={16} />
      </button>
    </div>
  )
}
