 import { apiClient } from '@shared/lib/api'
 export type RestResponse<T> = {
  apiVersion: string
  statusCode: number
  shortMessage: string
  description?: string
  data: T | null
  timestamp: string
  requestId: string
  path: string
}

export type AutomationUploadData = {
  fileId: string
  fileUrl: string
  correlationId: string
}

export type AutomationRecentItem = {
  fileId: string
  fileName: string
  fileSize: number
  contentType: string
  fileUrl: string
  repositoryId?: string | null
  uploadedAt: string
}

const BASE = '/api/v1/automation-service/files'

export const automationFileApi = {
  uploadFile: async (file: File, repositoryId: string): Promise<RestResponse<AutomationUploadData>> => {
    const form = new FormData()
    form.append('file', file)
    form.append('repository_id', repositoryId)

    try {
      const response = await apiClient.post<AutomationUploadData>(`${BASE}`, form, {
        // Do NOT set Content-Type for FormData; interceptor will remove it
      })
      return response.data as unknown as RestResponse<AutomationUploadData>
    } catch (e: any) {
      const status = e?.response?.status ?? e?.response?.data?.statusCode
      const body = e?.response?.data
      const err = new Error(body?.shortMessage || body?.description || e?.message || 'Upload failed') as any
      err.status = status
      err.body = body
      throw err
    }
  },

  getRecent: async (limit = 5): Promise<RestResponse<AutomationRecentItem[]>> => {
    try {
      const response = await apiClient.get<AutomationRecentItem[]>(`${BASE}/recent`, {
        params: { limit }
      })
      return response.data as unknown as RestResponse<AutomationRecentItem[]>
    } catch (e: any) {
      const status = e?.response?.status ?? e?.response?.data?.statusCode
      const body = e?.response?.data
      const err = new Error(body?.shortMessage || body?.description || e?.message || 'Fetch recent failed') as any
      err.status = status
      err.body = body
      throw err
    }
  },
}
