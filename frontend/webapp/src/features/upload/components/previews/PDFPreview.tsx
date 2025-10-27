import React, { useState, useEffect } from 'react'

interface PDFPreviewProps {
  file: File
}

export default function PDFPreview({ file }: PDFPreviewProps) {
  const [url, setUrl] = useState<string>('')

  useEffect(() => {
    const reader = new FileReader()
    reader.onload = (e) => {
      setUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)
    return () => {
      if (url) URL.revokeObjectURL(url)
    }
  }, [file])

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-lg overflow-hidden">
      <div className="flex-1 overflow-auto bg-gray-100">
        {url ? (
          <iframe
            src={url}
            className="w-full h-full border-0"
            title="PDF Preview"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500 text-sm">Đang tải PDF...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
