'use client'

import React, { useState } from 'react'
import { PreviewProps } from '@/lib/preview/types'

export default function VideoPreview({ file, onError }: PreviewProps) {
  const [videoUrl, setVideoUrl] = useState<string>('')
  
  React.useEffect(() => {
    const url = URL.createObjectURL(file)
    setVideoUrl(url)
    
    return () => {
      URL.revokeObjectURL(url)
    }
  }, [file])
  
  const handleVideoError = () => {
    onError?.(new Error(`Failed to load video: ${file.name}`))
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
      
      {/* Video Content */}
      <div className="flex-1 overflow-auto bg-gray-100 flex items-center justify-center p-4">
        <video
          src={videoUrl}
          className="max-w-full max-h-full object-contain"
          controls
          onError={handleVideoError}
        >
          Trình duyệt của bạn không hỗ trợ video tag.
        </video>
      </div>
      
      {/* Footer */}
      <div className="bg-gray-50 border-t border-gray-200 px-4 py-2 text-xs text-gray-500">
        <span>Video Player</span>
      </div>
    </div>
  )
}
