'use client'

import React from 'react'

interface PrimaryContentProps {
  children: React.ReactNode
  className?: string
}

export default function PrimaryContent({ children, className = '' }: PrimaryContentProps) {
  return (
    <div className={`mt-4 min-h-[260px] ${className}`}>
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        {children}
      </div>
    </div>
  )
}
