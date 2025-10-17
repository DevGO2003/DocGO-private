import { ReactNode } from 'react'

interface UsersLayoutProps {
  children: ReactNode
}

export default function UsersLayout({ children }: UsersLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
}
