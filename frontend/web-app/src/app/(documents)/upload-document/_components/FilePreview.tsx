'use client'

import React from 'react'
import { DocumentTextIcon } from '@heroicons/react/24/outline'

interface FilePreviewProps {
  selectedFile: File | null
}

export default function FilePreview({ selectedFile }: FilePreviewProps) {
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
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">Xem trước nội dung file</h3>
        <p className="text-sm text-gray-600">{selectedFile ? selectedFile.name : 'Chọn file để xem trước'}</p>
      </div>
      <div className="p-6">
        <div className="h-96 border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
          {selectedFile ? (
            selectedFile.type === 'application/pdf' ? (
              // PDF Preview với iframe
              <iframe
                src={`${URL.createObjectURL(selectedFile)}#toolbar=0&navpanes=0&scrollbar=0&statusbar=0&messages=0&scrollbar=0&resize=0&view=FitH`}
                className="w-full h-full"
                title="PDF Preview"
                style={{ border: 'none' }}
              />
            ) : selectedFile.type === 'text/plain' ? (
              // TXT Preview với textarea
              <div className="h-full p-4">
                <textarea
                  className="w-full h-full resize-none border-none bg-transparent text-sm font-mono text-gray-800 focus:outline-none"
                  readOnly
                  value="Đang tải nội dung file..."
                  ref={(textarea) => {
                    if (textarea && selectedFile) {
                      const reader = new FileReader()
                      reader.onload = (e) => {
                        textarea.value = e.target?.result as string || ''
                      }
                      reader.readAsText(selectedFile)
                    }
                  }}
                />
              </div>
            ) : selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ? (
              // DOCX Preview - sử dụng Google Docs Viewer
              <iframe
                src={`https://docs.google.com/gview?url=${encodeURIComponent(URL.createObjectURL(selectedFile))}&embedded=true`}
                className="w-full h-full"
                title="DOCX Preview"
                style={{ border: 'none' }}
              />
            ) : selectedFile.type.startsWith('image/') ? (
              // Image Preview
              <img
                src={URL.createObjectURL(selectedFile)}
                alt="File preview"
                className="w-full h-full object-contain"
              />
            ) : (
              // Fallback cho các file type khác
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  {getFileIcon(selectedFile.name)}
                  <p className="text-sm text-gray-600 mb-1 mt-2">Không thể xem trước loại file này</p>
                  <p className="text-xs text-gray-500">File sẽ được xử lý sau khi upload</p>
                  <p className="text-xs text-gray-400 mt-1">Loại: {selectedFile.type || 'Không xác định'}</p>
                </div>
              </div>
            )
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-1">Chưa có file được chọn</p>
                <p className="text-xs text-gray-500">Chọn file để xem trước nội dung</p>
              </div>
            </div>
          )}
        </div>
        {selectedFile && (
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <span>Kích thước: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
            <span>Loại: {selectedFile.type || 'Không xác định'}</span>
          </div>
        )}
      </div>
    </div>
  )
}
