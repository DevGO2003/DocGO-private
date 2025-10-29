import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import env from '@shared/config/env';

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

class ApiClient {
  private client: AxiosInstance
  private baseURL: string

  constructor() {
    this.baseURL = env.apiBaseUrl
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      // Do not set default Content-Type; let axios/browser set appropriately
      withCredentials: true,
    })
    this.setupInterceptors()
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(
      (config: any) => {
        const token = this.getAuthToken()
        if (token) config.headers.Authorization = `Bearer ${token}`
        if (config.data instanceof FormData) {
          // Remove any Content-Type so the browser can set multipart boundary
          if (config.headers) {
            delete (config.headers as any)['Content-Type']
            delete (config.headers as any)['content-type']
          }
        }
        if (env.isDev) console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`)
        return config
      },
      (error: any) => Promise.reject(error)
    )

    this.client.interceptors.response.use(
      (response: any) => {
        if (response.data && typeof response.data.statusCode === 'number') {
          const statusCode = response.data.statusCode
          const isSuccess = statusCode === 200 || statusCode === 201 || statusCode === 204
          if (!isSuccess) {
            const error = { response: { status: response.status, data: response.data } }
            this.handleApiError(error)
            return Promise.reject(error)
          }
        }
        return response
      },
      async (error: any) => {
        const originalRequest = error.config
        const isUnauthorized = error.response?.status === 401 || error.response?.data?.statusCode === 401
        const isForbidden = error.response?.status === 403 || error.response?.data?.statusCode === 403
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

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null
    try {
      const authData = localStorage.getItem('docgo_auth_v1')
      if (authData) {
        const parsed = JSON.parse(authData)
        if (parsed.tokenData?.accessToken) {
          if (parsed.tokenData.expiresAt && Date.now() >= parsed.tokenData.expiresAt) {
            this.clearExpiredTokens()
            return null
          }
          return parsed.tokenData.accessToken
        }
        if (parsed.accessToken) return parsed.accessToken
      }
      return localStorage.getItem('auth_token')
    } catch (error) {
      this.clearExpiredTokens()
      return null
    }
  }

  private clearExpiredTokens(): void {
    if (typeof window === 'undefined') return
    try {
      localStorage.removeItem('docgo_auth_v1')
      localStorage.removeItem('auth_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user_data')
    } catch {}
  }

  private handleApiError(error: any) {
    const status = error.response?.status
    const responseData = error.response?.data
    let message = 'Đã xảy ra lỗi'
    let statusCode = status || 500
    if (responseData) {
      if (responseData.statusCode) statusCode = responseData.statusCode
      message = responseData.description || responseData.message || message
    }
    if (responseData?.errors && Array.isArray(responseData.errors)) {
      const validationErrors = responseData.errors.map((e: any) => `${e.field}: ${e.message}`).join(', ')
      message = `Lỗi validation: ${validationErrors}`
    }
    if (env.isDev) console.error('[API Error]', { status: statusCode, message, url: error.config?.url, data: responseData })
  }

  private async handleUnauthorized(): Promise<boolean> {
    if (typeof window === 'undefined') return false
    try {
      const refreshToken = localStorage.getItem('refresh_token')
      if (!refreshToken) { this.logout(); return false }
      const response = await this.client.post('/api/v1/user-management-service/auth/refresh', { refreshToken })
      const refreshData = response.data?.data
      if (refreshData?.accessToken) {
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
        if (refreshData.refreshToken) localStorage.setItem('refresh_token', refreshData.refreshToken)
        return true
      }
    } catch (error) {
      this.logout()
    }
    return false
  }

  private logout() {
    if (typeof window === 'undefined') return
    this.clearExpiredTokens()
    const path = window.location.pathname
    const isOnAuthPages = path === '/login' || path.startsWith('/auth')
    if (!isOnAuthPages) window.location.href = '/login'
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> { return this.client.get(url, config) }
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> { return this.client.post(url, data, config) }
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> { return this.client.put(url, data, config) }
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> { return this.client.delete(url, config) }
  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> { return this.client.patch(url, data, config) }
  async getRaw<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> { return this.client.get<T>(url, config) }
}

export const apiClient = new ApiClient()
export { ApiClient }
