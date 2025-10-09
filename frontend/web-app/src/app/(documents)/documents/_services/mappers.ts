import type { Document, Paginated } from '../_types'

export function mapApiDocumentToUi(doc: any): Document {
  const computeExpiryDate = (effectiveDate: string, term: string | undefined): string => {
    if (!effectiveDate || !term) return ''
    const match = String(term).match(/(\d{1,3})\s*(m|mo|mon|month|months)?/i)
    if (match) {
      const months = parseInt(match[1], 10)
      if (!isNaN(months)) {
        const d = new Date(effectiveDate)
        if (!isNaN(d.getTime())) {
          d.setMonth(d.getMonth() + months)
          return d.toISOString().slice(0, 10)
        }
      }
    }
    return ''
  }

  return {
    id: String(doc.id),
    title: doc.title || doc.contractNumber || `Contract ${doc.id}`,
    description: doc.object || doc.description || '',
    status: doc.status || 'DRAFT',
    contractType: doc.contractType || 'Other',
    tags: doc.tags || [],
    contractNumber: doc.contractNumber,
    createdAt: doc.createdAt || '',
    updatedAt: doc.updatedAt || '',
    parties: (doc.parties || []).map((p: any) => ({ name: p.name || '', role: p.role || '' })),
    totalValue: Number(doc.paymentDetails?.totalValue || 0),
    currency: doc.paymentDetails?.currency || 'VND',
    effectiveDate: doc.effectiveDate || '',
    expiryDate: doc.expiryDate || computeExpiryDate(doc.effectiveDate, doc.term),
    riskLevel: doc.riskAssessment?.riskLevel,
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


