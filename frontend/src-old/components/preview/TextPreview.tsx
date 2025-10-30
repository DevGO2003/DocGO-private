'use client'

import React, { useState, useEffect } from 'react'
import { PreviewProps } from '@/lib/preview/types'

export default function TextPreview({ file, onError }: PreviewProps) {
  const [textContent, setTextContent] = useState<string>('')
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const result = e.target?.result as string
        setTextContent(result)
        setLoading(false)
      } catch (error) {
        onError?.(error as Error)
        setLoading(false)
      }
    }
    
    reader.onerror = () => {
      onError?.(new Error(`Failed to read file: ${file.name}`))
      setLoading(false)
    }
    
    reader.readAsText(file)
  }, [file, onError])
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Đang tải nội dung...</p>
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
            {textContent.length} ký tự
          </span>
        </div>
      </div>
      
      {/* Text Content */}
      <div className="flex-1 overflow-auto bg-white">
        <pre className="p-4 text-sm font-mono text-gray-900 whitespace-pre-wrap break-words">
          {textContent}
        </pre>
      </div>
      
      {/* Footer */}
      <div className="bg-gray-50 border-t border-gray-200 px-4 py-2 text-xs text-gray-500">
        <span>Text Viewer</span>
      </div>
    </div>
  )
}
