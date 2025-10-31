import React from 'react'

interface GradientHeaderProps {
  title: string
  subtitle?: string
  gradientFrom?: string
  gradientTo?: string
  className?: string
}

export function GradientHeader({ 
  title, 
  subtitle, 
  gradientFrom = 'blue-600', 
  gradientTo = 'purple-600',
  className = ''
}: GradientHeaderProps) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border bg-white shadow-sm ring-1 ring-gray-100 ${className}`}>
      <div className={`absolute inset-0 bg-gradient-to-r from-${gradientFrom} to-${gradientTo} opacity-5`} />
      <div className="relative px-6 py-6">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="mt-1 text-gray-600">{subtitle}</p>}
      </div>
      <div className={`absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-${gradientFrom} to-${gradientTo}`} />
    </div>
  )
}
