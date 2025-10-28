import type { FileApiResponse } from '../types'

const BASE_URL = '/api' // API Gateway endpoint

export async function fetchFileById(id: string, init?: RequestInit): Promise<FileApiResponse> {
  const url = `${BASE_URL}/v1/repository-management-service/files/${encodeURIComponent(id)}`
  const res = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    ...init,
  })
  if (!res.ok) {
    throw new Error(`Fetch file failed: ${res.status} ${res.statusText}`)
  }
  return res.json()
}

export async function uploadFile(file: File, init?: RequestInit): Promise<FileApiResponse> {
  const formData = new FormData()
  formData.append('file', file)

  const url = `${BASE_URL}/v1/repository-management-service/files/upload`
  const res = await fetch(url, {
    method: 'POST',
    body: formData,
    ...init,
  })
  if (!res.ok) {
    throw new Error(`Upload file failed: ${res.status} ${res.statusText}`)
  }
  return res.json()
}

export async function deleteFile(id: string, init?: RequestInit): Promise<void> {
  const url = `${BASE_URL}/v1/repository-management-service/files/${encodeURIComponent(id)}`
  const res = await fetch(url, {
    method: 'DELETE',
    headers: { Accept: 'application/json' },
    ...init,
  })
  if (!res.ok) {
    throw new Error(`Delete file failed: ${res.status} ${res.statusText}`)
  }
}
