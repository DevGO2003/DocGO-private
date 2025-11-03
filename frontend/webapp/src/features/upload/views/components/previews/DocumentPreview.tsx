import React, { useState, useEffect } from 'react'

interface DocumentPreviewProps {
  file: File
}

export default function DocumentPreview({ file }: DocumentPreviewProps) {
  const [content, setContent] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      setContent(text.substring(0, 5000))
      setLoading(false)
    }
    reader.onerror = () => {
      setContent('Không thể đọc file')
      setLoading(false)
    }
    reader.readAsText(file)
  }, [file])

  return (
    <div className="w-full h-full flex flex-col rounded-lg overflow-hidden" style={ backgroundColor: '#ffffff' }>
      <div className="px-4 py-3 border-b" style={ borderColor: '#e5e7eb' } style={ backgroundColor: '#f9fafb' }>
        <p className="text-xs" style={ color: '#4b5563' }>
          {file.name} • {(file.size / 1024).toFixed(2)} KB
        </p>
      </div>
      <div className="flex-1 overflow-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 mb-2" style={ borderColor: '#2563eb' }></div>
              <p className="text-sm" style={ color: '#6b7280' }>Đang tải nội dung...</p>
            </div>
          </div>
        ) : (
          <pre className="text-xs" style={ color: '#374151' }>
            {content}
          </pre>
        )}
      </div>
    </div>
  )
}
