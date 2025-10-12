import { API_ENDPOINTS } from '../_constants/index'
import type { Document, Paginated, RestResponse } from '../_types'
import { mapApiDocumentToUi, mapPaginated } from './mappers'

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
  const baseUrl = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8000'
  const url = new URL(API_ENDPOINTS.list, baseUrl)
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v))
  })
  const res = await fetch(url.toString(), { method: 'GET', headers: { 'Content-Type': 'application/json' }, cache: 'no-store' })
  const data = await unwrap<any>(res)
  return mapPaginated<Document>(data, mapApiDocumentToUi)
}

export async function fetchDocument(id: string): Promise<Document | null> {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8000'}${API_ENDPOINTS.detail(id)}`
    console.log('Fetching document with URL:', url)
    const res = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' }, cache: 'no-store' })
    
    console.log('Response status:', res.status)
    
    // Check if response is 404
    if (res.status === 404) {
      console.log('Document not found, returning null')
      return null
    }
    
    const data = await unwrap<any>(res)
    console.log('Unwrapped data:', data)
    if (!data) return null
    return mapApiDocumentToUi(data)
  } catch (error: any) {
    console.error('Error in fetchDocument:', error)
    // Check if error message contains 404
    if (error.message && error.message.includes('404')) {
      console.log('404 error detected, returning null')
      return null
    }
    // Re-throw other errors
    throw error
  }
}


