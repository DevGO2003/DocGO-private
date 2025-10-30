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

export interface PaginationParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  status?: string;
  type?: string;
  tags?: string[];
  searchTerm?: string;
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

  // Get repository files with pagination support
  getRepositoryFiles: async (repositoryId: string, params: PaginationParams = {}) => {
  // ... existing params logic (mock ignores for now)
  const now = Date.now();
  const mockFiles = [
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
      contractNumber: 'HD-001',
      parties: [{ name: 'Công ty A', role: 'Buyer' }, { name: 'Công ty B', role: 'Seller' }],
      totalValue: 1000000,
      currency: 'VND',
      effectiveDate: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
      expiryDate: new Date(now + 1000 * 60 * 60 * 24 * 365).toISOString(),
      riskLevel: 'LOW',
      reminders: [{ title: 'Review in 30 days', due: new Date(now + 1000 * 60 * 60 * 24 * 30).toISOString() }],
      documentType: 'CONTRACT',
    },
    // Add similar for other files
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
      contractNumber: 'BC-002',
      parties: [],
      totalValue: null,
      currency: null,
      effectiveDate: null,
      expiryDate: null,
      riskLevel: 'MEDIUM',
      reminders: [],
      documentType: 'REPORT',
    },
    // Third file similar
  ];

  // Mock pagination
  const page = params.page ?? 0;
  const size = params.size ?? 10;
  const start = page * size;
  const end = start + size;
  const paginatedFiles = mockFiles.slice(start, end);

  return {
    data: {
      files: paginatedFiles,
      totalPages: Math.ceil(mockFiles.length / size),
      totalElements: mockFiles.length,
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
