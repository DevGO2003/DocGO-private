'use client'

import React, { useState } from 'react'
import { PreviewProps } from '@/lib/preview/types'

export default function AudioPreview({ file, onError }: PreviewProps) {
  const [audioUrl, setAudioUrl] = useState<string>('')
  
  React.useEffect(() => {
    const url = URL.createObjectURL(file)
    setAudioUrl(url)
    
    return () => {
      URL.revokeObjectURL(url)
    }
  }, [file])
  
  const handleAudioError = () => {
    onError?.(new Error(`Failed to load audio: ${file.name}`))
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
      
      {/* Audio Content */}
      <div className="flex-1 overflow-auto bg-gray-100 flex flex-col items-center justify-center p-8">
        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
          <svg className="w-12 h-12 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.816L4.617 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.617l3.766-3.816A1 1 0 019.383 3.076zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
          </svg>
        </div>
        <audio
          src={audioUrl}
          controls
          className="w-full max-w-md"
          onError={handleAudioError}
        >
          Trình duyệt của bạn không hỗ trợ audio tag.
        </audio>
        <p className="text-sm text-gray-600 mt-4">{file.name}</p>
      </div>
      
      {/* Footer */}
      <div className="bg-gray-50 border-t border-gray-200 px-4 py-2 text-xs text-gray-500">
        <span>Audio Player</span>
      </div>
    </div>
  )
}
