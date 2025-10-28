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

  // Get repository files (mock)
  getRepositoryFiles: async (repositoryId: string) => {
    // Mock some files based on repositoryId for demo purposes
    const now = Date.now();
    const files = [
      {
        fileId: `${repositoryId}-file-001`,
        fileName: `Hợp đồng mua bán #${repositoryId}`,
        size: 1536,
        uploadedAt: new Date(now - 1000 * 60 * 60).toISOString(),
        status: 'ACTIVE',
        contractType: 'PURCHASE',
        tags: ['legal', 'priority'],
        fileType: 'pdf',
        fileSize: 1536,
      },
      {
        fileId: `${repositoryId}-file-002`,
        fileName: `Báo cáo tài chính ${repositoryId}`,
        size: 24576,
        uploadedAt: new Date(now - 1000 * 60 * 30).toISOString(),
        status: 'PENDING_REVIEW',
        contractType: 'REPORT',
        tags: ['finance'],
        fileType: 'pdf',
        fileSize: 24576,
      },
      {
        fileId: `${repositoryId}-file-003`,
        fileName: `Ghi chú cuộc họp ${repositoryId}`,
        size: 768,
        uploadedAt: new Date(now - 1000 * 60 * 5).toISOString(),
        status: 'DRAFT',
        contractType: 'NOTE',
        tags: ['meeting'],
        fileType: 'txt',
        fileSize: 768,
      },
    ];

    return {
      statusCode: 200,
      shortMessage: 'Repository files retrieved successfully (mock)',
      data: {
        files,
        total: files.length,
      },
    };
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
