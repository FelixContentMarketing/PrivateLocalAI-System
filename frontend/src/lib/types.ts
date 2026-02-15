export interface HealthResponse {
  status: string
  ollama: {
    connected: boolean
    url: string
    error?: string
  }
}

export interface OllamaModel {
  name: string
  size_bytes: number
  size_gb: number
  modified_at: string
  details: Record<string, unknown>
}

export interface ModelsResponse {
  models: OllamaModel[]
  recommended: string
  recommendation_reason: string
}

export interface HardwareResponse {
  ram_total_gb: number
  ram_available_gb: number
  cpu_cores: number
  cpu_name: string
  gpu: {
    available: boolean
    name: string | null
    vram_gb: number | null
    type: string
  }
  os: string
  arch: string
  recommended_model: string
  recommended_tier: number
  reason: string
  quality_de: string
  all_tiers: Array<{
    tier: number
    model: string
    min_ram_gb: number
    disk_size_gb: number
    parameters: string
    quality_de: string
    speed: string
    description_de: string
  }>
}

export interface GenerateRequest {
  transcript: string
  format: FormatKey
  model?: string
  temperature?: number
  max_tokens?: number
}

export interface GenerateResponse {
  task_id: string
  status: string
  model: string
  format: string
}

export type FormatKey =
  | 'zusammenfassung'
  | 'besprechungsprotokoll'
  | 'schriftsatz_entwurf'
  | 'mandantenanschreiben'

export interface FormatOption {
  key: FormatKey
  label: string
  description: string
  icon: string
}
