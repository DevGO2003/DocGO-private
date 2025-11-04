import { apiClient } from '@shared/lib/api'
import env from '@shared/config/env';

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

const UPLOAD_ENDPOINT = '/api/v1/automation-service/files'
const RECENT_ENDPOINT = '/api/v1/automation-service/files/recent'

export const automationFileApi = {
  // Upload file with 100s timeout
  uploadFile: async (file: File, repositoryId: string): Promise<RestResponse<AutomationUploadData>> => {
    const form = new FormData()
    form.append('file', file, file.name)
    form.append('repository_id', repositoryId)

    if (env.isDev) {
      try {
        const dbg: Record<string, any> = {}
        for (const [k, v] of form.entries()) {
          dbg[k] = v instanceof File ? `File(${v.name}, ${v.size})` : String(v)
        }
        // eslint-disable-next-line no-console
        console.log('[Upload Debug] FormData entries:', dbg)
      } catch {}
    }
    
    const response = await apiClient.post<AutomationUploadData>(`${UPLOAD_ENDPOINT}`, form, {
      transformRequest: [(data) => data],
      timeout: 180000, // 180 seconds (3 minutes) - Allow time for AI classification + Kafka
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    })
    return response.data as unknown as RestResponse<AutomationUploadData>
  },

  getRecent: async (limit = 5): Promise<RestResponse<AutomationRecentItem[]>> => {
    try {
      const response = await apiClient.get<AutomationRecentItem[]>(`${RECENT_ENDPOINT}`, {
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
