'use client'

import React from 'react'

interface HeaderPanelProps {
  title: string
  subtitle?: string
  breadcrumbs?: Array<{
    label: string
    href?: string
    current?: boolean
  }>
  children?: React.ReactNode
  right?: React.ReactNode
  className?: string
  maxHeightDesktop?: number
  maxHeightTablet?: number
  maxHeightMobile?: number
  gradientFrom?: string
  gradientTo?: string
}

function HeaderPanel({
  title,
  subtitle,
  breadcrumbs,
  children,
  right,
  className = '',
  maxHeightDesktop = 300,
  maxHeightTablet = 240,
  maxHeightMobile = 200,
  gradientFrom = 'indigo-500',
  gradientTo = 'purple-600'
}: HeaderPanelProps) {
  const mhDesktop = maxHeightDesktop
  const mhTablet = maxHeightTablet
  const mhMobile = maxHeightMobile

  return (
    <div
      className={`relative sticky top-0 z-50 bg-white rounded-2xl border border-gray-200 shadow-sm ring-1 ring-gray-100 overflow-hidden ${className}`}
      style={{
        maxHeight: '300px'
      }}
    >
      {/* Gradient background overlay */}
      <div className={`absolute inset-0 bg-gradient-to-r from-${gradientFrom} to-${gradientTo} opacity-5`} />
      {/* Gradient bottom border */}
      <div className={`absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-${gradientFrom} to-${gradientTo}`} />
      <div className="relative px-4 py-[5px]">
        <div className="flex items-start justify-between gap-4">
          {/* Left section - natural width */}
          <div className="shrink-0">
            {/* Breadcrumbs */}
            {breadcrumbs && breadcrumbs.length > 0 && (
              <nav className="flex mb-1" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-1 text-sm">
                  {breadcrumbs.map((breadcrumb, index) => (
                    <li key={index} className="flex items-center">
                      {index > 0 && (
                        <svg className="w-4 h-4 text-gray-400 mx-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                      {breadcrumb.current ? (
                        <span className="text-gray-500 font-medium">{breadcrumb.label}</span>
                      ) : breadcrumb.href ? (
                        <a href={breadcrumb.href} className="text-indigo-600 hover:text-indigo-700 font-medium">
                          {breadcrumb.label}
                        </a>
                      ) : (
                        <span className="text-gray-900 font-medium">{breadcrumb.label}</span>
                      )}
                    </li>
                  ))}
                </ol>
              </nav>
            )}

            {/* Title */}
            <h1 className="inline-block w-auto text-xl font-bold text-gray-900 mb-1">{title}</h1>
            
            {/* Subtitle */}
            {subtitle && (
              <p className="text-gray-600 text-sm mb-2">{subtitle}</p>
            )}

            {/* Children content */}
            {children && (
              <div className="mt-1">
                {children}
              </div>
            )}
          </div>

          {/* Right section - takes remaining space */}
          {right && (
            <div className="flex-1 min-w-0">
              {right}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 900px) {
          div[class*='rounded-2xl'] { 
            max-height: none; 
          }
          div[class*='grid'] {
            grid-template-columns: 1fr !important;
          }
          div[class*='justify-end'] {
            justify-content: flex-start !important;
          }
        }
        
        /* Responsive max-height */
        @media (min-width: 1280px) {
          div[class*='rounded-2xl'] {
            max-height: ${mhDesktop}px !important;
          }
        }
        
        @media (min-width: 768px) and (max-width: 1279px) {
          div[class*='rounded-2xl'] {
            max-height: ${mhTablet}px !important;
          }
        }
        
        @media (max-width: 767px) {
          div[class*='rounded-2xl'] {
            max-height: ${mhMobile}px !important;
          }
        }
      `}</style>
    </div>
  )
}

export default HeaderPanel
