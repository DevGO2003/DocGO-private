import React from 'react'
import { ContentLayout } from '../../layouts/ContentLayout'

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
    <ContentLayout className={className}>
      {children}
    </ContentLayout>
  )
}

export default UploadLayout
