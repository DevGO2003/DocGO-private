---
id: "rule-frontend-payload"
trigger: model_decision
description: Quy tắc chuẩn hóa frontend API integration patterns cho DocGO web application bao gồm ApiResponse handling, error management, và TypeScript type definitions. Đảm bảo consistent API client implementation, proper error boundaries, loading states, và user experience across all frontend components. Quy tắc bao gồm Axios configuration, response interceptors, token refresh logic, và comprehensive error handling để duy trì robust frontend-backend communication.
globs:
  - "**/*.java"
  - "**/*.py"
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.js"
  - "**/*.jsx"
  - "**/*.json"
  - "**/*.yaml"
  - "**/*.yml"
  - "**/*.xml"
  - "**/*.md"
  - "**/*.txt"
  - "**/*.html"
  - "**/src/**/*.*"
  - "**/config/**/*.*"
  - "**/scripts/**/*.*"
tags:
  - frontend
  - api
  - payload
  - typescript
  - axios
  - error-handling
  - response
  - types
---

# Frontend Payload Standards cho DocGO

## Mục tiêu
- Chuẩn hóa cách frontend xử lý ApiResponse từ backend
- Đồng nhất error handling và user experience
- Tối ưu hóa type safety và developer experience
- Đảm bảo consistency giữa các API calls

## 1. Type Definitions Chuẩn

### ApiResponse Interface
```typescript
// lib/types/api.ts
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

export interface ApiError {
  statusCode: number
  shortMessage: string
  description: string
  errors?: Array<{
    field: string
    message: string
    code: string
  }>
  timestamp: string
  requestId: string
  path: string
}
```

### Generic API Types
```typescript
// lib/types/common.ts
export interface PaginationParams {
  pageNumber?: number
  pageSize?: number
  sortBy?: string
  sortDirection?: 'ASC' | 'DESC'
  searchTerm?: string
  includeDeleted?: boolean
}

export interface ViewParams {
  view?: string
}

export interface ApiRequestConfig {
  signal?: AbortSignal
  timeout?: number
  headers?: Record<string, string>
}
```

## 2. API Client Standards

### Axios Instance Setup
```typescript
// lib/http/api-client.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { toast } from 'react-hot-toast'

class ApiClient {
  private client: AxiosInstance
  private baseURL: string

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    })
    
    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Handle mock API calls
        if (config.url?.includes('/api/mock/')) {
          config.baseURL = 'http://localhost:3000'
        }
        
        // Handle FormData (remove Content-Type)
        if (config.data instanceof FormData) {
          delete config.headers['Content-Type']
        }
        
        // Add auth token
        const token = this.getAuthToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        // Check statusCode in response body
        if (response.data && typeof response.data.statusCode === 'number') {
          const statusCode = response.data.statusCode
          const isSuccessCode = statusCode === 200 || statusCode === 201 || statusCode === 204
          
          if (!isSuccessCode) {
            const error = { response: { status: response.status, data: response.data } }
            this.handleApiError(error)
            return Promise.reject(error)
          }
        }
        return response
      },
      async (error) => {
        // Handle 401/403 with token refresh
        const originalRequest = error.config
        const isUnauthorized = error.response?.status === 401 || (error.response?.data?.statusCode === 401)
        const isForbidden = error.response?.status === 403 || (error.response?.data?.statusCode === 403)

        if ((isUnauthorized || isForbidden) && !originalRequest._retry) {
          originalRequest._retry = true
          try {
            const refreshSuccess = await this.handleUnauthorized()
            if (refreshSuccess) {
              const newToken = this.getAuthToken()
              if (newToken) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`
                return this.client(originalRequest)
              }
            }
          } catch (retryError) {
            console.error('[API] Request retry failed:', retryError)
          }
        }

        this.handleApiError(error)
        return Promise.reject(error)
      }
    )
  }
}
```

## 3. Error Handling Flow

### Status Code Handling
```typescript
private handleApiError(error: any) {
  const status = error.response?.status
  const responseData = error.response?.data
  let message = 'Đã xảy ra lỗi'
  let shortMessage = 'Error'
  let statusCode = status || 500

  if (responseData) {
    if (responseData.statusCode) {
      statusCode = responseData.statusCode
    }
    message = responseData.description || responseData.message || message
    shortMessage = responseData.shortMessage || shortMessage
  }

  // Handle validation errors
  if (responseData?.errors && Array.isArray(responseData.errors)) {
    const validationErrors = responseData.errors
      .map((err: any) => `${err.field}: ${err.message}`)
      .join(', ')
    message = `Lỗi validation: ${validationErrors}`
  }

  // Show appropriate toast based on statusCode
  switch (statusCode) {
    case 400:
      toast.error(message)
      break
    case 401:
      this.handleUnauthorized()
      break
    case 403:
      if (responseData?.message === 'permission error') {
        console.warn('[API] 403 permission error - likely expired token')
      } else {
        toast.error('Bạn không có quyền truy cập')
      }
      break
    case 404:
      toast.error('Không tìm thấy tài nguyên')
      break
    case 409:
      toast.error(message || 'Xung đột dữ liệu')
      break
    case 422:
      toast.error(message || 'Dữ liệu không hợp lệ')
      break
    case 500:
      console.error('[API] Server error 500:', {
        url: this.baseURL,
        message,
        response: responseData
      })
      toast.error('Lỗi server, vui lòng thử lại sau')
      break
    default:
      toast.error(message)
  }
}
```

### Token Refresh Logic
```typescript
private async handleUnauthorized() {
  if (typeof window !== 'undefined') {
    try {
      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken) {
        const refreshResponse = await this.client.post(
          `${this.baseURL}/api/v1/user-management-service/auth/refresh`, 
          { refreshToken }
        )
        const refreshData = refreshResponse.data?.data
        if (refreshData?.accessToken) {
          // Update stored tokens
          const authData = localStorage.getItem('docgo_auth_v1')
          if (authData) {
            const parsed = JSON.parse(authData)
            parsed.accessToken = refreshData.accessToken
            parsed.tokenData = {
              ...parsed.tokenData,
              accessToken: refreshData.accessToken,
              refreshToken: refreshData.refreshToken || refreshToken,
              expiresAt: Date.now() + ((refreshData.expiresIn || 900) * 1000),
              tokenType: refreshData.tokenType || 'Bearer'
            }
            localStorage.setItem('docgo_auth_v1', JSON.stringify(parsed))
          }
          localStorage.setItem('auth_token', refreshData.accessToken)
          if (refreshData.refreshToken) {
            localStorage.setItem('refresh_token', refreshData.refreshToken)
          }
          return true
        }
      }
    } catch (refreshError) {
      console.error('Token refresh failed:', refreshError)
    }

    // Clear tokens and redirect to login
    this.clearExpiredTokens()
    const path = window.location.pathname || ''
    const isOnAuthPages = path === '/auth/login' || path.startsWith('/auth')
    if (!isOnAuthPages) {
      window.location.href = '/auth/login'
    }
  }
  return false
}
```

## 4. API Service Classes

### Base API Service Pattern
```typescript
// lib/api/base-api.ts
export abstract class BaseAPI {
  protected basePath: string
  protected apiClient: ApiClient

  constructor(basePath: string, apiClient: ApiClient) {
    this.basePath = basePath
    this.apiClient = apiClient
  }

  protected async get<T>(endpoint: string, params?: any, config?: ApiRequestConfig) {
    return this.apiClient.get<ApiResponse<T>>(`${this.basePath}${endpoint}`, { params, ...config })
  }

  protected async post<T>(endpoint: string, data?: any, config?: ApiRequestConfig) {
    return this.apiClient.post<ApiResponse<T>>(`${this.basePath}${endpoint}`, data, config)
  }

  protected async put<T>(endpoint: string, data?: any, config?: ApiRequestConfig) {
    return this.apiClient.put<ApiResponse<T>>(`${this.basePath}${endpoint}`, data, config)
  }

  protected async delete<T>(endpoint: string, config?: ApiRequestConfig) {
    return this.apiClient.delete<ApiResponse<T>>(`${this.basePath}${endpoint}`, config)
  }
}
```

### Specific API Service Example
```typescript
// lib/api/contract-api.ts
export class ContractAPI extends BaseAPI {
  constructor(apiClient: ApiClient) {
    super('/api/v1/file-management-service', apiClient)
  }

  async getContracts(params?: PaginationParams & ViewParams, options?: ApiRequestConfig) {
    return this.get<PaginatedResponse<any>>('/contracts', params, options)
  }

  async getContract(id: string, view?: string, options?: ApiRequestConfig) {
    const params = view ? { view } : {}
    return this.get<any>(`/contracts/${id}`, params, options)
  }

  async createContract(data: any, view?: string, options?: ApiRequestConfig) {
    const params = view ? { view } : {}
    return this.post<any>('/contracts', data, { params, ...options })
  }

  async updateContract(id: string, data: any, view?: string, options?: ApiRequestConfig) {
    const params = view ? { view } : {}
    return this.put<any>(`/contracts/${id}`, data, { params, ...options })
  }

  async deleteContract(id: string, view?: string, options?: ApiRequestConfig) {
    const params = view ? { view } : {}
    return this.delete<any>(`/contracts/${id}`, { params, ...options })
  }
}
```

## 5. React Hooks cho API

### Custom Hook Pattern
```typescript
// hooks/use-contracts.ts
import { useState, useEffect } from 'react'
import { contractAPI } from '@/lib/api/contract-api'
import { PaginationParams, ViewParams } from '@/lib/types/common'

export function useContracts(params?: PaginationParams & ViewParams) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    totalElements: 0,
    totalPages: 0,
    size: 10,
    number: 0
  })

  const fetchContracts = async (newParams?: PaginationParams & ViewParams) => {
    try {
      setLoading(true)
      setError(null)
      const response = await contractAPI.getContracts(newParams || params)
      if (response.data) {
        setData(response.data.content)
        setPagination({
          totalElements: response.data.totalElements,
          totalPages: response.data.totalPages,
          size: response.data.size,
          number: response.data.number
        })
      }
    } catch (err: any) {
      setError(err.response?.data?.description || 'Failed to fetch contracts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContracts()
  }, [])

  return {
    data,
    loading,
    error,
    pagination,
    refetch: fetchContracts
  }
}
```

## 6. Best Practices

### Environment Configuration
```typescript
// lib/config/api.ts
export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
  enableLogging: process.env.NODE_ENV === 'development'
} as const
```

### Error Boundary cho API
```typescript
// components/ErrorBoundary.tsx
import React, { Component, ReactNode } from 'react'
import { toast } from 'react-hot-toast'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ApiErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('API Error Boundary caught an error:', error, errorInfo)
    toast.error('Đã xảy ra lỗi không mong muốn')
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 text-center">
          <h2 className="text-xl font-semibold text-red-600">Đã xảy ra lỗi</h2>
          <p className="text-gray-600">Vui lòng thử lại sau</p>
        </div>
      )
    }

    return this.props.children
  }
}
```

### Loading States
```typescript
// components/LoadingSpinner.tsx
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
}

export function LoadingSpinner({ size = 'md', text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  return (
    <div className="flex items-center justify-center space-x-2">
      <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`} />
      {text && <span className="text-gray-600">{text}</span>}
    </div>
  )
}
```

## 7. Testing API Calls

### Unit Tests
```typescript
// __tests__/api-client.test.ts
import { ApiClient } from '@/lib/http/api-client'

describe('ApiClient', () => {
  let apiClient: ApiClient

  beforeEach(() => {
    apiClient = new ApiClient()
  })

  it('should handle successful response', async () => {
    const mockResponse = {
      data: {
        apiVersion: '1.0',
        statusCode: 200,
        shortMessage: 'Success',
        description: 'Operation completed',
        data: { id: 1, name: 'Test' },
        timestamp: '2024-01-15T10:30:00.000Z',
        requestId: 'req_123',
        path: '/api/test'
      }
    }

    // Mock axios
    jest.spyOn(apiClient, 'get').mockResolvedValue(mockResponse)

    const result = await apiClient.get('/test')
    expect(result.data.statusCode).toBe(200)
    expect(result.data.data.name).toBe('Test')
  })

  it('should handle error response', async () => {
    const mockError = {
      response: {
        status: 400,
        data: {
          statusCode: 400,
          shortMessage: 'Bad Request',
          description: 'Invalid input data'
        }
      }
    }

    jest.spyOn(apiClient, 'get').mockRejectedValue(mockError)

    await expect(apiClient.get('/test')).rejects.toThrow()
  })
})
```

---

**Lưu ý**: Frontend payload standards này đảm bảo tính nhất quán trong việc xử lý API responses, error handling, và user experience cho DocGO web application.