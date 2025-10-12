export type Attachment = {
  id: string
  filename: string
  url?: string
  contentType?: string
  size?: number
}

export type Party = {
  name: string
  role: string
}

export type Document = {
  id: string
  title: string
  description?: string
  status: string
  contractType: string
  tags?: string[]
  contractNumber?: string
  createdAt: string
  updatedAt: string
  parties: Party[]
  totalValue: number
  currency: string
  effectiveDate: string
  expiryDate: string
  riskLevel?: string
  attachments?: Attachment[]
  documentType?: 'CONTRACT' | 'GENERAL_FILE'
  fileType?: string
  fileSize?: number
  category?: string
}

export type Paginated<T> = {
  content: T[]
  totalElements: number
  totalPages: number
}

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


