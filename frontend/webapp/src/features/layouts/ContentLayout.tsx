import React from 'react'

interface ContentLayoutProps {
  children: React.ReactNode
  className?: string
}

/**
 * ContentLayout - Base class for business-specific content panels
 * 
 * Features:
 * - Grid layout (1 col mobile, 3 cols desktop)
 * - auto-rows-max: fit content height
 * - Full width
 * - Can be extended for different features (Upload, Contract, Document, etc.)
 */
export function ContentLayout({ children, className = '' }: ContentLayoutProps) {
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 w-full auto-rows-max h-full ${className}`}>
      {children}
    </div>
  )
}
