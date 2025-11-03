import React from 'react'
import { ControlMainLayout } from '@shared/layouts'

interface DashboardLayoutProps {
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
 * DashboardLayout - Extends ControlMainLayout for dashboard feature
 *
 * Structure:
 * - Flexible container for dashboard content
 * - Supports custom grid layouts for stats and widgets
 */
function DashboardLayout({
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
}: DashboardLayoutProps) {
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

export default DashboardLayout


