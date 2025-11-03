import React from 'react'

interface ExcelPreviewProps {
  file: File
}

export default function ExcelPreview({ file }: ExcelPreviewProps) {
  return (
    <div className="w-full h-full flex flex-col rounded-lg overflow-hidden" style={{ backgroundColor: '#ffffff' }} >
      <div className="px-4 py-3 border-b" style={{ borderColor: '#e5e7eb', backgroundColor: '#f9fafb' }} >
        <p className="text-xs" style={{ color: '#4b5563' }} >
          {file.name} • {(file.size / 1024).toFixed(2)} KB
        </p>
      </div>
      <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="h-16 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: '#dcfce7' }} >
            <svg className="h-8" style={{ color: '#16a34a' } fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 6a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zm10-1a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
            </svg>
          </div>
          <h4 className="text-sm font-semibold mb-1" style={{ color: '#111827' }} >File Excel</h4>
          <p className="text-xs" style={{ color: '#4b5563' }} >
            Preview Excel sẽ hiển thị khi file được upload
          </p>
          <p className="text-xs mt-2" style={{ color: '#6b7280' }} >
            Hỗ trợ: .xlsx, .xls, .csv
          </p>
        </div>
      </div>
    </div>
  )
}
