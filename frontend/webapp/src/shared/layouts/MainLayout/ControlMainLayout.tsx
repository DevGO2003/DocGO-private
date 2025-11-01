import { ReactNode, useState, Suspense } from 'react'
import { HeaderControlLayout } from '../../layouts/HeaderControlLayout'

interface ControlMainLayoutProps {
  children: ReactNode
  title?: string
  subtitle?: string
  breadcrumbs?: Array<{
    label: string
    href?: string
    current?: boolean
  }>
  showToolbar?: boolean
  toolbarContent?: ReactNode
  loading?: boolean
  loadingText?: string
  headerChildren?: ReactNode
  headerRight?: ReactNode
  primaryTabs?: React.ReactNode
  secondaryTabs?: React.ReactNode
  onRefresh?: () => void
}

/**
 * ControlMainLayout - Transparent wrapper for main content
 * 
 * Structure:
 * - HeaderPanel (top)
 * - Content area (flex-1, children)
 * - Toolbar panel (bottom, optional)
 * 
 * Features:
 * - Transparent background (no styling interference)
 * - Flexible for different business content
 * - Optional toolbar at bottom
 */
export function ControlMainLayout({
  children,
  title,
  subtitle,
  breadcrumbs,
  showToolbar = false,
  toolbarContent,
  loading = false,
  loadingText = '',
  headerChildren,
  headerRight,
  primaryTabs,
  secondaryTabs,
  onRefresh,
}: ControlMainLayoutProps) {
  const [isToolbarCollapsed, setIsToolbarCollapsed] = useState(false)
  const [contentKey, setContentKey] = useState(0)

  // Handle refresh: call onRefresh if provided, otherwise remount content
  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh()
    } else {
      setContentKey((k) => k + 1)
    }
  }

  return (
    <div id="control-main-layout-root" className="flex flex-col h-full w-full relative gap-2.5">
      {/* Header Panel */}
      {(title || subtitle || (breadcrumbs && breadcrumbs.length > 0) || headerChildren || headerRight) && (
        <div className="flex-shrink-0">
          <HeaderControlLayout
            title={title ?? ''}
            subtitle={subtitle}
            breadcrumbs={breadcrumbs}
            rightActions={headerRight}
            headerChildren={headerChildren}
            primaryTabs={primaryTabs}
            secondaryTabs={secondaryTabs}
            onRefresh={handleRefresh}
          />
        </div>
      )}

      {/* Content Area */}
      <div key={contentKey} className="flex-1 overflow-y-auto relative">
        <Suspense
          fallback={
            <div className="space-y-4 p-4">
              <div className="animate-pulse space-y-3">
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-100 rounded w-2/3"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="animate-pulse h-32 bg-gray-100 rounded-xl"></div>
                <div className="animate-pulse h-32 bg-gray-100 rounded-xl"></div>
                <div className="animate-pulse h-32 bg-gray-100 rounded-xl"></div>
              </div>
              <div className="animate-pulse h-64 bg-gray-100 rounded-xl"></div>
            </div>
          }
        >
          {loading ? (
            <div className="space-y-4 p-4">
              <div className="animate-pulse space-y-3">
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-100 rounded w-2/3"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="animate-pulse h-32 bg-gray-100 rounded-xl"></div>
                <div className="animate-pulse h-32 bg-gray-100 rounded-xl"></div>
                <div className="animate-pulse h-32 bg-gray-100 rounded-xl"></div>
              </div>
              <div className="animate-pulse h-64 bg-gray-100 rounded-xl"></div>
            </div>
          ) : (
            children
          )}
        </Suspense>
      </div>

      {/* Floating Toolbar Panel */}
      {showToolbar && toolbarContent && (
        <div
          className={`fixed bottom-2.5 right-2.5 bg-white border border-gray-200 rounded-lg shadow-lg transition-all duration-300 z-40 ${
            isToolbarCollapsed ? 'w-12 h-12' : 'w-80'
          }`}
        >
          {/* Toolbar Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-100 bg-gray-50 rounded-t-lg">
            {!isToolbarCollapsed && (
              <p className="text-sm font-semibold text-gray-900">Công cụ</p>
            )}
            <button
              onClick={() => setIsToolbarCollapsed(!isToolbarCollapsed)}
              className="ml-auto p-1 hover:bg-gray-200 rounded transition-colors"
              title={isToolbarCollapsed ? 'Mở rộng' : 'Thu nhỏ'}
            >
              {isToolbarCollapsed ? (
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              )}
            </button>
          </div>

          {/* Toolbar Content */}
          {!isToolbarCollapsed && (
            <div className="p-3 overflow-y-auto max-h-96">
              {toolbarContent}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
