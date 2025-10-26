// File List API Service - Stub for future implementation
// TODO: Implement actual file list API calls

export interface FileListItem {
  fileId: string
  fileName: string
  size: number
  uploadedAt: string
  type: string
}

export const fileListAPI = {
  // Get files with pagination
  getFiles: async (limit = 10, offset = 0, filters?: any) => {
    // TODO: Implement actual fetch
    return {
      statusCode: 200,
      shortMessage: 'Files retrieved successfully',
      data: {
        files: [] as FileListItem[],
        total: 0,
        limit,
        offset
      }
    }
  },

  // Search files
  searchFiles: async (query: string) => {
    // TODO: Implement actual search
    return {
      statusCode: 200,
      shortMessage: 'Search completed',
      data: {
        files: [] as FileListItem[],
        query
      }
    }
  },

  // Get recent files
  getRecentFiles: async (limit = 5) => {
    // TODO: Implement actual fetch
    return {
      statusCode: 200,
      shortMessage: 'Recent files retrieved',
      data: {
        files: [] as FileListItem[],
        limit
      }
    }
  }
}
