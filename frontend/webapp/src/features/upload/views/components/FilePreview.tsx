import React from 'react'

interface FilePreviewProps {
  selectedFile: File | null
}

export default function FilePreview({ selectedFile }: FilePreviewProps) {
  if (!selectedFile) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm h-full flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">Chọn file để xem trước</p>
          <p className="text-sm text-gray-400 mt-1">Hỗ trợ PDF, DOCX, hình ảnh, video, audio, và nhiều định dạng khác</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm h-full flex flex-col">
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-base font-semibold text-gray-900">
          Xem trước <span className="text-gray-500 font-normal">• {selectedFile.name}</span>
        </h3>
      </div>
      <div className="flex-1 overflow-auto p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-700 font-medium">{selectedFile.name}</p>
          <p className="text-sm text-gray-500 mt-2">
            {(selectedFile.size / 1024).toFixed(2)} KB • {selectedFile.type || 'Unknown type'}
          </p>
          <p className="text-xs text-gray-400 mt-4">
            Preview sẽ hiển thị khi file được upload
          </p>
        </div>
      </div>
    </div>
  )
}
