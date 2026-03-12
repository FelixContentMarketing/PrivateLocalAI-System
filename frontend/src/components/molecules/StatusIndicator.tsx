import { clsx } from 'clsx'

interface StatusIndicatorProps {
  connected: boolean | null
  label?: string
}

export function StatusIndicator({ connected, label: customLabel }: StatusIndicatorProps) {
  const prefix = customLabel || 'Ollama'
  const label =
    connected === null
      ? 'Pruefe...'
      : connected
        ? `${prefix} verbunden`
        : `${prefix} nicht erreichbar`

  return (
    <div className="flex items-center gap-2 text-sm">
      <div
        className={clsx('w-2 h-2 rounded-full', {
          'bg-success': connected === true,
          'bg-error': connected === false,
          'bg-warning animate-pulse': connected === null,
        })}
      />
      <span className="text-text-muted">{label}</span>
    </div>
  )
}
