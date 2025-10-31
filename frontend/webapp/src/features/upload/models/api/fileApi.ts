import type { FileApiResponse } from '../types'
import { apiClient } from '@shared/lib/api/apiClient'

export async function fetchFileById(id: string): Promise<FileApiResponse> {
  const url = `/api/v1/repository-management-service/files/${encodeURIComponent(id)}`
  const res = await apiClient.get<FileApiResponse>(url)
  return res.data as unknown as FileApiResponse
}

export async function uploadFile(file: File): Promise<FileApiResponse> {
  const formData = new FormData()
  formData.append('file', file)
  const url = `/api/v1/repository-management-service/files/upload`
  const res = await apiClient.post<FileApiResponse>(url, formData)
  return res.data as unknown as FileApiResponse
}

export async function deleteFile(id: string): Promise<void> {
  const url = `/api/v1/repository-management-service/files/${encodeURIComponent(id)}`
  await apiClient.delete<void>(url)
}
