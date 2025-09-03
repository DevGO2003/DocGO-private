import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { toast } from 'react-hot-toast'

// Types
export interface ApiResponse<T = any> {
  apiVersion: string
  statusCode: number
  shortMessage: string
  description: string
  data: T
  timestamp: string
  requestId: string
  path: string
}

export interface PaginatedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
  numberOfElements: number
}

// API Configuration
class ApiClient {
  private client: AxiosInstance
  private baseURL: string

  constructor() {
    // Sử dụng API Gateway BFF thay vì gọi trực tiếp đến microservices
    this.baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response
      },
      (error) => {
        this.handleApiError(error)
        return Promise.reject(error)
      }
    )
  }

  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token')
    }
    return null
  }

  private handleApiError(error: any) {
    const status = error.response?.status
    const message = error.response?.data?.description || 'Đã xảy ra lỗi'

    switch (status) {
      case 401:
        this.handleUnauthorized()
        break
      case 403:
        toast.error('Bạn không có quyền truy cập')
        break
      case 404:
        toast.error('Không tìm thấy tài nguyên')
        break
      case 500:
        toast.error('Lỗi server, vui lòng thử lại sau')
        break
      default:
        toast.error(message)
    }
  }

  private handleUnauthorized() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user_data')
      window.location.href = '/auth/login'
    }
  }

  // Generic request methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.client.get(url, config)
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.client.post(url, data, config)
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.client.put(url, data, config)
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.client.delete(url, config)
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.client.patch(url, data, config)
  }
}

// Create API client instance
const apiClient = new ApiClient()

// Contract Management API - Sử dụng API Gateway
export class ContractAPI {
  private basePath = '/api/v1/contract-management-service'

  async getContracts(params?: {
    pageNumber?: number
    pageSize?: number
    sortBy?: string
    sortDirection?: 'ASC' | 'DESC'
    searchTerm?: string
    includeDeleted?: boolean
  }) {
    return apiClient.get<PaginatedResponse<any>>(`${this.basePath}/contracts`, { params })
  }

  async getContract(id: string) {
    return apiClient.get<any>(`${this.basePath}/contracts/${id}`)
  }

  async createContract(data: any) {
    return apiClient.post<any>(`${this.basePath}/contracts`, data)
  }

  async updateContract(id: string, data: any) {
    return apiClient.put<any>(`${this.basePath}/contracts/${id}`, data)
  }

  async deleteContract(id: string) {
    return apiClient.delete<any>(`${this.basePath}/contracts/${id}`)
  }

  async restoreContract(id: string) {
    return apiClient.put<any>(`${this.basePath}/contracts/${id}/restore`)
  }

  async getContractEvents(id: string) {
    return apiClient.get<any[]>(`${this.basePath}/contracts/${id}/events`)
  }

  async getContractAttachments(id: string) {
    return apiClient.get<any[]>(`${this.basePath}/contracts/${id}/attachments`)
  }
}

// User Management API - Sử dụng API Gateway
export class UserAPI {
  private basePath = '/api/v1/user-management-service'

  async getUsers(params?: {
    pageNumber?: number
    pageSize?: number
    sortBy?: string
    sortDirection?: 'ASC' | 'DESC'
    searchTerm?: string
  }) {
    return apiClient.get<PaginatedResponse<any>>(`${this.basePath}/users`, { params })
  }

  async getUser(id: string) {
    return apiClient.get<any>(`${this.basePath}/users/${id}`)
  }

  async createUser(data: any) {
    return apiClient.post<any>(`${this.basePath}/users`, data)
  }

  async updateUser(id: string, data: any) {
    return apiClient.put<any>(`${this.basePath}/users/${id}`, data)
  }

  async deleteUser(id: string) {
    return apiClient.delete<any>(`${this.basePath}/users/${id}`)
  }

  async changePassword(id: string, data: { oldPassword: string; newPassword: string }) {
    return apiClient.put<any>(`${this.basePath}/users/${id}/password`, data)
  }
}

// AI Processing API - Sử dụng API Gateway
export class AIProcessingAPI {
  private basePath = '/api/v1/ai-processing-service'

  async extractText(file: File, apiKey?: string) {
    const formData = new FormData()
    formData.append('file', file)
    
    return apiClient.post<any>(`${this.basePath}/extract`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(apiKey && { 'GEMINI_API_KEY': apiKey }),
      },
    })
  }

  async summarizeText(text: string, apiKey?: string) {
    return apiClient.post<any>(`${this.basePath}/summarize`, { text }, {
      headers: {
        ...(apiKey && { 'GEMINI_API_KEY': apiKey }),
      },
    })
  }

  async summarizeFile(file: File, apiKey?: string) {
    const formData = new FormData()
    formData.append('file', file)
    
    return apiClient.post<any>(`${this.basePath}/summarize`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(apiKey && { 'GEMINI_API_KEY': apiKey }),
      },
    })
  }
}

// File Storage API - Sử dụng API Gateway
export class FileStorageAPI {
  private basePath = '/api/v1/file-storage-asset-service'

  async uploadFile(file: File, metadata?: any) {
    const formData = new FormData()
    formData.append('file', file)
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata))
    }
    
    return apiClient.post<any>(`${this.basePath}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  }

  async getFile(id: string) {
    return apiClient.get<any>(`${this.basePath}/files/${id}`)
  }

  async deleteFile(id: string) {
    return apiClient.delete<any>(`${this.basePath}/files/${id}`)
  }

  async getFiles(params?: {
    pageNumber?: number
    pageSize?: number
    searchTerm?: string
    category?: string
  }) {
    return apiClient.get<PaginatedResponse<any>>(`${this.basePath}/files`, { params })
  }
}

// Authentication API - Sử dụng API Gateway
export class AuthAPI {
  private basePath = '/api/v1/authentication-identity-service'

  async login(credentials: { username: string; password: string }) {
    return apiClient.post<any>(`${this.basePath}/auth/login`, credentials)
  }

  async register(userData: any) {
    return apiClient.post<any>(`${this.basePath}/auth/register`, userData)
  }

  async refreshToken(refreshToken: string) {
    return apiClient.post<any>(`${this.basePath}/auth/refresh`, { refreshToken })
  }

  async logout() {
    return apiClient.post<any>(`${this.basePath}/auth/logout`)
  }

  async forgotPassword(email: string) {
    return apiClient.post<any>(`${this.basePath}/auth/forgot-password`, { email })
  }

  async resetPassword(token: string, newPassword: string) {
    return apiClient.post<any>(`${this.basePath}/auth/reset-password`, { token, newPassword })
  }

  async getProfile() {
    return apiClient.get<any>(`${this.basePath}/auth/profile`)
  }

  async updateProfile(data: any) {
    return apiClient.put<any>(`${this.basePath}/auth/profile`, data)
  }
}

// Export API instances
export const contractAPI = new ContractAPI()
export const userAPI = new UserAPI()
export const aiProcessingAPI = new AIProcessingAPI()
export const fileStorageAPI = new FileStorageAPI()
export const authAPI = new AuthAPI()

// Export default client for custom requests
export default apiClient
