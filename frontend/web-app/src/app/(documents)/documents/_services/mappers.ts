import type { Document, Paginated } from '../_types'

export function mapApiDocumentToUi(doc: any): Document {
  // Parse parties from JSON string if available
  let parties = []
  if (doc.partiesJson) {
    try {
      const parsedParties = JSON.parse(doc.partiesJson)
      parties = Array.isArray(parsedParties) ? parsedParties : []
    } catch (e) {
      console.warn('Failed to parse partiesJson:', e)
    }
  }

  return {
    id: String(doc.id),
    title: doc.title || doc.contractNumber || `Document ${doc.id}`,
    description: doc.description || doc.contractObject || doc.summary || '',
    status: doc.status || 'DRAFT',
    contractType: doc.contractType || doc.category || 'Other',
    tags: doc.tags || [],
    contractNumber: doc.contractNumber || doc.id,
    createdAt: doc.createdAt || '',
    updatedAt: doc.updatedAt || '',
    parties: doc.parties || parties.map((p: any) => ({ name: p.name || '', role: p.role || '' })),
    totalValue: Number(doc.totalValue || 0),
    currency: doc.currency || 'VND',
    effectiveDate: doc.effectiveDate || '',
    expiryDate: doc.endDate || '',
    riskLevel: doc.riskLevel,
    attachments: [],
    documentType: doc.documentType || doc.document_type || 'CONTRACT',
    fileType: doc.fileType || doc.file_type,
    fileSize: doc.fileSize || doc.file_size,
    category: doc.category,
  }
}

export function mapPaginated<T>(payload: any, mapItem: (x: any) => T): Paginated<T> {
  // Xử lý cả 2 format: RestResponse và Page
  const data = payload?.data ?? payload
  
  // Format 1: RestResponse with nested structure (contracts)
  if (data?.content && data?.result) {
    return {
      content: data.content.map(mapItem),
      totalElements: Number(data.result.totalElements ?? 0),
      totalPages: Number(data.result.totalPages ?? 1),
    }
  }
  
  // Format 2: Direct Page response (documents)
  if (Array.isArray(data?.content)) {
    return {
      content: data.content.map(mapItem),
      totalElements: Number(data.totalElements ?? 0),
      totalPages: Number(data.totalPages ?? 1),
    }
  }
  
  // Fallback
  return {
    content: [],
    totalElements: 0,
    totalPages: 0,
  }
}


