import type { FileApiResponse } from '../_types/file-api'

const BASE_URL = process.env.NEXT_PUBLIC_FILE_MGMT_BASE_URL || 'http://localhost:8002'

export async function fetchFileById(id: string, init?: RequestInit): Promise<FileApiResponse> {
  const url = `${BASE_URL}/api/v1/file-management-service/v1/files/${encodeURIComponent(id)}`
  const res = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    cache: 'no-store',
    ...init,
  })
  if (!res.ok) {
    throw new Error(`Fetch file failed: ${res.status} ${res.statusText}`)
  }
  return res.json()
}


