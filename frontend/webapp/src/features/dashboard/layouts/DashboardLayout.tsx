import React from 'react'

interface DashboardLayoutProps {
  children: React.ReactNode
  className?: string
}

function DashboardLayout({ children, className = '' }: DashboardLayoutProps) {
  return (
    <div
      className={
        `w-full h-full p-6 ` +
        // Align immediate children without extra margins for consistency
        `[&>*]:m-0 ` +
        className
      }
    >
      <div className="max-w-7xl mx-auto relative">
        {children}
      </div>
    </div>
  )
}

export default DashboardLayout


