import React, { useEffect, useRef } from 'react'
import anime from 'animejs'

interface TabsProps {
  children: React.ReactNode
  className?: string
}

interface TabListProps {
  children: React.ReactNode
  className?: string
}

interface TabProps {
  value: string
  activeValue: string
  onSelect: (val: string) => void
  children: React.ReactNode
  disabled?: boolean
}

export const Tabs: React.FC<TabsProps> = ({ children, className }) => {
  return (
    <div className={className}>{children}</div>
  )
}

export const TabList: React.FC<TabListProps> = ({ children, className }) => {
  return (
    <div className={`inline-flex items-center rounded-lg border border-gray-200 overflow-hidden bg-white ${className || ''}`}>
      {children}
    </div>
  )
}

export const Tab: React.FC<TabProps> = ({ value, activeValue, onSelect, children, disabled }) => {
  const isActive = value === activeValue
  const ref = useRef<HTMLButtonElement>(null)
  const underlineRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const btn = ref.current
    const underline = underlineRef.current
    if (!btn || !underline) return
    if (isActive) {
      underline.style.opacity = '0'
      underline.style.transform = 'scaleX(0.6)'
      anime({ targets: underline, opacity: 1, scaleX: 1, duration: 250, easing: 'easeOutQuad' })
    } else {
      underline.style.opacity = '0'
      underline.style.transform = 'scaleX(0.6)'
    }
  }, [isActive])

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => !disabled && onSelect(value)}
      disabled={disabled}
      className={
        `relative px-3 py-1.5 text-sm transition-colors ${
          isActive ? 'bg-gray-100 text-gray-900 font-semibold' : 'bg-white text-gray-700 hover:bg-gray-50'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`
      }
    >
      {children}
      <div
        ref={underlineRef}
        style={{
          position: 'absolute',
          left: 8,
          right: 8,
          bottom: 4,
          height: 2,
          background: '#111827',
          borderRadius: 9999,
          transformOrigin: 'left center'
        }}
      />
    </button>
  )
}
