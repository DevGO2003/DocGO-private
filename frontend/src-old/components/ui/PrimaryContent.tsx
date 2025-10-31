'use client'

import React from 'react'

interface PrimaryContentProps {
  children: React.ReactNode
  className?: string
}

function PrimaryContent({ children, className = '' }: PrimaryContentProps) {
  return (
    <div className={`min-h-[260px] ${className}`}>
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        {children}
      </div>
    </div>
  )
}

export default PrimaryContent