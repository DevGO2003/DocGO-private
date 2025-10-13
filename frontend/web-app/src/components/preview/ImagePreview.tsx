'use client'

import React, { useState } from 'react'
import { PreviewProps } from '@/lib/preview/types'

export default function ImagePreview({ file, onError }: PreviewProps) {
  const [imageUrl, setImageUrl] = useState<string>('')
  const [loading, setLoading] = useState(true)
  
  React.useEffect(() => {
    const url = URL.createObjectURL(file)
    setImageUrl(url)
    setLoading(false)
    
    return () => {
      URL.revokeObjectURL(url)
    }
  }, [file])
  
  const handleImageError = () => {
    onError?.(new Error(`Failed to load image: ${file.name}`))
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Đang tải hình ảnh...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 text-white px-4 py-2 text-sm border-b border-gray-700">
        <div className="flex items-center justify-between">
          <span className="font-mono">{file.name}</span>
          <span className="text-gray-300">
            {(file.size / 1024 / 1024).toFixed(2)} MB
          </span>
        </div>
      </div>
      
      {/* Image Content */}
      <div className="flex-1 overflow-auto bg-gray-100 flex items-center justify-center p-4">
        <img
          src={imageUrl}
          alt={file.name}
          className="max-w-full max-h-full object-contain shadow-lg rounded"
          onError={handleImageError}
          onLoad={() => setLoading(false)}
        />
      </div>
    </div>
  )
}
