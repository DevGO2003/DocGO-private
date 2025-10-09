'use client'

import React from 'react'

export interface HeaderPanelProps {
  title: React.ReactNode
  description?: React.ReactNode
  icon?: string
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'info'
  actionButton?: React.ReactNode
  className?: string
  maxHeights?: { desktop?: number; tablet?: number; mobile?: number }
  compact?: boolean
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
  variant = 'primary',
  actionButton,
  className = '',
  maxHeights,
  compact = false
}: HeaderPanelProps) {
  const styles = variantStyles[variant]
  const displayIcon = icon || defaultIcons[variant]

  // Defaults per requirement: desktop 300, tablet 240, mobile 200
  const mhDesktop = maxHeights?.desktop ?? 300
  const mhTablet = maxHeights?.tablet ?? 240
  const mhMobile = maxHeights?.mobile ?? 200

  return (
    <div
      className={`rounded-2xl border shadow-sm ring-1 ring-black/[0.03] ${styles.container} ${className}`}
      style={{
        // Mobile first
        maxHeight: mhMobile,
        overflow: 'hidden'
      }}
    >
      <div className="p-4 sm:p-5 md:p-6 lg:p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h1 className={`font-bold tracking-tight ${compact ? 'text-xl' : 'text-2xl'} mb-1 ${styles.title}`}>
              <span className="align-middle mr-2">{displayIcon}</span>
              <span className="align-middle truncate block">{title}</span>
            </h1>
            {description ? (
              <p className={`text-sm leading-relaxed line-clamp-2 ${styles.description}`}>
                {description}
              </p>
            ) : null}
          </div>
          {actionButton && (
            <div className="ml-4 flex-shrink-0">
              {actionButton}
            </div>
          )}
        </div>
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


