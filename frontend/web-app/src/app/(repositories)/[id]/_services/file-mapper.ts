import type { Document } from '../_types'
import type { FileApiData } from '../_types/file-api'

export function mapFileApiToUiDocument(data: FileApiData): Document {
  const ov = data.overview || ({} as FileApiData['overview'])
  const ct = data.contract || {}
  const payment = ct.payment || {}
  const parties = Array.isArray(ct.parties) ? ct.parties : []

  const documentType =
    (ov.documentType === 'CONTRACT' ? 'CONTRACT' : ov.documentType === 'GENERAL' ? 'GENERAL' : ov.documentType) ??
    undefined

  const effectiveDate = ct.effectiveDate || undefined
  const expiryDate = ct.expiryDate || undefined
  const totalValue =
    typeof ct.totalValue === 'number'
      ? ct.totalValue
      : typeof payment.totalValue === 'number'
      ? payment.totalValue
      : undefined
  const currency = ct.currency || payment.currency || undefined

  if (process.env.NODE_ENV === 'development') {
    console.log('mapFileApiToUiDocument debug', {
      id: data.id,
      apiDocumentType: ov.documentType,
      mappedType: documentType,
      effectiveDate,
      expiryDate,
      totalValue,
      currency,
    })
  }

  return {
    id: String(data.id),
    title: ov.title || `Document ${data.id}`,
    description: ct.summary || '',
    status: ov.status || 'DRAFT',
    contractType: ov.contractType || ov.category || 'Other',
    tags: ov.tags || [],
    contractNumber: data.id,
    createdAt: data.audit?.createdAt || '',
    updatedAt: data.audit?.updatedAt || '',
    parties: parties.map(p => ({ name: p.name || '', role: p.role || '' })),
    totalValue: totalValue ?? 0,
    currency: currency ?? 'VND',
    effectiveDate: effectiveDate || '',
    expiryDate: expiryDate || '',
    riskLevel: ct.risk?.level,
    attachments: [],
    documentType,
    fileType: data.file?.type || undefined,
    fileSize: data.file?.size || undefined,
    category: ov.category || undefined,
    extension: data.file?.name?.includes('.') ? data.file?.name.split('.').pop() : undefined,
    contractMetadata: { effectiveDate, expiryDate, totalValue, currency },
  }
}


