import { apiClient } from '@/lib/http/api-client'

const BASE_URL = '/api/v1/repository-management-service/files'

export const repositoryApi = {
  async getFiles(params: {
    pageNumber: number
    pageSize: number
    searchTerm?: string
    sortBy?: string
    sortDirection?: string
  }) {
    const response = await apiClient.get(BASE_URL, { params })
    return response.data
  },

  async getFileById(id: string) {
    const response = await apiClient.get(`${BASE_URL}/${id}`)
    return response.data
  },

  async uploadFile(file: File, metadata?: any) {
    const formData = new FormData()
    formData.append('file', file)
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata))
    }
    const response = await apiClient.post(`${BASE_URL}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  async deleteFile(id: string) {
    const response = await apiClient.delete(`${BASE_URL}/${id}`)
    return response.data
  }
}
