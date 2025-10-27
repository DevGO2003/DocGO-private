import { ReactNode, useState } from 'react'
import HeaderPanel from '../../components/HeaderPanel'

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
  title = 'Content',
  subtitle,
  breadcrumbs,
  showToolbar = false,
  toolbarContent,
}: ControlMainLayoutProps) {
  const [isToolbarCollapsed, setIsToolbarCollapsed] = useState(false)

  return (
    <div className="flex flex-col h-full w-full relative gap-2.5">
      {/* Header Panel */}
      <div className="flex-shrink-0">
        <HeaderPanel title={title} subtitle={subtitle} breadcrumbs={breadcrumbs} />
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {children}
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
