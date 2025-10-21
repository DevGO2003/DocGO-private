export type RestResponse<T> = {
  apiVersion: string
  statusCode: number
  shortMessage: string
  description: string
  data: T | null
  timestamp: string
  requestId: string
  path: string
}

export type FileApiData = {
  id: string
  overview: {
    title: string
    status: string
    documentType: 'CONTRACT' | 'GENERAL' | string | null
    contractType?: string | null
    category?: string | null
    tags?: string[]
    ownerUserId?: string | null
    isNew?: boolean
  }
  contract?: {
    effectiveDate?: string | null
    expiryDate?: string | null
    totalValue?: number | null
    currency?: string | null
    summary?: string | null
    parties?: Array<{
      name?: string
      role?: string
      representative?: string
      taxCode?: string
      contact?: string
      address?: string
    }>
    payment?: {
      totalValue?: number | null
      currency?: string | null
      schedule?: string | null
      method?: string | null
    }
    clauses?: {
      key?: Array<{ name?: string; description?: string; importance?: string; risk?: string }>
      unfavorable?: string[]
    }
    reminders?: Array<{ date?: string; title?: string; description?: string }>
    risk?: { level?: string; factors?: string[]; mitigations?: string[] }
    compliance?: { status?: string; issues?: string[]; recommendations?: string[] }
  }
  content?: {
    plaintext?: string | null
    ocr?: { text?: string | null; status?: string | null }
    classification?: unknown
    processing?: { status?: string | null; error?: string | null }
  }
  file?: {
    id?: string | null
    name?: string | null
    type?: string | null
    size?: number | null
    version?: string | null
  }
  storage?: unknown
  versioning?: unknown
  metadata?: unknown
  audit?: {
    createdAt?: string
    createdBy?: string | null
    updatedAt?: string
    updatedBy?: string | null
    deletedAt?: string | null
    deletedBy?: string | null
    isDeleted?: boolean
    version?: string | null
  }
}

export type FileApiResponse = RestResponse<FileApiData>


