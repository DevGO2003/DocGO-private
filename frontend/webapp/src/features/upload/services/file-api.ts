// File API Service - Stub for future implementation
// TODO: Implement actual file upload API calls

export interface FileUploadResponse {
  statusCode: number
  shortMessage: string
  data: {
    fileId: string
    fileName: string
    size: number
    uploadedAt: string
  }
}

export const fileAPI = {
  // Upload file
  uploadFile: async (file: File): Promise<FileUploadResponse> => {
    // TODO: Implement actual upload
    return {
      statusCode: 201,
      shortMessage: 'File uploaded successfully',
      data: {
        fileId: 'file-' + Date.now(),
        fileName: file.name,
        size: file.size,
        uploadedAt: new Date().toISOString()
      }
    }
  },

  // Get file list
  getFileList: async (limit = 10, offset = 0) => {
    // TODO: Implement actual fetch
    return {
      statusCode: 200,
      shortMessage: 'Files retrieved successfully',
      data: {
        files: [],
        total: 0,
        limit,
        offset
      }
    }
  },

  // Get file details
  getFileDetails: async (fileId: string) => {
    // TODO: Implement actual fetch
    return {
      statusCode: 200,
      shortMessage: 'File details retrieved successfully',
      data: {
        fileId,
        fileName: '',
        size: 0,
        uploadedAt: new Date().toISOString()
      }
    }
  },

  // Delete file
  deleteFile: async (fileId: string) => {
    // TODO: Implement actual delete
    return {
      statusCode: 200,
      shortMessage: 'File deleted successfully',
      data: { fileId }
    }
  }
}
