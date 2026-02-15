import { useState, useCallback, useRef } from 'react'
import { API_BASE } from '../lib/constants'

interface StreamState {
  isStreaming: boolean
  output: string
  error: string | null
  tokenCount: number
}

export function useOllamaStream() {
  const [state, setState] = useState<StreamState>({
    isStreaming: false,
    output: '',
    error: null,
    tokenCount: 0,
  })
  const abortRef = useRef<AbortController | null>(null)

  const startStream = useCallback((taskId: string) => {
    // Abort any existing stream
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setState({ isStreaming: true, output: '', error: null, tokenCount: 0 })

    const eventSource = new EventSource(`${API_BASE}/generate/stream/${taskId}`)

    eventSource.addEventListener('token', (event) => {
      const data = JSON.parse(event.data)
      setState((prev) => ({
        ...prev,
        output: prev.output + data.token,
        tokenCount: prev.tokenCount + 1,
      }))
    })

    eventSource.addEventListener('complete', (event) => {
      const data = JSON.parse(event.data)
      setState((prev) => ({
        ...prev,
        isStreaming: false,
        output: data.full_text || prev.output,
      }))
      eventSource.close()
    })

    eventSource.addEventListener('error', (event) => {
      // Check if it's an SSE event with error data
      if (event instanceof MessageEvent && event.data) {
        const data = JSON.parse(event.data)
        setState((prev) => ({
          ...prev,
          isStreaming: false,
          error: data.error || 'Unbekannter Fehler bei der Generierung',
        }))
      } else {
        setState((prev) => ({
          ...prev,
          isStreaming: false,
          error: 'Verbindung zum Server verloren',
        }))
      }
      eventSource.close()
    })

    // Cleanup on abort
    controller.signal.addEventListener('abort', () => {
      eventSource.close()
      setState((prev) => ({ ...prev, isStreaming: false }))
    })
  }, [])

  const stopStream = useCallback(() => {
    abortRef.current?.abort()
    setState((prev) => ({ ...prev, isStreaming: false }))
  }, [])

  const clearOutput = useCallback(() => {
    setState({ isStreaming: false, output: '', error: null, tokenCount: 0 })
  }, [])

  return {
    ...state,
    startStream,
    stopStream,
    clearOutput,
  }
}
