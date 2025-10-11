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
    title: doc.title || doc.contractNumber || `Contract ${doc.id}`,
    description: doc.contractObject || doc.summary || '',
    status: doc.status || 'DRAFT',
    contractType: doc.contractType || 'Other',
    tags: doc.tags || [],
    contractNumber: doc.contractNumber,
    createdAt: doc.createdAt || '',
    updatedAt: doc.updatedAt || '',
    parties: parties.map((p: any) => ({ name: p.name || '', role: p.role || '' })),
    totalValue: Number(doc.totalValue || 0),
    currency: doc.currency || 'VND',
    effectiveDate: doc.effectiveDate || '',
    expiryDate: doc.endDate || '',
    riskLevel: doc.riskLevel,
    attachments: [],
  }
}

export function mapPaginated<T>(payload: any, mapItem: (x: any) => T): Paginated<T> {
  const container = payload?.result ?? payload ?? {}
  const content = Array.isArray(container.content) ? container.content : []
  return {
    content: content.map(mapItem),
    totalElements: Number(container.totalElements ?? 0),
    totalPages: Number(container.totalPages ?? 1),
  }
}


