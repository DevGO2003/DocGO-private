// Automation Service API
// Base path: /api/v1/automation-service

import { apiClient } from '../client'
import { ApiResponse } from '@/types/api'

export interface ExtractResult {
  extractedText: string
  confidence: number
  processingTime: number
  language?: string
  metadata?: any
}

export interface SummarizeResult {
  summary: string
  keyPoints: string[]
  confidence: number
  processingTime: number
  language?: string
  metadata?: any
}

export interface ProcessResult {
  result: string
  confidence: number
  processingTime: number
  metadata?: any
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  suggestions: string[]
  confidence: number
}

export interface BatchProcessResult {
  batchId: string
  status: string
  totalItems: number
  processedItems: number
  failedItems: number
  results: any[]
  createdAt: string
  completedAt?: string
}

export interface VersionConflictCheck {
  hasConflict: boolean
  existingFile?: {
    id: string
    filename: string
    size: number
    lastModified: string
    version: string
  }
  currentFile: {
    filename: string
    size: number
    lastModified?: string
  }
  conflictType: 'size' | 'timestamp' | 'both' | 'none'
  message: string
}

// File Management Interfaces
export interface FileUploadResult {
  id: string
  filename: string
  originalName: string
  size: number
  mimeType: string
  url: string
  uploadPath: string
  createdAt: string
  metadata?: any
}

export interface FileInfo {
  id: string
  filename: string
  originalName: string
  size: number
  mimeType: string
  url: string
  uploadPath: string
  createdAt: string
  updatedAt: string
  metadata?: any
}

export interface FileSearchParams {
  page?: number
  size?: number
  sortBy?: string
  sortDirection?: string
  searchTerm?: string
  mimeType?: string
  startDate?: string
  endDate?: string
}

export class AutomationAPI {
  private basePath = '/api/v1/automation-service'

  // Document Processing
  async extractText(file: File, apiKey?: string, view?: string) {
    const formData = new FormData()
    formData.append('file', file)
    
    const params = view ? { view } : {}
    return apiClient.post<ApiResponse<ExtractResult>>(`${this.basePath}/document/extract`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(apiKey && { 'GEMINI_API_KEY': apiKey }),
      },
      params
    })
  }

  async summarizeText(text: string, apiKey?: string) {
    return apiClient.post<ApiResponse<SummarizeResult>>(`${this.basePath}/repositories/summarize`, 
      { text }, 
      {
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey && { 'GEMINI_API_KEY': apiKey }),
        }
      }
    )
  }

  async summarizeFile(file: File, apiKey?: string) {
    const formData = new FormData()
    formData.append('file', file)
    
    return apiClient.post<ApiResponse<SummarizeResult>>(`${this.basePath}/repositories/summarize`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(apiKey && { 'GEMINI_API_KEY': apiKey }),
      }
    })
  }

  // Contract Processing
  async processContract(file: File, apiKey?: string) {
    const formData = new FormData()
    formData.append('file', file)
    
    return apiClient.post<ApiResponse<ProcessResult>>(`${this.basePath}/repositories/process`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(apiKey && { 'GEMINI_API_KEY': apiKey }),
      }
    })
  }

  async validateContract(file: File, apiKey?: string) {
    const formData = new FormData()
    formData.append('file', file)
    
    return apiClient.post<ApiResponse<ValidationResult>>(`${this.basePath}/repositories/validate`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(apiKey && { 'GEMINI_API_KEY': apiKey }),
      }
    })
  }

  // File Management
  async uploadFile(file: File, metadata?: any, options?: { folder?: string; user_id?: string }) {
    const formData = new FormData()
    formData.append('file', file)
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata))
    }
    
    // Build URL with query parameters - Use API Gateway endpoint
    const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
    const url = new URL('/api/files/upload', baseURL)
    if (options?.folder) {
      url.searchParams.append('folder', options.folder)
    }
    if (options?.user_id) {
      url.searchParams.append('user_id', options.user_id)
    }
    
    console.log('[AutomationAPI] Uploading file:', {
      url: url.toString(),
      file: file.name,
      size: file.size,
      type: file.type,
      formData: formData instanceof FormData
    })
    
    return apiClient.post<ApiResponse<FileUploadResult>>(url.toString(), formData, {
      headers: {
        // Don't set Content-Type manually for FormData - let browser set it with boundary
      },
    })
  }

  async uploadMultipleFiles(files: File[], metadata?: any) {
    const formData = new FormData()
    files.forEach((file, index) => {
      formData.append('files', file)
    })
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata))
    }
    
    return apiClient.post<ApiResponse<FileUploadResult[]>>(`${this.basePath}/files/batch`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  }

  async getFileById(id: string) {
    return apiClient.get<ApiResponse<FileInfo>>(`${this.basePath}/files/${id}`)
  }

  async getAllFiles(params?: FileSearchParams) {
    return apiClient.get<ApiResponse<any>>(`${this.basePath}/files`, { params })
  }

  async updateFile(id: string, data: { filename?: string; metadata?: any }) {
    return apiClient.put<ApiResponse<FileInfo>>(`${this.basePath}/files/${id}`, data)
  }

  async deleteFile(id: string) {
    return apiClient.delete<ApiResponse<any>>(`${this.basePath}/files/${id}`)
  }

  async checkFileVersion(filename: string, fileSize: number, lastModified?: string) {
    return apiClient.get<ApiResponse<VersionConflictCheck>>(`${this.basePath}/files/check-version`, {
      params: {
        filename,
        file_size: fileSize,
        last_modified: lastModified
      }
    })
  }

  async deleteMultipleFiles(ids: string[]) {
    return apiClient.delete<ApiResponse<any>>(`${this.basePath}/files/batch`, { 
      data: { ids } 
    })
  }

  // File Download
  async downloadFile(id: string) {
    return apiClient.get(`${this.basePath}/files/${id}/download`, {
      responseType: 'blob'
    })
  }

  async getFileUrl(id: string) {
    return apiClient.get<ApiResponse<{ url: string; expiresAt: string }>>(`${this.basePath}/files/${id}/url`)
  }

  // File Processing
  async processFile(id: string, processType: string, options?: any) {
    return apiClient.post<ApiResponse<any>>(`${this.basePath}/files/${id}/process`, {
      processType,
      options
    })
  }

  async getProcessingStatus(id: string) {
    return apiClient.get<ApiResponse<any>>(`${this.basePath}/files/${id}/process/status`)
  }

  // File Analytics
  async getFileStats() {
    return apiClient.get<ApiResponse<any>>(`${this.basePath}/files/stats`)
  }

  async getStorageUsage() {
    return apiClient.get<ApiResponse<any>>(`${this.basePath}/files/storage/usage`)
  }

  // File Search
  async searchFiles(query: string, params?: FileSearchParams) {
    return apiClient.get<ApiResponse<any>>(`${this.basePath}/files/search`, { 
      params: { q: query, ...params } 
    })
  }

  async getFilesByType(mimeType: string, params?: FileSearchParams) {
    return apiClient.get<ApiResponse<any>>(`${this.basePath}/files/by-type`, { 
      params: { mimeType, ...params } 
    })
  }

  // File Validation
  async validateFile(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    
    return apiClient.post<ApiResponse<any>>(`${this.basePath}/files/validate`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  }

  // File Cleanup
  async cleanupOrphanedFiles() {
    return apiClient.post<ApiResponse<any>>(`${this.basePath}/files/cleanup/orphaned`)
  }

  async cleanupExpiredFiles() {
    return apiClient.post<ApiResponse<any>>(`${this.basePath}/files/cleanup/expired`)
  }

  // Batch Processing
  async startBatchProcess(files: File[], apiKey?: string) {
    const formData = new FormData()
    files.forEach((file, index) => {
      formData.append(`files`, file)
    })
    
    return apiClient.post<ApiResponse<BatchProcessResult>>(`${this.basePath}/batch/process`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(apiKey && { 'GEMINI_API_KEY': apiKey }),
      }
    })
  }

  async getBatchStatus(batchId: string) {
    return apiClient.get<ApiResponse<BatchProcessResult>>(`${this.basePath}/batch/${batchId}`)
  }

  async getBatchResults(batchId: string) {
    return apiClient.get<ApiResponse<any>>(`${this.basePath}/batch/${batchId}/results`)
  }

  // AI Configuration
  async getGeminiConfig() {
    return apiClient.get<ApiResponse<any>>(`${this.basePath}/gemini/get-config`)
  }

  async updateGeminiConfig(config: any) {
    return apiClient.put<ApiResponse<any>>(`${this.basePath}/gemini/config`, config)
  }

  // Health Check
  async getHealthStatus() {
    return apiClient.get<ApiResponse<any>>(`${this.basePath}/health`)
  }

  // Analytics
  async getProcessingStats() {
    return apiClient.get<ApiResponse<any>>(`${this.basePath}/analytics/stats`)
  }

  async getProcessingHistory(params?: {
    page?: number
    size?: number
    startDate?: string
    endDate?: string
    type?: string
  }) {
    return apiClient.get<ApiResponse<any>>(`${this.basePath}/analytics/history`, { params })
  }
}

// Export instance
export const automationAPI = new AutomationAPI()

// Export file API instance for backward compatibility
export const fileAPI = automationAPI



