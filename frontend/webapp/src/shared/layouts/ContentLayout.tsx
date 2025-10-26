import React from 'react'
import { HeaderPanel, PrimaryContent } from '@shared/components'

interface ContentLayoutProps {
  title: string
  subtitle?: string
  breadcrumbs?: Array<{
    label: string
    href?: string
    current?: boolean
  }>
  right?: React.ReactNode
  children?: React.ReactNode
  headerChildren?: React.ReactNode
  className?: string
}

export function ContentLayout({
  title,
  subtitle,
  breadcrumbs,
  right,
  children,
  headerChildren,
  className = ''
}: ContentLayoutProps) {
  return (
    <div className="space-y-6">
      <HeaderPanel
        title={title}
        subtitle={subtitle}
        breadcrumbs={breadcrumbs}
        right={right}
      >
        {headerChildren}
      </HeaderPanel>

      <PrimaryContent className={className}>
        {children}
      </PrimaryContent>
    </div>
  )
}

export default ContentLayout
