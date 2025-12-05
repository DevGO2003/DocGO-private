import React, { useState, useCallback } from 'react'

interface UploadPanelProps {
  selectedFile: File | null
  setSelectedFile: (file: File | null) => void
  ocrFileInputRef: React.RefObject<HTMLInputElement>
  handleOcrFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleOcrExtract: () => void
  ocrLoading: boolean
}

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

export default function UploadPanel({
  selectedFile,
  setSelectedFile,
  ocrFileInputRef,
  handleOcrFileSelect,
  handleOcrExtract,
  ocrLoading
}: UploadPanelProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      setSelectedFile(file)
    }
  }, [setSelectedFile])

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    const iconClass = "w-8 h-8"
    switch (extension) {
      case 'pdf':
        return (
          <svg className={iconClass} style={{ color: '#dc2626' }} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        )
      case 'doc':
      case 'docx':
        return (
          <svg className={iconClass} style={{ color: '#2563eb' }} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        )
      case 'xls':
      case 'xlsx':
        return (
          <svg className={iconClass} style={{ color: '#16a34a' }} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        )
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
        return (
          <svg className={iconClass} style={{ color: '#9333ea' }} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
        )
      default:
        return (
          <svg className={iconClass} style={{ color: '#6b7280' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
    }
  }

  return (
    <div className="rounded-2xl border overflow-hidden flex flex-col bg-white" style={{ borderColor: '#e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
      {/* Header */}
      <div className="px-5 py-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50" style={{ borderColor: '#e5e7eb' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Tải tệp lên</h3>
            <p className="text-sm text-gray-500">Chọn hoặc kéo thả file để xử lý</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <input
          ref={ocrFileInputRef}
          type="file"
          onChange={handleOcrFileSelect}
          className="hidden"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif"
        />

        {selectedFile ? (
          /* File Selected State */
          <div className="space-y-4">
            <div 
              className="relative p-4 rounded-xl border-2 border-dashed transition-all"
              style={{ borderColor: '#3b82f6', backgroundColor: '#eff6ff' }}
            >
              <div className="flex items-start gap-4">
                {/* File Icon */}
                <div className="w-14 h-14 rounded-xl bg-white shadow-md flex items-center justify-center flex-shrink-0">
                  {getFileIcon(selectedFile.name)}
                </div>
                
                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-semibold text-gray-900 truncate" title={selectedFile.name}>
                    {selectedFile.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      {selectedFile.name.split('.').pop()?.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Xóa
                    </button>
                    <button
                      onClick={() => ocrFileInputRef.current?.click()}
                      className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg border border-blue-500 text-blue-600 bg-white hover:bg-blue-50 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Đổi file
                    </button>
                  </div>
                </div>

                {/* Success Check */}
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Upload Button */}
            <button
              onClick={handleOcrExtract}
              disabled={!selectedFile || ocrLoading}
              className="w-full inline-flex items-center justify-center px-5 py-3.5 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {ocrLoading ? (
                <>
                  <svg className="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Tải lên và xử lý
                </>
              )}
            </button>
          </div>
        ) : (
          /* Empty State - Drag & Drop Zone */
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => ocrFileInputRef.current?.click()}
            className={`
              relative cursor-pointer rounded-xl border-2 border-dashed p-8
              transition-all duration-200 ease-in-out
              ${isDragging 
                ? 'border-blue-500 bg-blue-50 scale-[1.02]' 
                : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/50'
              }
            `}
          >
            <div className="flex flex-col items-center text-center">
              {/* Upload Icon */}
              <div className={`
                w-16 h-16 rounded-2xl flex items-center justify-center mb-4
                transition-all duration-200
                ${isDragging 
                  ? 'bg-blue-500 shadow-lg scale-110' 
                  : 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md'
                }
              `}>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>

              {/* Text */}
              <h4 className="text-lg font-semibold text-gray-900 mb-1">
                {isDragging ? 'Thả file vào đây!' : 'Kéo thả file vào đây'}
              </h4>
              <p className="text-sm text-gray-500 mb-4">
                hoặc click để chọn file từ máy tính
              </p>

              {/* Button */}
              <button
                type="button"
                className="inline-flex items-center px-5 py-2.5 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Chọn file
              </button>

              {/* Supported formats */}
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {['PDF', 'DOCX', 'XLSX', 'PNG', 'JPG'].map((format) => (
                  <span key={format} className="px-2 py-1 text-xs font-medium rounded-md bg-white text-gray-600 border border-gray-200">
                    {format}
                  </span>
                ))}
              </div>
              <p className="mt-2 text-xs text-gray-400">Tối đa 50MB</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
