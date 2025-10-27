import React, { useState, useEffect } from 'react'

interface HTMLPreviewProps {
  file: File
}

export default function HTMLPreview({ file }: HTMLPreviewProps) {
  const [htmlContent, setHtmlContent] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setHtmlContent(content)
      setLoading(false)
    }
    reader.onerror = () => {
      setHtmlContent('Không thể đọc file HTML')
      setLoading(false)
    }
    reader.readAsText(file)
  }, [file])

  return (
    <div className="w-full h-full flex flex-col bg-white overflow-hidden">
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
              <p className="text-gray-500 text-sm">Đang tải HTML...</p>
            </div>
          </div>
        ) : (
          <iframe
            srcDoc={htmlContent}
            className="w-full h-full border-0"
            title="HTML Preview"
            sandbox="allow-same-origin allow-scripts"
          />
        )}
      </div>
    </div>
  )
}
