import { API_BASE } from './constants'
import type {
  HealthResponse,
  ModelsResponse,
  HardwareResponse,
  GenerateRequest,
  GenerateResponse,
} from './types'

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, options)
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unbekannter Fehler' }))
    throw new Error(error.detail || `HTTP ${response.status}`)
  }
  return response.json()
}

export async function checkHealth(): Promise<HealthResponse> {
  return fetchJSON('/health')
}

export async function getModels(): Promise<ModelsResponse> {
  return fetchJSON('/models')
}

export async function getHardware(): Promise<HardwareResponse> {
  return fetchJSON('/hardware')
}

export async function startGeneration(req: GenerateRequest): Promise<GenerateResponse> {
  return fetchJSON('/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  })
}

export async function exportDocument(
  text: string,
  format: 'docx' | 'txt',
  documentType: string,
): Promise<Blob> {
  const response = await fetch(`${API_BASE}/export`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, format, document_type: documentType }),
  })
  if (!response.ok) {
    throw new Error('Export fehlgeschlagen')
  }
  return response.blob()
}
