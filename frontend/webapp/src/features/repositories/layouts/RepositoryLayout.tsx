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
function RepositoryLayout({ children }: RepositoryLayoutProps) {
  // Trả về fragment để không tạo ra DOM node trung gian giữa ControlMainLayout và nội dung
  return <>{children}</>
}

export default RepositoryLayout
