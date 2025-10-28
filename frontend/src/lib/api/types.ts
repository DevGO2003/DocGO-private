/**
 * API Response Types
 * Global types cho tất cả API responses trong DocGO
 */

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
  apiVersion: string
  statusCode: number
  shortMessage: string
  description: string
  timestamp: string
  requestId: string
  path: string
  errors?: ValidationError[]
}

export interface ValidationError {
  field: string
  message: string
  rejectedValue?: any
}
