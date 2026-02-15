import Markdown from 'react-markdown'
import { Spinner } from '../atoms/Spinner'
import { OutputToolbar } from '../molecules/OutputToolbar'

interface OutputDisplayProps {
  output: string
  isStreaming: boolean
  error: string | null
  tokenCount: number
  documentType: string
}

export function OutputDisplay({ output, isStreaming, error, tokenCount, documentType }: OutputDisplayProps) {
  if (error) {
    return (
      <div className="p-4 bg-red-900/20 border border-red-900/40 rounded-lg">
        <p className="text-sm text-red-400 font-medium">Fehler bei der Generierung</p>
        <p className="text-sm text-red-400/80 mt-1">{error}</p>
      </div>
    )
  }

  if (!output && !isStreaming) {
    return null
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-dark-text">Ergebnis</label>
          {isStreaming && (
            <div className="flex items-center gap-1.5">
              <Spinner size="sm" />
              <span className="text-xs text-dark-muted">Generierung laeuft... ({tokenCount} Tokens)</span>
            </div>
          )}
        </div>
        {output && !isStreaming && (
          <OutputToolbar output={output} documentType={documentType} />
        )}
      </div>
      <div className="bg-dark-surface border border-dark-border rounded-lg p-6 max-h-[600px] overflow-y-auto">
        <article className="prose prose-sm prose-invert max-w-none prose-headings:text-dark-text prose-p:text-dark-muted prose-strong:text-dark-text prose-li:text-dark-muted prose-code:text-accent-300">
          <Markdown>{output}</Markdown>
          {isStreaming && <span className="inline-block w-1.5 h-4 bg-accent-500 animate-pulse ml-0.5" />}
        </article>
      </div>
    </div>
  )
}
