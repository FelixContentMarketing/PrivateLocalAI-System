import { useState, useEffect } from 'react'
import { getModels } from '../lib/api'
import type { OllamaModel } from '../lib/types'

export function useModels() {
  const [models, setModels] = useState<OllamaModel[]>([])
  const [recommended, setRecommended] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const data = await getModels()
        if (!cancelled) {
          setModels(data.models)
          setRecommended(data.recommended)
        }
      } catch {
        // Models unavailable
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  return { models, recommended, loading }
}
