import React from 'react'

interface UploadLayoutProps {
  children: React.ReactNode
  className?: string
}

/**
 * UploadLayout - Extends ContentLayout for upload feature
 * 
 * Structure:
 * - 3 columns (desktop), 1 column (mobile)
 * - Left column: Upload Panel, Versioning Panel, System Info Panel
 * - Right column: File Preview Panel (spans 3 rows)
 */
function UploadLayout({ children, className = '' }: UploadLayoutProps) {
  return (
    <div
      className={
        `grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 h-full items-start ` +
        // Only remove margins for immediate children to keep inner centering (mx-auto) working
        `[&>*]:m-0 ` +
        className
      }
    >
      {children}
    </div>
  )
}

export default UploadLayout
