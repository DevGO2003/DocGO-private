// Repository Management Service API
// Base path: /api/v1/repository-management-service

import { apiClient } from '../client'
import { ApiResponse } from '@/types/api'

export interface Contract {
  id: string
  title: string
  content: string
  status: string
  type: string
  parties: string[]
  startDate: string
  endDate: string
  value: number
  currency: string
  createdAt: string
  updatedAt: string
  createdBy: string
  tags: string[]
  attachments: string[]
}

export interface ContractCreateData {
  title: string
  content: string
  type: string
  parties: string[]
  startDate: string
  endDate: string
  value: number
  currency: string
  tags?: string[]
}

export interface ContractUpdateData {
  title?: string
  content?: string
  status?: string
  type?: string
  parties?: string[]
  startDate?: string
  endDate?: string
  value?: number
  currency?: string
  tags?: string[]
}

export interface Document {
  id: string
  title: string
  content: string
  type: string
  status: string
  filePath: string
  fileSize: number
  mimeType: string
  createdAt: string
  updatedAt: string
  createdBy: string
  tags: string[]
}

export interface DocumentCreateData {
  title: string
  content: string
  type: string
  filePath?: string
  tags?: string[]
}

export interface PaginationParams {
  page?: number
  size?: number
  sortBy?: string
  sortDirection?: string
  searchTerm?: string
  includeDeleted?: boolean
}

export interface Repository {
  id: string
  name: string
  description?: string
  owner: string // userId/username của người tạo
  ownerName?: string // Tên hiển thị của owner
  memberCount: number
  fileCount: number
  totalSize: number // bytes
  createdAt: string
  updatedAt: string
  isPublic: boolean
  tags?: string[]
}

export interface RepositoryCreateData {
  name: string
  description?: string
  isPublic?: boolean
  tags?: string[]
}

export interface RepositoryUpdateData {
  name?: string
  description?: string
  isPublic?: boolean
  tags?: string[]
}

export class DocumentAPI {
  private basePath = '/api/v1/repository-management-service'

  // Repositories
  async getAllRepositories(params?: PaginationParams) {
    return apiClient.get<ApiResponse<any>>(`${this.basePath}/repositories`, { params })
  }

  async getRepositoryById(id: string) {
    return apiClient.get<ApiResponse<Repository>>(`${this.basePath}/repositories/${id}`)
  }

  async createRepository(data: RepositoryCreateData) {
    return apiClient.post<ApiResponse<Repository>>(`${this.basePath}/repositories`, data)
  }

  async updateRepository(id: string, data: RepositoryUpdateData) {
    return apiClient.put<ApiResponse<Repository>>(`${this.basePath}/repositories/${id}`, data)
  }

  async deleteRepository(id: string) {
    return apiClient.delete<ApiResponse<any>>(`${this.basePath}/repositories/${id}`)
  }

  async getMyRepositories(params?: PaginationParams) {
    return apiClient.get<ApiResponse<any>>(`${this.basePath}/repositories/my`, { params })
  }

  // Contracts
  async getAllContracts(params?: PaginationParams) {
    return apiClient.get<ApiResponse<any>>(`${this.basePath}/contracts`, { params })
  }

  async getContractById(id: string) {
    return apiClient.get<ApiResponse<Contract>>(`${this.basePath}/repositories/${id}`)
  }

  async createContract(contractData: ContractCreateData) {
    return apiClient.post<ApiResponse<Contract>>(`${this.basePath}/contracts`, contractData)
  }

  async updateContract(id: string, contractData: ContractUpdateData) {
    return apiClient.put<ApiResponse<Contract>>(`${this.basePath}/repositories/${id}`, contractData)
  }

  async deleteContract(id: string) {
    return apiClient.delete<ApiResponse<any>>(`${this.basePath}/repositories/${id}`)
  }

  async restoreContract(id: string) {
    return apiClient.put<ApiResponse<Contract>>(`${this.basePath}/repositories/${id}/restore`)
  }

  // Documents
  async getAllDocuments(params?: PaginationParams) {
    return apiClient.get<ApiResponse<any>>(`${this.basePath}/documents`, { params })
  }

  async getDocumentById(id: string) {
    return apiClient.get<ApiResponse<Document>>(`${this.basePath}/repositories/${id}`)
  }

  async createDocument(documentData: DocumentCreateData) {
    return apiClient.post<ApiResponse<Document>>(`${this.basePath}/documents`, documentData)
  }

  async updateDocument(id: string, documentData: Partial<DocumentCreateData>) {
    return apiClient.put<ApiResponse<Document>>(`${this.basePath}/repositories/${id}`, documentData)
  }

  async deleteDocument(id: string) {
    return apiClient.delete<ApiResponse<any>>(`${this.basePath}/repositories/${id}`)
  }

  async restoreDocument(id: string) {
    return apiClient.put<ApiResponse<Document>>(`${this.basePath}/repositories/${id}/restore`)
  }

  // File Management - DEPRECATED: Use automationAPI.uploadFile() instead
  // This method is kept for backward compatibility but will be removed in future versions
  async uploadFile(file: File) {
    console.warn('DocumentAPI.uploadFile() is deprecated. Use automationAPI.uploadFile() instead.')
    // Redirect to automation service
    const { automationAPI } = await import('./automation.service')
    return automationAPI.uploadFile(file)
  }

  async getFileById(id: string) {
    console.warn('DocumentAPI.getFileById() is deprecated. Use automationAPI.getFileById() instead.')
    const { automationAPI } = await import('./automation.service')
    return automationAPI.getFileById(id)
  }

  async deleteFile(id: string) {
    console.warn('DocumentAPI.deleteFile() is deprecated. Use automationAPI.deleteFile() instead.')
    const { automationAPI } = await import('./automation.service')
    return automationAPI.deleteFile(id)
  }

  // Attachments
  async getContractAttachments(contractId: string) {
    return apiClient.get<ApiResponse<any>>(`${this.basePath}/repositories/${contractId}/attachments`)
  }

  async uploadContractAttachment(contractId: string, file: File) {
    const formData = new FormData()
    formData.append('file', file)
    return apiClient.post<ApiResponse<any>>(`${this.basePath}/repositories/${contractId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  }

  // Tags - Disabled tags API
  // async getAllTags() {
  //   return apiClient.get<ApiResponse<any>>(`${this.basePath}/tags`)
  // }

  // async createTag(name: string, color?: string) {
  //   return apiClient.post<ApiResponse<any>>(`${this.basePath}/tags`, { name, color })
  // }

  // async updateTag(id: string, data: { name?: string; color?: string }) {
  //   return apiClient.put<ApiResponse<any>>(`${this.basePath}/tags/${id}`, data)
  // }

  // async deleteTag(id: string) {
  //   return apiClient.delete<ApiResponse<any>>(`${this.basePath}/tags/${id}`)
  // }

  // async searchTags(query: string) {
  //   return apiClient.get<ApiResponse<any>>(`${this.basePath}/tags/search`, { 
  //     params: { q: query } 
  //   })
  // }
}

// Export instance
export const documentAPI = new DocumentAPI()



