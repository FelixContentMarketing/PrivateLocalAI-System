import { useState } from 'react'
import { Settings, ChevronDown, ChevronUp } from 'lucide-react'
import { ModelSelector } from '../molecules/ModelSelector'
import type { OllamaModel } from '../../lib/types'

interface SettingsPanelProps {
  models: OllamaModel[]
  recommended: string
  selectedModel: string
  onModelChange: (model: string) => void
  temperature: number
  onTemperatureChange: (temp: number) => void
}

export function SettingsPanel({
  models,
  recommended,
  selectedModel,
  onModelChange,
  temperature,
  onTemperatureChange,
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
          <ModelSelector
            models={models}
            recommended={recommended}
            selectedModel={selectedModel}
            onSelect={onModelChange}
          />
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
