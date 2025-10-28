import { vi } from '../i18n/vi'

export function formatValue(value: any, fallback: string = vi.common.noData): string {
  if (value === null || value === undefined || value === '') {
    return fallback
  }
  return String(value)
}

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
