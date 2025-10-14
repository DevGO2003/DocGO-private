'use client'

import React from 'react'
import { DocumentTextIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline'

interface UploadPanelProps {
  selectedFile: File | null
  setSelectedFile: (file: File | null) => void
  ocrFileInputRef: React.RefObject<HTMLInputElement>
  handleOcrFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleOcrExtract: () => void
  ocrLoading: boolean
}

export default function UploadPanel({
  selectedFile,
  setSelectedFile,
  ocrFileInputRef,
  handleOcrFileSelect,
  handleOcrExtract,
  ocrLoading
}: UploadPanelProps) {
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    switch (extension) {
      case 'pdf':
        return (
          <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        )
      case 'docx':
        return (
          <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        )
      default:
        return <DocumentTextIcon className="w-4 h-4 text-gray-600" />
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm h-full flex flex-col">
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-base font-semibold text-gray-900">
          Upload file <span className="text-gray-500 font-normal">• Chọn file để xử lý OCR và phân loại</span>
        </h3>
      </div>
      <div className="p-4 flex-1">
        <input
          ref={ocrFileInputRef}
          type="file"
          onChange={handleOcrFileSelect}
          className="hidden"
        />

        {selectedFile ? (
          // File Selected State
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                {getFileIcon(selectedFile.name)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-gray-900 truncate">{selectedFile.name}</h4>
                <p className="text-xs text-gray-600">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {selectedFile.type || 'Không xác định'}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSelectedFile(null)}
                  className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Chọn file khác
                </button>
                <button
                  onClick={() => ocrFileInputRef.current?.click()}
                  className="px-3 py-1.5 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  Thay đổi
                </button>
              </div>
            </div>

            {/* Upload Button */}
            <button
              onClick={handleOcrExtract}
              disabled={!selectedFile || ocrLoading}
              className="w-full inline-flex items-center justify-center px-4 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md transition-all duration-200"
            >
              {ocrLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang upload...
                </>
              ) : (
                <>
                  <ArrowUpTrayIcon className="w-4 h-4 mr-2" />
                  Xác nhận tải lên tài liệu
                </>
              )}
            </button>
          </div>
        ) : (
          // Empty State
          <div className="text-center py-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <DocumentTextIcon className="w-8 h-8 text-blue-600" />
            </div>
            <h4 className="text-base font-semibold text-gray-900 mb-2">Kéo thả file vào đây để upload</h4>
            <p className="text-sm text-gray-600 mb-3">Hỗ trợ mọi loại file • Tối đa 50MB</p>
            <button
              onClick={() => ocrFileInputRef.current?.click()}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Chọn file
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
