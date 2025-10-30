'use client'

import React, { useEffect, useState } from 'react'
import { PreviewProps } from '@/lib/preview/types'

export default function PdfPreview({ file }: PreviewProps) {
  const [pdfUrl, setPdfUrl] = useState<string>('')

  useEffect(() => {
    const url = URL.createObjectURL(file)
    setPdfUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  if (!pdfUrl) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Đang tải PDF…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="bg-gray-800 text-white px-4 py-2 text-sm border-b border-gray-700">
        <span className="font-mono truncate">{file.name}</span>
      </div>
      <div className="flex-1 bg-gray-100">
        <iframe
          src={pdfUrl}
          title={file.name}
          className="w-full h-full"
        />
      </div>
      <div className="bg-gray-50 border-t border-gray-200 px-4 py-2 text-xs text-gray-500">
        <span>PDF Viewer (native)</span>
      </div>
    </div>
  )
}
