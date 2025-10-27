import React from 'react'

interface DefaultPreviewProps {
  file: File
}

export default function DefaultPreview({ file }: DefaultPreviewProps) {
  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase() || 'unknown'
    const iconColor = {
      zip: 'text-yellow-600',
      rar: 'text-yellow-600',
      '7z': 'text-yellow-600',
      exe: 'text-red-600',
      sh: 'text-green-600',
      json: 'text-blue-600',
      xml: 'text-blue-600',
      csv: 'text-green-600',
    }[ext] || 'text-gray-600'

    return (
      <svg className={`w-8 h-8 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  }

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <p className="text-xs text-gray-600">
          {file.name} • {(file.size / 1024).toFixed(2)} KB
        </p>
      </div>
      <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            {getFileIcon(file.name)}
          </div>
          <h4 className="text-sm font-semibold text-gray-900 mb-1">Định dạng không hỗ trợ preview</h4>
          <p className="text-xs text-gray-600">
            {file.type || 'Unknown type'}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            File sẽ được upload và xử lý trên server
          </p>
        </div>
      </div>
    </div>
  )
}
