import { useState, useEffect, useCallback } from 'react'
import { checkHealth } from '../lib/api'

export function useHealth(pollInterval = 10000) {
  const [ollamaConnected, setOllamaConnected] = useState<boolean | null>(null)
  const [openrouterConfigured, setOpenrouterConfigured] = useState(false)

  const check = useCallback(async () => {
    try {
      const data = await checkHealth()
      setOllamaConnected(data.ollama.connected)
      setOpenrouterConfigured(data.openrouter?.configured ?? false)
    } catch {
      setOllamaConnected(false)
    }
  }, [])

  useEffect(() => {
    check()
    const interval = setInterval(check, pollInterval)
    return () => clearInterval(interval)
  }, [check, pollInterval])

  return { ollamaConnected, openrouterConfigured, refresh: check }
}
