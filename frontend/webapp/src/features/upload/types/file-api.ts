// File API Types

export interface FileData {
  fileId: string
  fileName: string
  fileSize: number
  fileType: string
  uploadedAt: string
  uploadedBy: string
}

export interface FileUploadRequest {
  file: File
  metadata?: {
    description?: string
    tags?: string[]
  }
}

export interface FileUploadResponse {
  statusCode: number
  shortMessage: string
  description?: string
  data: {
    fileId: string
    fileName: string
    size: number
    uploadedAt: string
  }
}

export interface FileListResponse {
  statusCode: number
  shortMessage: string
  data: {
    files: FileData[]
    total: number
    limit: number
    offset: number
  }
}

export interface FileDetailsResponse {
  statusCode: number
  shortMessage: string
  data: FileData & {
    metadata?: {
      description?: string
      tags?: string[]
    }
  }
}

export interface DeleteFileResponse {
  statusCode: number
  shortMessage: string
  data: {
    fileId: string
    deletedAt: string
  }
}
