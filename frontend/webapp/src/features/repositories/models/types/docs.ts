// Ported types from frontend/src app/(repositories)/repositories/_types

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
  documentType?: string | null
  fileType?: string
  extension?: string
  fileSize?: number
  category?: string
  contractMetadata?: {
    effectiveDate?: string
    expiryDate?: string
    totalValue?: number
    currency?: string
  }
  file?: {
    id?: string | null
    name?: string | null
    type?: string | null
    size?: number | null
    version?: string | null
  }
  storage?: {
    s3?: {
      url: string
      bucket?: string | null
      objectKey?: string | null
      region?: string | null
      contentType?: string | null
      size?: number | null
      versionId?: string | null
      checksum?: string | null
      type: string
    }
    local?: unknown
  }
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
