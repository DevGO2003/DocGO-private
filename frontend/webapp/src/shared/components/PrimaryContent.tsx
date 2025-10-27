import React from 'react'

interface PrimaryContentProps {
  children: React.ReactNode
  className?: string
}

function PrimaryContent({ children, className = '' }: PrimaryContentProps) {
  return (
    <div className={`min-h-[260px] bg-gray-50 rounded-2xl border border-gray-200 shadow-sm p-6 ${className}`}>
      {children}
    </div>
  )
}

export default PrimaryContent
