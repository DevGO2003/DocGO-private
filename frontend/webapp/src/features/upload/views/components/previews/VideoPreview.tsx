import React, { useState, useEffect } from 'react'

interface VideoPreviewProps {
  file: File
}

export default function VideoPreview({ file }: VideoPreviewProps) {
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
    <div className="w-full h-full flex flex-col bg-black rounded-lg overflow-hidden">
      <div className="flex-1 overflow-auto flex items-center justify-center">
        {url ? (
          <video
            controls
            className="max-w-full max-h-full"
            src={url}
          />
        ) : (
          <div className="text-center">
            <svg className="h-12 mx-auto mb-2" style={ color: '#9ca3af' } fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm" style={ color: '#9ca3af' }>Đang tải video...</p>
          </div>
        )}
      </div>
    </div>
  )
}
