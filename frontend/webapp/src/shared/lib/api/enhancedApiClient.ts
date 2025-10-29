import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { tokenManager } from './tokenManager';

export interface ApiError {
  statusCode: number;
  shortMessage: string;
  description: string;
  timestamp: string;
  requestId?: string;
}

export class EnhancedApiClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = tokenManager.getAuthToken();
        
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Don't set Content-Type for FormData
        if (config.data instanceof FormData) {
          delete config.headers['Content-Type'];
        }

        if (import.meta.env.DEV) {
          console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
            hasAuth: !!token,
            data: config.data
          });
        }

        return config;
      },
      (error: AxiosError) => {
        console.error('[API Request] Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        if (import.meta.env.DEV) {
          console.log(`[API Response] ${response.config.url}:`, {
            status: response.status,
            data: response.data
          });
        }
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
        
        console.error('[API Response] Error:', {
          url: error.config?.url,
          status: error.response?.status,
          message: error.message
        });

        // Handle authentication errors
        if (this.isAuthenticationError(error) && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            console.log('[API] Attempting token refresh...');
            const newToken = await tokenManager.refreshToken();
            
            if (newToken && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            console.error('[API] Token refresh failed:', refreshError);
            this.handleAuthenticationFailure();
            return Promise.reject(refreshError);
          }
        }

        // Handle other errors
        this.handleApiError(error);
        return Promise.reject(error);
      }
    );
  }

  private isAuthenticationError(error: AxiosError): boolean {
    const status = error.response?.status;
    const statusCode = error.response?.data?.statusCode;
    
    return status === 401 || statusCode === 401 || 
           status === 403 || statusCode === 403;
  }

  private handleAuthenticationFailure(): void {
    tokenManager.clearTokens();
    
    // Show user-friendly message
    if (typeof window !== 'undefined') {
      // You can replace this with your notification system
      alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      
      // Redirect to login
      window.location.href = '/login';
    }
  }

  private handleApiError(error: AxiosError): void {
    const apiError = this.extractApiError(error);
    
    if (import.meta.env.DEV) {
      console.error('[API Error]', apiError);
    }

    // You can integrate with your notification system here
    // For example: toast.error(apiError.description);
  }

  private extractApiError(error: AxiosError): ApiError {
    const response = error.response;
    
    if (response?.data && typeof response.data === 'object') {
      return {
        statusCode: response.data.statusCode || response.status || 500,
        shortMessage: response.data.shortMessage || 'Error',
        description: response.data.description || error.message,
        timestamp: response.data.timestamp || new Date().toISOString(),
        requestId: response.data.requestId
      };
    }

    return {
      statusCode: response?.status || 500,
      shortMessage: 'Network Error',
      description: error.message || 'An unexpected error occurred',
      timestamp: new Date().toISOString()
    };
  }

  // Public methods
  async get<T>(url: string, config?: any): Promise<AxiosResponse<T>> {
    return this.client.get<T>(url, config);
  }

  async post<T>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data, config);
  }

  async put<T>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
    return this.client.put<T>(url, data, config);
  }

  async delete<T>(url: string, config?: any): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(url, config);
  }

  async patch<T>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
    return this.client.patch<T>(url, data, config);
  }
}

export const enhancedApiClient = new EnhancedApiClient();


