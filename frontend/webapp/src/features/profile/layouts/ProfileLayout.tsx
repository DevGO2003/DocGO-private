import React from 'react'
import { ControlMainLayout } from '@shared/layouts'

interface ProfileLayoutProps {
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
 * ProfileLayout - Extends ControlMainLayout for profile feature
 * 
 * Structure:
 * - Flexible container for profile content
 * - Supports custom layouts for profile information and settings
 */
function ProfileLayout({
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
}: ProfileLayoutProps) {
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
      <div className={`w-full h-full ${className}`}>
        {children}
      </div>
      {extra}
    </ControlMainLayout>
  )
}

export default ProfileLayout

