'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface GlobalDragDropProps {
  children: React.ReactNode
}

export default function GlobalDragDrop({ children }: GlobalDragDropProps) {
  const router = useRouter()

  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
    }

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
    }

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
    }

    const handleDrop = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()

      const files = e.dataTransfer?.files
      if (files && files.length > 0) {
        // Hỗ trợ mọi loại file
        const file = files[0]
        
        // Chuyển đến trang upload với file đã được chọn
        router.push('/repositories/default/upload-files')
        
        // Lưu file vào sessionStorage để trang upload có thể lấy
        const reader = new FileReader()
        reader.onload = () => {
          const fileData = {
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified,
            content: reader.result
          }
          sessionStorage.setItem('droppedFile', JSON.stringify(fileData))
        }
        reader.readAsDataURL(file)
        
        toast.success(`Đã chọn file: ${file.name}. Chuyển đến trang upload...`)
      }
    }

    document.addEventListener('dragenter', handleDragEnter)
    document.addEventListener('dragleave', handleDragLeave)
    document.addEventListener('dragover', handleDragOver)
    document.addEventListener('drop', handleDrop)

    return () => {
      document.removeEventListener('dragenter', handleDragEnter)
      document.removeEventListener('dragleave', handleDragLeave)
      document.removeEventListener('dragover', handleDragOver)
      document.removeEventListener('drop', handleDrop)
    }
  }, [router])

  return <>{children}</>
}
