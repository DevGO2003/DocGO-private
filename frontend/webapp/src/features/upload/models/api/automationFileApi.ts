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

    const res = await fetch(`${BASE}`, { method: 'POST', body: form })
    const json = await res.json().catch(() => null)
    if (!res.ok) {
      const err = new Error(json?.shortMessage || json?.description || `Upload failed: ${res.status}`) as any
      ;(err.status = res.status), (err.body = json)
      throw err
    }
    return json as RestResponse<AutomationUploadData>
  },

  getRecent: async (limit = 5): Promise<RestResponse<AutomationRecentItem[]>> => {
    const url = `${BASE}/recent?limit=${encodeURIComponent(String(limit))}`
    const res = await fetch(url, { method: 'GET', headers: { Accept: 'application/json' } })
    const json = await res.json().catch(() => null)
    if (!res.ok) {
      const err = new Error(json?.shortMessage || json?.description || `Fetch recent failed: ${res.status}`) as any
      err.status = res.status
      err.body = json
      throw err
    }
    return json as RestResponse<AutomationRecentItem[]>
  },
}
