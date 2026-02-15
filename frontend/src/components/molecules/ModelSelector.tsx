import type { OllamaModel } from '../../lib/types'
import { Badge } from '../atoms/Badge'

interface ModelSelectorProps {
  models: OllamaModel[]
  recommended: string
  selectedModel: string
  onSelect: (model: string) => void
}

export function ModelSelector({ models, recommended, selectedModel, onSelect }: ModelSelectorProps) {
  if (models.length === 0) {
    return (
      <div className="text-sm text-dark-muted p-3 bg-dark-surface border border-dark-border rounded-lg">
        Keine Modelle verfuegbar. Bitte installieren Sie ein Modell:
        <code className="block mt-1 text-xs bg-dark-bg text-accent-300 p-2 rounded">ollama pull llama3.1:8b</code>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-dark-text">Modell</label>
      <select
        value={selectedModel}
        onChange={(e) => onSelect(e.target.value)}
        className="w-full px-3 py-2 text-sm border border-dark-border rounded-lg bg-dark-surface text-dark-text focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
      >
        {models.map((m) => (
          <option key={m.name} value={m.name}>
            {m.name} ({m.size_gb} GB)
          </option>
        ))}
      </select>
      {recommended && selectedModel !== recommended && (
        <div className="flex items-center gap-1 mt-1">
          <Badge variant="success">Empfohlen: {recommended}</Badge>
        </div>
      )}
    </div>
  )
}
