import { vi } from '../_i18n/vi'

/**
 * Format null/undefined values to Vietnamese "Không có thông tin"
 */
export function formatValue(value: any, fallback: string = vi.common.noData): string {
  if (value === null || value === undefined || value === '') {
    return fallback
  }
  return String(value)
}

/**
 * Format date to Vietnamese locale
 */
export function formatDate(dateString?: string, fallback: string = vi.common.noData): string {
  if (!dateString) return fallback
  try {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  } catch {
    return fallback
  }
}

/**
 * Format date with time to Vietnamese locale
 */
export function formatDateTime(dateString?: string, fallback: string = vi.common.noData): string {
  if (!dateString) return fallback
  try {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return fallback
  }
}

/**
 * Format currency to Vietnamese locale
 */
export function formatCurrency(amount?: number, currency: string = 'VND', fallback: string = vi.common.noData): string {
  if (amount === null || amount === undefined) return fallback
  try {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  } catch {
    return `${amount} ${currency}`
  }
}

/**
 * Format array to display, return fallback if empty
 */
export function formatArray(arr?: any[], fallback: string = vi.common.noData): string {
  if (!arr || arr.length === 0) return fallback
  return arr.join(', ')
}

/**
 * Translate enum values to Vietnamese
 */
export function translateEnum(value: string | undefined, enumType: keyof typeof vi): string {
  if (!value) return vi.common.noData
  
  const translations = vi[enumType] as Record<string, string>
  return translations[value] || value
}

/**
 * Get display value or fallback
 */
export function getDisplayValue(value: any, fallback?: string): string {
  return formatValue(value, fallback)
}
