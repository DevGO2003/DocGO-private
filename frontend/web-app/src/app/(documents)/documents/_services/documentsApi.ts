import { API_ENDPOINTS } from '../_constants'
import type { Document, Paginated, RestResponse } from '../_types'
import { mapApiDocumentToUi, mapPaginated } from './mappers'
import { mockDocument, mockDocumentsPage } from './mocks'

async function unwrap<T>(res: Response): Promise<T> {
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    const msg = (body as any)?.description || res.statusText || 'Request failed'
    throw new Error(msg)
  }
  const statusCode = (body as RestResponse<any>)?.statusCode
  if (statusCode === 204) return null as T
  return (body as RestResponse<T>)?.data as T
}

export async function fetchDocuments(params: Record<string, any>): Promise<Paginated<Document>> {
  try {
    const url = new URL(API_ENDPOINTS.list, typeof window === 'undefined' ? 'http://localhost' : window.location.origin)
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v))
    })
    const res = await fetch(url.toString(), { method: 'GET', headers: { 'Content-Type': 'application/json' }, cache: 'no-store' })
    const data = await unwrap<any>(res)
    return mapPaginated<Document>(data, mapApiDocumentToUi)
  } catch (e) {
    const pageNumber = Number(params?.pageNumber ?? 0)
    const pageSize = Number(params?.pageSize ?? 9)
    return mockDocumentsPage(pageNumber, pageSize)
  }
}

export async function fetchDocument(id: string): Promise<Document | null> {
  try {
    const url = API_ENDPOINTS.detail(id)
    const res = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' }, cache: 'no-store' })
    const data = await unwrap<any>(res)
    if (!data) return null
    return mapApiDocumentToUi(data)
  } catch (e) {
    return mockDocument(id)
  }
}


