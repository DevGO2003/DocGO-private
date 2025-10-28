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
  // documentType trước đây dùng để phân biệt CONTRACT/GENERAL.
  // Sau chuẩn hoá, UI nên dựa vào category (nghiệp vụ). Trường này giữ lại để tương thích ngược.
  documentType?: string | null
  // MIME type, ví dụ: application/pdf
  fileType?: string
  // Phần mở rộng, ví dụ: pdf, docx (fallback: suy từ fileName)
  extension?: string
  fileSize?: number
  // Loại nghiệp vụ, ví dụ: HOP_DONG_DICH_VU, TAI_LIEU_HUONG_DAN
  category?: string
  // Metadata hợp đồng (chỉ có khi category là hợp đồng). Tương thích ngược với các field riêng lẻ ở trên
  contractMetadata?: {
    effectiveDate?: string
    expiryDate?: string
    totalValue?: number
    currency?: string
  }
  // File info & storage for preview via URL
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


