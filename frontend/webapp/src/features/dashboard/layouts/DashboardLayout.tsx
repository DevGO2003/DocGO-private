import React from 'react'

interface DashboardLayoutProps {
  children: React.ReactNode
  className?: string
}

function DashboardLayout({ children }: DashboardLayoutProps) {
  return <>{children}</>
}

export default DashboardLayout


