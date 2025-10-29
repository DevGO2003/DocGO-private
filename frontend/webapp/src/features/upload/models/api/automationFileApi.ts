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
const PRESIGN_ENDPOINT = '/api/v1/automation-service/files/presign'
const COMPLETE_ENDPOINT = '/api/v1/automation-service/files/complete'
const RECENT_ENDPOINT = '/api/v1/automation-service/files/recent'

type PresignData = {
  method: 'PUT' | 'POST'
  uploadUrl: string
  fileKey: string
  fileId: string
  repositoryId?: string
}

export const automationFileApi = {
  uploadFile: async (file: File, repositoryId: string): Promise<RestResponse<AutomationUploadData>> => {
    // 1) Try presign flow for fastest response
    try {
      // a) Presign
      const pre = await apiClient.post<PresignData>(PRESIGN_ENDPOINT, {
        filename: file.name,
        contentType: file.type || 'application/octet-stream',
        size: file.size,
        repository_id: repositoryId,
      }, { timeout: 60000 })
      const presign = (pre.data as unknown as RestResponse<PresignData>).data as PresignData
      if (!presign || !presign.uploadUrl || !presign.fileId) throw new Error('Invalid presign response')

      // b) Upload direct to S3 using fetch with 5m timeout
      const controller = new AbortController()
      const to = setTimeout(() => controller.abort(), 300000)
      const putResp = await fetch(presign.uploadUrl, {
        method: presign.method,
        body: file,
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
        signal: controller.signal,
      })
      clearTimeout(to)
      if (!putResp.ok) {
        throw new Error(`S3 upload failed: ${putResp.status}`)
      }

      // c) Complete (202 expected)
      const complete = await apiClient.post(`${COMPLETE_ENDPOINT}`, {
        fileKey: presign.fileKey,
        fileId: presign.fileId,
        repository_id: repositoryId,
        contentType: file.type || 'application/octet-stream',
        size: file.size,
      }, { timeout: 60000 })
      const comp = complete.data as unknown as RestResponse<any>
      // Normalize response to AutomationUploadData shape
      const data: AutomationUploadData = {
        fileId: presign.fileId,
        fileUrl: '',
        correlationId: comp.requestId || ''
      }
      return {
        apiVersion: 'v1',
        statusCode: comp.statusCode || 202,
        shortMessage: 'Accepted',
        description: 'Upload completed. Processing started.',
        data,
        timestamp: new Date().toISOString(),
        requestId: comp.requestId,
        path: COMPLETE_ENDPOINT,
      }
    } catch (e) {
      // Fallback to multipart upload
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
          console.log('[Upload Debug:FALLBACK] FormData entries:', dbg)
        } catch {}
      }
      const response = await apiClient.post<AutomationUploadData>(`${UPLOAD_ENDPOINT}`, form, {
        transformRequest: [(data) => data],
        timeout: 300000,
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      })
      return response.data as unknown as RestResponse<AutomationUploadData>
    }
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
