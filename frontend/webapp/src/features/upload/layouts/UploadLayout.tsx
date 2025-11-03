import React from 'react'
import { ControlMainLayout } from '@shared/layouts'

interface UploadLayoutProps {
  children: React.ReactNode
  className?: string
  title?: string
  subtitle?: string
  description?: string
  breadcrumbs?: Array<{ label: string; href?: string; current?: boolean }>
  headerChildren?: React.ReactNode
  headerRight?: React.ReactNode
  showToolbar?: boolean
  toolbarContent?: React.ReactNode
  loading?: boolean
  loadingText?: string
  extra?: React.ReactNode
  onRefresh?: () => void
}

/**
 * UploadLayout - Extends ContentLayout for upload feature
 * 
 * Structure:
 * - 3 columns (desktop), 1 column (mobile)
 * - Left column: Upload Panel, Versioning Panel, System Info Panel
 * - Right column: File Preview Panel (spans 3 rows)
 */
function UploadLayout({
  children,
  className = '',
  title,
  subtitle,
  description = '',
  breadcrumbs,
  headerChildren,
  headerRight,
  showToolbar,
  toolbarContent,
  loading,
  loadingText,
  extra,
  onRefresh,
}: UploadLayoutProps) {
  return (
    <ControlMainLayout
      title={title}
      subtitle={subtitle}
      description={description}
      breadcrumbs={breadcrumbs}
      headerChildren={headerChildren}
      headerRight={headerRight}
      showToolbar={showToolbar}
      toolbarContent={toolbarContent}
      loading={loading}
      loadingText={loadingText}
      onRefresh={onRefresh}
    >
      <div
        className={
          `grid grid-cols-1 lg:grid-cols-3 gap-[10px] lg:gap-[10px] h-full items-start ` +
          // Only remove margins for immediate children to keep inner centering (mx-auto) working
          `[&>*]:m-0 ` +
          className
        }
      >
        {children}
      </div>
      {extra}
    </ControlMainLayout>
  )
}

export default UploadLayout
