import React, { useEffect, useRef } from 'react'
import { createRoughCanvas, drawRoughRect } from '@shared/lib/roughUtils'

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
  maxHeightMobile = 200
}: HeaderPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mhDesktop = maxHeightDesktop
  const mhTablet = maxHeightTablet
  const mhMobile = maxHeightMobile

  const drawCanvas = () => {
    if (!containerRef.current || !canvasRef.current) return
    const el = containerRef.current
    const canvas = canvasRef.current
    const width = el.offsetWidth
    const height = el.offsetHeight
    if (width === 0 || height === 0) return
    canvas.width = width
    canvas.height = height
    const rc = createRoughCanvas(canvas)
    drawRoughRect(rc, 8, 8, width - 16, height - 16, {
      stroke: '#94a3b8',
      strokeWidth: 2,
      roughness: 1.5,
    })
  }

  useEffect(() => {
    drawCanvas()
    const t = setTimeout(drawCanvas, 100)
    return () => clearTimeout(t)
  }, [title, subtitle, className])

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-purple-50 shadow-sm ${className}`}
      style={{
        maxHeight: '300px',
        overflow: 'hidden'
      }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ width: '100%', height: '100%' }}
      />
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-indigo-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-purple-200/30 blur-3xl" />

      <div className="relative z-10 px-6 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Left section */}
          <div className="flex-1">
            {/* Breadcrumbs */}
            {breadcrumbs && breadcrumbs.length > 0 && (
              <nav className="flex mb-2" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-1 text-sm">
                  {breadcrumbs.map((breadcrumb, index) => (
                    <li key={index} className="flex items-center">
                      {index > 0 && (
                        <svg className="mx-1" style={ color: '#9ca3af' } fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                      {breadcrumb.current ? (
                        <span className="font-medium" style={ color: '#6b7280' }>{breadcrumb.label}</span>
                      ) : breadcrumb.href ? (
                        <a href={breadcrumb.href} className="hover: font-medium" style={ color: '#4f46e5', color: '#4338ca' }>
                          {breadcrumb.label}
                        </a>
                      ) : (
                        <span className="font-medium" style={ color: '#111827' }>{breadcrumb.label}</span>
                      )}
                    </li>
                  ))}
                </ol>
              </nav>
            )}

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 mb-1">{title}</h1>
            
            {/* Subtitle */}
            {subtitle && (
              <p className="text-sm mb-2" style={ color: '#4b5563' }>{subtitle}</p>
            )}

            {/* Children content */}
            {children && (
              <div className="mt-2">
                {children}
              </div>
            )}
          </div>

          {/* Right section */}
          {right && (
            <div className="flex gap-2">
              {right}
            </div>
          )}
        </div>
      </div>

      <style>{`
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
