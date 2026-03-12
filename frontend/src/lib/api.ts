import { API_BASE } from './constants'
import type {
  HealthResponse,
  ModelsResponse,
  CloudModelsResponse,
  HardwareResponse,
  GenerateRequest,
  GenerateResponse,
  SettingsResponse,
  ManagedUser,
} from './types'

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    credentials: 'include',
    ...options,
    headers: {
      ...options?.headers,
    },
  })
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

export async function getCloudModels(): Promise<CloudModelsResponse> {
  return fetchJSON('/cloud-models')
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
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, format, document_type: documentType }),
  })
  if (!response.ok) {
    throw new Error('Export fehlgeschlagen')
  }
  return response.blob()
}

export async function getSettings(): Promise<SettingsResponse> {
  return fetchJSON('/settings')
}

export async function updateSettings(data: {
  openrouter_api_key?: string
  selected_model?: string
  log_level?: string
}): Promise<SettingsResponse> {
  return fetchJSON('/settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

// --- Admin: Benutzerverwaltung ---

export async function getUsers(): Promise<{ users: ManagedUser[] }> {
  return fetchJSON('/auth/users')
}

export async function activateUser(userId: string): Promise<{ success: boolean }> {
  return fetchJSON(`/auth/users/${userId}/activate`, { method: 'PUT' })
}

export async function deactivateUser(userId: string): Promise<{ success: boolean }> {
  return fetchJSON(`/auth/users/${userId}/deactivate`, { method: 'PUT' })
}

export async function changeUserRole(userId: string, role: string): Promise<{ success: boolean }> {
  return fetchJSON(`/auth/users/${userId}/role`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role }),
  })
}

export async function deleteUser(userId: string): Promise<{ success: boolean }> {
  return fetchJSON(`/auth/users/${userId}`, { method: 'DELETE' })
}
