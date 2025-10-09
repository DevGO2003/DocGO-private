'use client'

import React from 'react'
import Link from 'next/link'

export interface HeaderPanelProps {
  title: React.ReactNode
  description?: React.ReactNode
  icon?: string
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'info'
  actionButton?: React.ReactNode
  className?: string
  maxHeights?: { desktop?: number; tablet?: number; mobile?: number }
  compact?: boolean
  // Density: control global typography and spacing scale
  density?: 'compact' | 'condensed' | 'cozy'
  // New props
  breadcrumbs?: { label: string; href?: string; current?: boolean }[]
  right?: React.ReactNode
  children?: React.ReactNode
  maxHeight?: number
  // Wrap controls: allow children to wrap with tight gaps
  wrapControls?: boolean
}

const variantStyles = {
  primary: {
    container: 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100',
    title: 'text-blue-900',
    description: 'text-blue-700'
  },
  secondary: {
    container: 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-100',
    title: 'text-gray-900',
    description: 'text-gray-700'
  },
  success: {
    container: 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-100',
    title: 'text-green-900',
    description: 'text-green-700'
  },
  warning: {
    container: 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-100',
    title: 'text-orange-900',
    description: 'text-orange-700'
  },
  info: {
    container: 'bg-gradient-to-r from-purple-50 to-violet-50 border-purple-100',
    title: 'text-purple-900',
    description: 'text-purple-700'
  }
}

const defaultIcons = {
  primary: '📊',
  secondary: '📄',
  success: '✅',
  warning: '⚠️',
  info: 'ℹ️'
}

export default function HeaderPanel({
  title,
  description,
  icon,
  variant,
  actionButton,
  className = '',
  maxHeights,
  compact = false,
  density = 'compact',
  breadcrumbs,
  right,
  children,
  maxHeight,
  wrapControls = false
}: HeaderPanelProps) {
  const styles = variant ? variantStyles[variant] : {
    container: 'bg-white border-gray-200',
    title: 'text-gray-900',
    description: 'text-gray-600'
  }
  const displayIcon = icon || (variant ? defaultIcons[variant] : '')

  // Defaults per requirement: desktop 300, tablet 240, mobile 200
  const base = maxHeight ?? undefined
  const mhDesktop = base ?? (maxHeights?.desktop ?? 300)
  const mhTablet = base ? Math.max(220, Math.min(base, 280)) : (maxHeights?.tablet ?? 240)
  const mhMobile = base ? Math.max(180, Math.min(base, 220)) : (maxHeights?.mobile ?? 200)

  // Density scales
  const isCompact = density === 'compact'
  const isCondensed = density === 'condensed'
  const isCozy = density === 'cozy'

  const paddingClass = isCompact || isCondensed ? 'p-2 sm:p-3 md:p-4 lg:p-5' : 'p-4 sm:p-5 md:p-6 lg:p-6'
  const titleClass = isCompact
    ? 'text-xs sm:text-sm'
    : isCondensed
      ? 'text-sm sm:text-base'
      : 'text-2xl'
  const descClass = isCompact ? 'text-[10px] sm:text-[11px]' : isCondensed ? 'text-xs' : 'text-sm'
  const breadcrumbsText = isCompact ? 'text-[9px] sm:text-[10px]' : isCondensed ? 'text-xs' : 'text-sm'
  const childrenScaleClass = isCompact || isCondensed
    ? '[&_input]:text-[10px] [&_select]:text-[10px] [&_button]:text-[10px]'
    : ''
  const childrenWrapClass = wrapControls ? 'flex flex-wrap gap-x-2 gap-y-2 items-center' : ''

  return (
    <div
      className={`rounded-2xl border shadow-sm ring-1 ring-black/[0.03] ${styles.container} ${className}`}
      style={{
        // Mobile first
        maxHeight: mhMobile,
        overflow: 'hidden'
      }}
    >
      <div className={`${paddingClass}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Breadcrumbs */}
            {Array.isArray(breadcrumbs) && breadcrumbs.length > 0 && (
              <nav aria-label="Breadcrumb" className={`mb-1 ${breadcrumbsText} text-gray-500`}>
                <ol className="flex items-center gap-2 flex-wrap">
                  {breadcrumbs.map((bc, idx) => (
                    <li key={idx} className="inline-flex items-center gap-2">
                      {bc.href && !bc.current ? (
                        <Link href={bc.href} className="hover:text-gray-700 underline-offset-2 hover:underline">
                          {bc.label}
                        </Link>
                      ) : (
                        <span aria-current={bc.current ? 'page' : undefined} className={bc.current ? 'text-gray-700 font-medium' : ''}>{bc.label}</span>
                      )}
                      {idx < breadcrumbs.length - 1 && <span>›</span>}
                    </li>
                  ))}
                </ol>
              </nav>
            )}

            <h1 className={`font-semibold tracking-tight ${titleClass} mb-1 ${styles.title}`}>
              {displayIcon && <span className="align-middle mr-2">{displayIcon}</span>}
              <span className="align-middle truncate block">{title}</span>
            </h1>
            {description ? (
              <div className={`${descClass} leading-relaxed ${styles.description}`}>
                {description}
              </div>
            ) : null}
          </div>

          <div className="ml-4 flex-shrink-0 flex items-center gap-2">
            {right}
            {actionButton}
          </div>
        </div>

        {/* Children slot for page controls */}
        {children ? (
          <div className={`${'mt-2'} ${childrenScaleClass} ${childrenWrapClass}`}>
            {/* When wrapControls enabled, we still render children directly; parent container manages wrapping */}
            {children}
          </div>
        ) : null}
      </div>

      <style jsx>{`
        @media (min-width: 768px) {
          div[class*='rounded-2xl'] { max-height: ${mhTablet}px; }
        }
        @media (min-width: 1280px) {
          div[class*='rounded-2xl'] { max-height: ${mhDesktop}px; }
        }
      `}</style>
    </div>
  )
}


