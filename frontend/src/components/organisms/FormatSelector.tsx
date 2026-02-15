import { FormatCard } from '../molecules/FormatCard'
import { FORMAT_OPTIONS } from '../../lib/constants'
import type { FormatKey } from '../../lib/types'

interface FormatSelectorProps {
  selected: FormatKey | null
  onSelect: (format: FormatKey) => void
}

export function FormatSelector({ selected, onSelect }: FormatSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-neutral-700">Ausgabeformat</label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {FORMAT_OPTIONS.map((format) => (
          <FormatCard
            key={format.key}
            format={format}
            selected={selected === format.key}
            onClick={() => onSelect(format.key)}
          />
        ))}
      </div>
    </div>
  )
}
