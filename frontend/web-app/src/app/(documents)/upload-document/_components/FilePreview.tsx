'use client'

import React, { useState, useEffect } from 'react'
import { DocumentTextIcon } from '@heroicons/react/24/outline'

interface FilePreviewProps {
  selectedFile: File | null
}

export default function FilePreview({ selectedFile }: FilePreviewProps) {
  const [textContent, setTextContent] = useState<string>('')

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Load text content for text files - xử lý trực tiếp ở frontend
  useEffect(() => {
    if (selectedFile && selectedFile.type === 'text/plain') {
      const reader = new FileReader()
      reader.onload = (e) => {
        setTextContent(e.target?.result as string || '')
      }
      reader.readAsText(selectedFile)
    } else {
      setTextContent('')
    }
  }, [selectedFile])

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
          Xem trước nội dung file <span className="text-gray-500 font-normal">• {selectedFile ? `${selectedFile.name} (${formatFileSize(selectedFile.size)})` : 'Chọn file để xem trước'}</span>
        </h3>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden bg-gray-50 min-h-0">
          {selectedFile ? (
            selectedFile.type === 'application/pdf' ? (
              // PDF Preview - xử lý trực tiếp ở frontend
              <iframe
                src={`${URL.createObjectURL(selectedFile)}#toolbar=0&navpanes=0&scrollbar=0&statusbar=0&messages=0&scrollbar=0&resize=0&view=FitH`}
                className="w-full h-full"
                title="PDF Preview"
                style={{ border: 'none' }}
              />
            ) : selectedFile.type === 'text/plain' ? (
              // TXT Preview - đọc trực tiếp
              <div className="h-full p-4">
                <textarea
                  className="w-full h-full resize-none border-none bg-transparent text-sm font-mono text-gray-800 focus:outline-none"
                  readOnly
                  value={textContent || "Đang tải nội dung..."}
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
              // Image Preview - hiển thị trực tiếp
              <img
                src={URL.createObjectURL(selectedFile)}
                alt="File preview"
                className="w-full h-full object-contain"
              />
            ) : selectedFile.type.startsWith('video/') ? (
              // Video Preview - hiển thị trực tiếp
              <video
                src={URL.createObjectURL(selectedFile)}
                className="w-full h-full object-contain"
                controls
              />
            ) : selectedFile.type.startsWith('audio/') ? (
              // Audio Preview - hiển thị trực tiếp
              <div className="flex flex-col items-center justify-center h-full p-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.816L4.617 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.617l3.766-3.816A1 1 0 019.383 3.076zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                  </svg>
                </div>
                <audio
                  src={URL.createObjectURL(selectedFile)}
                  controls
                  className="w-full max-w-md"
                />
                <p className="text-sm text-gray-600 mt-2">{selectedFile.name}</p>
              </div>
            ) : (
              // Generic file preview - hiển thị thông tin file
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  {getFileIcon(selectedFile.name)}
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{selectedFile.name}</h4>
                <p className="text-sm text-gray-600 mb-2">{formatFileSize(selectedFile.size)}</p>
                <p className="text-xs text-gray-500 mb-2">Loại file: {selectedFile.type || 'Không xác định'}</p>
                <p className="text-xs text-gray-400">File sẽ được xử lý OCR và phân loại sau khi upload</p>
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
          <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
            <span>Kích thước: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
            <span>Loại: {selectedFile.type || 'Không xác định'}</span>
          </div>
        )}
      </div>
    </div>
  )
}
