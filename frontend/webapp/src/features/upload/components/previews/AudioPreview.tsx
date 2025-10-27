import React, { useState, useEffect } from 'react'

interface AudioPreviewProps {
  file: File
}

export default function AudioPreview({ file }: AudioPreviewProps) {
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
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <p className="text-xs text-gray-600">
          {file.name} • {(file.size / 1024).toFixed(2)} KB
        </p>
      </div>
      <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
        <div className="w-full max-w-sm">
          <div className="text-center mb-4">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 3a1 1 0 011 1v5h2V4a1 1 0 112 0v5h2V4a1 1 0 112 0v7a3 3 0 11-6 0V4a1 1 0 01-1-1z" />
              </svg>
            </div>
            <h4 className="text-sm font-semibold text-gray-900">Audio File</h4>
            <p className="text-xs text-gray-600 mt-1">{file.type}</p>
          </div>
          {url && (
            <audio
              controls
              className="w-full"
              src={url}
            />
          )}
        </div>
      </div>
    </div>
  )
}
