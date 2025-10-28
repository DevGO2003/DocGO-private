import type { Document } from '../../models/types/docs'
import type { FileItem } from '../../models/types/repository.types'

export function mapRepoFileItemToUiDocument(file: FileItem): Document {
  const name = file.name || file.originalName || `File ${file.id}`
  const extension = name && name.includes('.') ? name.split('.').pop() || undefined : undefined

  return {
    id: file.id,
    title: name,
    description: '',
    status: 'UPLOADED',
    contractType: 'Other',
    tags: file.tags || [],
    contractNumber: file.id,
    createdAt: file.createdAt,
    updatedAt: file.updatedAt,
    parties: [],
    totalValue: 0,
    currency: 'VND',
    effectiveDate: '',
    expiryDate: '',
    riskLevel: undefined,
    attachments: [],
    documentType: undefined,
    fileType: file.mimeType,
    extension,
    fileSize: file.fileSize,
    category: undefined,
    contractMetadata: {},
    file: {
      id: file.id,
      name,
      type: file.mimeType,
      size: file.fileSize,
      version: null,
    },
    storage: {},
  }
}
