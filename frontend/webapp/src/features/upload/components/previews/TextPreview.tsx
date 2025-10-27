import React, { useState, useEffect } from 'react'

interface TextPreviewProps {
  file: File
}

export default function TextPreview({ file }: TextPreviewProps) {
  const [content, setContent] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      setContent(text.substring(0, 50000))
      setLoading(false)
    }
    reader.onerror = () => {
      setContent('Không thể đọc file')
      setLoading(false)
    }
    reader.readAsText(file)
  }, [file])

  return (
    <div className="w-full h-full flex flex-col bg-white">
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <p className="text-xs text-gray-600">
          {file.name} • {(file.size / 1024).toFixed(2)} KB
        </p>
      </div>
      <div className="flex-1 overflow-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
              <p className="text-gray-500 text-sm">Đang tải nội dung...</p>
            </div>
          </div>
        ) : (
          <pre className="text-xs text-gray-700 whitespace-pre-wrap break-words font-mono bg-gray-50 p-3 rounded">
            {content}
          </pre>
        )}
      </div>
    </div>
  )
}
