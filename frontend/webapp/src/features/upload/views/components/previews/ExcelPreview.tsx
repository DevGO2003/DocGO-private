import React from 'react'

interface ExcelPreviewProps {
  file: File
}

export default function ExcelPreview({ file }: ExcelPreviewProps) {
  return (
    <div className="w-full h-full flex flex-col bg-white rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <p className="text-xs text-gray-600">
          {file.name} • {(file.size / 1024).toFixed(2)} KB
        </p>
      </div>
      <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 6a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zm10-1a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
            </svg>
          </div>
          <h4 className="text-sm font-semibold text-gray-900 mb-1">File Excel</h4>
          <p className="text-xs text-gray-600">
            Preview Excel sẽ hiển thị khi file được upload
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Hỗ trợ: .xlsx, .xls, .csv
          </p>
        </div>
      </div>
    </div>
  )
}
