import React from 'react'

interface UploadLayoutProps {
  children: React.ReactNode
  className?: string
}

function UploadLayout({ children, className = '' }: UploadLayoutProps) {
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 w-full auto-rows-max ${className}`}>
      {children}
    </div>
  )
}

export default UploadLayout
