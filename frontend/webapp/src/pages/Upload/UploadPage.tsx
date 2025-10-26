import React, { useState } from 'react'
import { ContentLayout } from '@shared/layouts'

export function UploadPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.type === 'application/pdf' || 
          file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
          file.type === 'text/plain') {
        setUploadedFile(file)
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.type === 'application/pdf' || 
          file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
          file.type === 'text/plain') {
        setUploadedFile(file)
      }
    }
  }

  return (
    <ContentLayout
      title="Upload File"
      subtitle="Tải lên tài liệu của bạn"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Upload', current: true }
      ]}
    >
      <div className="max-w-2xl mx-auto">
        {/* Upload Area */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
            dragActive
              ? 'border-indigo-600 bg-indigo-50'
              : 'border-gray-300 bg-gray-50 hover:border-gray-400'
          }`}
        >
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20a4 4 0 004 4h24a4 4 0 004-4V20"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M32 4v12m0 0l-4-4m4 4l4-4"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          
          <p className="mt-4 text-gray-600">
            Kéo thả file hoặc{' '}
            <label className="text-indigo-600 hover:text-indigo-700 cursor-pointer font-medium">
              chọn file
              <input
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.docx,.txt"
              />
            </label>
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Hỗ trợ: PDF, DOCX, TXT (tối đa 50MB)
          </p>
        </div>

        {/* File Info */}
        {uploadedFile && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium">
              ✓ File đã chọn: {uploadedFile.name}
            </p>
            <p className="text-green-700 text-sm mt-1">
              Kích thước: {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        )}

        {/* Upload Button */}
        <div className="mt-6 flex gap-3">
          <button
            disabled={!uploadedFile}
            className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Upload
          </button>
          <button
            onClick={() => setUploadedFile(null)}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Hủy
          </button>
        </div>
      </div>
    </ContentLayout>
  )
}

export default UploadPage
