import React from 'react'
import { ControlMainLayout } from '@shared/layouts'

interface RepositoryLayoutProps {
  children: React.ReactNode
  className?: string
  title?: string
  subtitle?: string
  breadcrumbs?: Array<{ label: string; href?: string; current?: boolean }>
  headerChildren?: React.ReactNode
  headerRight?: React.ReactNode
  showToolbar?: boolean
  toolbarContent?: React.ReactNode
  loading?: boolean
  loadingText?: string
  extra?: React.ReactNode
  primaryTabs?: React.ReactNode
  secondaryTabs?: React.ReactNode
  onRefresh?: () => void
}

/**
 * RepositoryLayout - Extends ControlMainLayout for repository feature
 *
 * Structure:
 * - Flexible container for repository content
 * - Supports custom layouts for repository lists, details, and files
 * - Supports primary and secondary tabs for navigation
 */
function RepositoryLayout({
  children,
  className = '',
  title,
  subtitle,
  breadcrumbs,
  headerChildren,
  headerRight,
  showToolbar,
  toolbarContent,
  loading,
  loadingText,
  extra,
  primaryTabs,
  secondaryTabs,
  onRefresh,
}: RepositoryLayoutProps) {
  return (
    <ControlMainLayout
      title={title}
      subtitle={subtitle}
      breadcrumbs={breadcrumbs}
      headerChildren={headerChildren}
      headerRight={headerRight}
      showToolbar={showToolbar}
      toolbarContent={toolbarContent}
      loading={loading}
      loadingText={loadingText}
      primaryTabs={primaryTabs}
      secondaryTabs={secondaryTabs}
      onRefresh={onRefresh}
    >
      <div className={`w-full h-full ${className}`}>
        {children}
      </div>
      {extra}
    </ControlMainLayout>
  )
}

export default RepositoryLayout
