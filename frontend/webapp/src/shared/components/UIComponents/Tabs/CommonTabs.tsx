import React, { useEffect, useRef } from 'react'
import anime from 'animejs'
import { cn } from '@shared/lib/utils'
import { createRoughCanvas, drawRoughRect } from '@shared/lib/roughUtils'
import { tabsStyles } from './CommonTabs.styles'
import { CommonFont } from '../Font/CommonFont'
import type { TabsProps, TabListProps, CommonTabProps } from './CommonTabs.types'

export const Tabs: React.FC<TabsProps> = ({ children, className }) => {
  return <CommonFont className={cn(tabsStyles.container, className)}>{children}</CommonFont>
}

export const TabList: React.FC<TabListProps> = ({ children, className }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

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
    drawRoughRect(rc, 4, 4, width - 8, height - 8, {
      stroke: '#94a3b8',
      strokeWidth: 2,
      roughness: 1.2,
    })
  }

  useEffect(() => {
    drawCanvas()
    const t = setTimeout(drawCanvas, 120)
    const onResize = () => drawCanvas()
    window.addEventListener('resize', onResize)
    return () => {
      clearTimeout(t)
      window.removeEventListener('resize', onResize)
    }
  }, [className, children])

  return (
    <CommonFont ref={containerRef as any} className={cn(tabsStyles.list, className)}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ width: '100%', height: '100%' }}
      />
      {children}
    </CommonFont>
  )
}

export const CommonTab: React.FC<CommonTabProps> = ({ value, activeValue, onSelect, children, disabled, title }) => {
  const isActive = value === activeValue
  const ref = useRef<HTMLButtonElement>(null)

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => !disabled && onSelect(value)}
      disabled={disabled}
      title={title}
      className={cn(
        tabsStyles.tabBase,
        disabled 
          ? tabsStyles.tabDisabled 
          : (isActive ? tabsStyles.tabActive : tabsStyles.tabInactive),
      )}
    >
      {children}
    </button>
  )
}
