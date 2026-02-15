import { clsx } from 'clsx'

interface StatusIndicatorProps {
  connected: boolean | null
}

export function StatusIndicator({ connected }: StatusIndicatorProps) {
  const label =
    connected === null
      ? 'Pruefe...'
      : connected
        ? 'Ollama verbunden'
        : 'Ollama nicht erreichbar'

  return (
    <div className="flex items-center gap-2 text-sm">
      <div
        className={clsx('w-2 h-2 rounded-full', {
          'bg-success': connected === true,
          'bg-error': connected === false,
          'bg-warning animate-pulse': connected === null,
        })}
      />
      <span className="text-neutral-600">{label}</span>
    </div>
  )
}
