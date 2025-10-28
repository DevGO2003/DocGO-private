import React, { useState, useEffect } from 'react'

interface ImagePreviewProps {
  file: File
}

export default function ImagePreview({ file }: ImagePreviewProps) {
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
    <div className="w-full h-full flex flex-col bg-white min-h-0">
      <div className="flex-1 min-h-0 overflow-auto bg-gray-100 flex items-center justify-center p-4">
        {url ? (
          <img
            src={url}
            alt={file.name}
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <div className="text-center">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-500 text-sm">Đang tải hình ảnh...</p>
          </div>
        )}
      </div>
    </div>
  )
}
