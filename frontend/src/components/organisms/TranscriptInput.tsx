import { useRef } from 'react'
import { Upload, X } from 'lucide-react'
import { Button } from '../atoms/Button'

interface TranscriptInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function TranscriptInput({ value, onChange, disabled }: TranscriptInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result
      if (typeof text === 'string') onChange(text)
    }
    reader.readAsText(file, 'utf-8')
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result
      if (typeof text === 'string') onChange(text)
    }
    reader.readAsText(file, 'utf-8')
  }

  const charCount = value.length
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-dark-text">Transkript</label>
        <div className="flex items-center gap-2">
          {value && (
            <Button variant="ghost" size="sm" onClick={() => onChange('')} disabled={disabled}>
              <X size={14} className="mr-1" />
              Leeren
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()} disabled={disabled}>
            <Upload size={14} className="mr-1" />
            Datei laden
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md,.text"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Transkript hier einfuegen oder Textdatei per Drag-and-Drop ablegen..."
          rows={12}
          disabled={disabled}
          className="w-full px-4 py-3 text-sm border border-dark-border rounded-lg bg-dark-surface text-dark-text resize-y focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 disabled:bg-dark-bg disabled:cursor-not-allowed placeholder:text-dark-muted/50"
        />
      </div>
      <div className="flex items-center gap-4 text-xs text-dark-muted/60">
        <span>{charCount.toLocaleString('de-DE')} Zeichen</span>
        <span>{wordCount.toLocaleString('de-DE')} Woerter</span>
      </div>
    </div>
  )
}
