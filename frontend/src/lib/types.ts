export interface HealthResponse {
  status: string
  ollama: {
    connected: boolean
    url: string
    error?: string
  }
  openrouter: {
    configured: boolean
  }
}

export interface OllamaModel {
  name: string
  size_bytes: number
  size_gb: number
  modified_at: string
  details: Record<string, unknown>
}

export interface CloudModel {
  id: string
  label: string
  price: string
}

export interface CloudModelsResponse {
  models: CloudModel[]
  selected: string
  api_key_set: boolean
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
  mode?: 'local' | 'cloud'
  cloud_model?: string
  temperature?: number
  max_tokens?: number
}

export interface GenerateResponse {
  task_id: string
  status: string
  mode: string
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

export interface AuthUser {
  user_id: string
  email: string
  role: 'admin' | 'user'
  name: string | null
}

export interface SettingsResponse {
  openrouter_api_key_set: boolean
  selected_model: string
  available_models: CloudModel[]
  log_level: string
}

export interface ManagedUser {
  id: string
  email: string
  name: string | null
  role: string
  is_active: number | boolean
  last_login_at: string | null
  created_at: string
}
