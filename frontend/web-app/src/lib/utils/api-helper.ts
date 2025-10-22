/**
 * API Helper - Tự động fallback sang mock data khi auth bị tắt
 */

export async function fetchWithMockFallback<T>(
  apiCall: () => Promise<T>,
  mockCall: () => Promise<T>,
  errorMessage?: string
): Promise<T> {
  try {
    return await apiCall()
  } catch (apiError) {
    console.log('API failed, using mock data:', errorMessage || '')
    return await mockCall()
  }
}

export async function fetchAPI(url: string, options?: RequestInit) {
  const response = await fetch(url, options)
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`)
  }
  return response.json()
}
