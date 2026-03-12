import { useState } from 'react'
import { Settings, ChevronDown, ChevronUp, Monitor, Cloud } from 'lucide-react'
import { ModelSelector } from '../molecules/ModelSelector'
import type { OllamaModel, CloudModel } from '../../lib/types'

interface SettingsPanelProps {
  models: OllamaModel[]
  recommended: string
  selectedModel: string
  onModelChange: (model: string) => void
  temperature: number
  onTemperatureChange: (temp: number) => void
  mode: 'local' | 'cloud'
  onModeChange: (mode: 'local' | 'cloud') => void
  cloudModels: CloudModel[]
  selectedCloudModel: string
  onCloudModelChange: (model: string) => void
  cloudApiKeySet: boolean
}

export function SettingsPanel({
  models,
  recommended,
  selectedModel,
  onModelChange,
  temperature,
  onTemperatureChange,
  mode,
  onModeChange,
  cloudModels,
  selectedCloudModel,
  onCloudModelChange,
  cloudApiKeySet,
}: SettingsPanelProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border border-dark-border rounded-lg bg-dark-surface">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-dark-text hover:bg-dark-hover rounded-lg cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Settings size={16} />
          Einstellungen
        </div>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {open && (
        <div className="px-4 pb-4 flex flex-col gap-4 border-t border-dark-border pt-4">
          {/* Mode toggle */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-dark-text">Modus</label>
            <div className="flex rounded-lg border border-dark-border overflow-hidden">
              <button
                onClick={() => onModeChange('local')}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
                  mode === 'local'
                    ? 'bg-primary text-white'
                    : 'bg-dark-surface text-dark-muted hover:text-dark-text'
                }`}
              >
                <Monitor size={16} />
                Lokal (Ollama)
              </button>
              <button
                onClick={() => onModeChange('cloud')}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
                  mode === 'cloud'
                    ? 'bg-primary text-white'
                    : 'bg-dark-surface text-dark-muted hover:text-dark-text'
                }`}
              >
                <Cloud size={16} />
                Cloud (OpenRouter)
              </button>
            </div>
          </div>

          {/* Model selector based on mode */}
          {mode === 'local' ? (
            <ModelSelector
              models={models}
              recommended={recommended}
              selectedModel={selectedModel}
              onSelect={onModelChange}
            />
          ) : (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-dark-text">Cloud-Modell</label>
              {!cloudApiKeySet && (
                <div className="p-2 text-xs text-warning bg-warning/10 border border-warning/20 rounded-lg mb-1">
                  Kein API-Key konfiguriert. Bitte in den Einstellungen hinterlegen.
                </div>
              )}
              <select
                value={selectedCloudModel}
                onChange={(e) => onCloudModelChange(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-dark-border rounded-lg bg-dark-surface text-dark-text focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
              >
                {cloudModels.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label} -- {m.price}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Temperature */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-dark-text">
              Temperatur: {temperature.toFixed(2)}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={temperature}
              onChange={(e) => onTemperatureChange(parseFloat(e.target.value))}
              className="w-full accent-accent-500"
            />
            <div className="flex justify-between text-xs text-dark-muted">
              <span>Praezise (0)</span>
              <span>Kreativ (1)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
