import { apiClient } from '@shared/lib/api/apiClient'

export interface FileComment {
  id: string
  user: string
  content: string
  createdAt: string
}

export async function getFileComments(fileId: string) {
  return apiClient.get(`/api/v1/repository-management-service/files/${fileId}/comments`)
}

export async function addFileComment(fileId: string, content: string) {
  return apiClient.post(`/api/v1/repository-management-service/files/${fileId}/comments`, { content })
}
