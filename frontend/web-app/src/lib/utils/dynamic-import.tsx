/**
 * Dynamic Import Utilities
 * Wrapper functions để lazy load components và giảm initial bundle size
 */

import dynamic from 'next/dynamic'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'

/**
 * Lazy load component với loading fallback
 */
export const lazyLoad = <T extends object = any>(
  importFunc: () => Promise<{ default: React.ComponentType<T> }>,
  options?: {
    loading?: () => React.ReactElement
    ssr?: boolean
  }
) => {
  return dynamic(importFunc, {
    loading: options?.loading || (() => <LoadingSpinner />),
    ssr: options?.ssr ?? false,
  })
}

/**
 * Lazy load heavy components (charts, editors, viewers)
 */
export const lazyLoadHeavy = <T extends object>(
  importFunc: () => Promise<{ default: React.ComponentType<T> }>
) => {
  return dynamic(importFunc, {
    loading: () => (
      <div className="flex items-center justify-center min-h-[200px]">
        <LoadingSpinner />
      </div>
    ),
    ssr: false, // Disable SSR for heavy components
  })
}

/**
 * Preload component cho faster navigation
 */
export const preloadComponent = (
  importFunc: () => Promise<{ default: React.ComponentType<any> }>
) => {
  // Start loading component
  importFunc()
}

/**
 * Lazy load với retry logic
 */
export const lazyLoadWithRetry = <T extends object = any>(
  importFunc: () => Promise<{ default: React.ComponentType<T> }>,
  retries = 3
) => {
  return lazyLoad<T>(
    () =>
      new Promise<{ default: React.ComponentType<T> }>((resolve, reject) => {
        const attemptLoad = (remainingRetries: number) => {
          importFunc()
            .then(resolve)
            .catch((error) => {
              if (remainingRetries > 0) {
                console.warn(`Retrying import... (${remainingRetries} attempts left)`)
                setTimeout(() => attemptLoad(remainingRetries - 1), 1000)
              } else {
                reject(error)
              }
            })
        }
        attemptLoad(retries)
      })
  )
}
