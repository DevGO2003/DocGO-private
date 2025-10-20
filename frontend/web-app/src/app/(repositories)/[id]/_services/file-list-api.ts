const BASE_URL = process.env.NEXT_PUBLIC_FILE_MGMT_BASE_URL || 'http://localhost:8002'

export async function fetchFiles(params: {
  page?: number
  size?: number
  sortBy?: string
  sortDirection?: 'ASC' | 'DESC'
  includeDeleted?: boolean
  view?: 'full' | 'card' | 'table'
  searchTerm?: string
  documentType?: string
}): Promise<any> {
  const q = new URLSearchParams({
    page: String(params.page ?? 0),
    size: String(params.size ?? 10),
    sortBy: params.sortBy ?? 'createdAt',
    sortDirection: params.sortDirection ?? 'DESC',
    includeDeleted: String(params.includeDeleted ?? false),
    view: params.view ?? 'full',
  })
  if (params.searchTerm) q.set('searchTerm', params.searchTerm)
  if (params.documentType) q.set('documentType', params.documentType)
  const url = `${BASE_URL}/api/v1/file-management-service/v1/files?${q.toString()}`
  const res = await fetch(url, { headers: { Accept: 'application/json' }, cache: 'no-store' })
  if (!res.ok) throw new Error(`Fetch files failed: ${res.status} ${res.statusText}`)
  return res.json()
}


