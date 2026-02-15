import { clsx } from 'clsx'
import { FileText, ClipboardList, Scale, Mail } from 'lucide-react'
import type { FormatOption } from '../../lib/types'

const ICONS = {
  FileText,
  ClipboardList,
  Scale,
  Mail,
} as const

interface FormatCardProps {
  format: FormatOption
  selected: boolean
  onClick: () => void
}

export function FormatCard({ format, selected, onClick }: FormatCardProps) {
  const Icon = ICONS[format.icon as keyof typeof ICONS] || FileText

  return (
    <button
      onClick={onClick}
      className={clsx(
        'flex flex-col items-start gap-2 p-4 rounded-lg border text-left transition-all cursor-pointer',
        selected
          ? 'border-accent-500 bg-accent-500/10'
          : 'border-dark-border bg-dark-surface hover:border-dark-muted/30 hover:bg-dark-hover',
      )}
    >
      <div className="flex items-center gap-2">
        <Icon
          size={20}
          className={clsx(selected ? 'text-accent-500' : 'text-dark-muted')}
        />
        <span className={clsx('font-semibold text-sm', selected ? 'text-accent-300' : 'text-dark-text')}>
          {format.label}
        </span>
      </div>
      <p className="text-xs text-dark-muted leading-relaxed">{format.description}</p>
    </button>
  )
}
