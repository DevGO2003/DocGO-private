import React from 'react'

interface RepositoryLayoutProps {
  children: React.ReactNode
  className?: string
}

/**
 * RepositoryLayout - Wrapper layout cho trang repositories
 *
 * - Giữ cấu trúc đơn giản giống UploadLayout (transparent container)
 * - Reset margin cho phần tử con trực tiếp để tránh lệch layout
 * - Không can thiệp vào padding nội bộ của components
 */
function RepositoryLayout({ children, className = '' }: RepositoryLayoutProps) {
  return (
    <div
      className={
        `h-full w-full ` +
        // Reset margin cho immediate children, giữ nguyên centering bên trong
        `[&>*]:m-0 ` +
        className
      }
    >
      {children}
    </div>
  )
}

export default RepositoryLayout
