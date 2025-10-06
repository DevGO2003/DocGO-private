'use client'

import React, { useState, useRef } from 'react'
import { DashboardLayout } from '@/components/layout'
import { TitlePanel } from '@/components/ui'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { automationAPI } from '@/lib/apis/automation-api'
import { ArrowUpTrayIcon, DocumentIcon, XMarkIcon } from '@heroicons/react/24/outline'

export default function UploadDocumentPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // State management
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadResult, setUploadResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  // File validation
  const validateFile = (file: File): boolean => {
    const maxSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/jpeg',
      'image/png'
    ]

    if (file.size > maxSize) {
      setError('File quá lớn. Kích thước tối đa là 10MB.')
      return false
    }

    if (!allowedTypes.includes(file.type)) {
      setError('Định dạng file không được hỗ trợ. Chỉ chấp nhận PDF, DOCX, TXT, JPG, PNG.')
      return false
    }

    return true
  }

  // Handle file selection
  const handleFileSelect = (file: File) => {
    setError(null)
    setUploadResult(null)
    
    if (validateFile(file)) {
      setSelectedFile(file)
    }
  }

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  // Auto-load file from global drag & drop
  React.useEffect(() => {
    try {
      const raw = sessionStorage.getItem('docgo_global_drop_file')
      if (raw && !selectedFile) {
        const parsed = JSON.parse(raw)
        if (parsed?.data && parsed?.name) {
          const byteCharacters = atob(parsed.data)
          const byteNumbers = new Array(byteCharacters.length)
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i)
          }
          const byteArray = new Uint8Array(byteNumbers)
          const blob = new Blob([byteArray], { type: parsed.type || 'application/octet-stream' })
          const file = new File([blob], parsed.name, { type: parsed.type || 'application/octet-stream', lastModified: parsed.lastModified || Date.now() })
          handleFileSelect(file)
          // Clear after loading
          sessionStorage.removeItem('docgo_global_drop_file')
          // Optionally auto-start upload
          // void handleUpload()
        }
      }
    } catch (e) {
      console.error('Failed to read global dropped file from sessionStorage:', e)
    }
  }, [selectedFile])

  // Handle upload
  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setError(null)
    setUploadProgress(0)

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 200)

      const response = await automationAPI.uploadFile(selectedFile, {
        originalName: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type,
        uploadedAt: new Date().toISOString()
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      const bodyStatus = response.data?.statusCode
      if ((bodyStatus === 200 || bodyStatus === 201 || bodyStatus === 204) || (response.status >= 200 && response.status < 300)) {
        setUploadResult(response.data?.data ?? null)
        toast.success('Upload file thành công!')
        
        // Reset form after 3 seconds
        setTimeout(() => {
          setSelectedFile(null)
          setUploadResult(null)
          setUploadProgress(0)
        }, 3000)
      } else {
        throw new Error(response.data?.shortMessage || 'Có lỗi xảy ra khi upload file')
      }
    } catch (error: any) {
      console.error('Upload error:', error)
      setError(error.message || 'Có lỗi xảy ra khi upload file')
      toast.error('Upload file thất bại!')
    } finally {
      setIsUploading(false)
    }
  }

  // Handle remove file
  const handleRemoveFile = () => {
    setSelectedFile(null)
    setError(null)
    setUploadResult(null)
    setUploadProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        <TitlePanel 
          title="Upload Tài liệu"
          description="Kéo thả file hoặc chọn file để upload lên hệ thống"
        />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-5 lg:px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Left: Upload Area (3/5) */}
            <div className="md:col-span-3">
              <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center">
                      <ArrowUpTrayIcon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-gray-900">Upload File</h2>
                      <p className="text-xs text-gray-600">Hỗ trợ PDF, DOCX, TXT, JPG, PNG (≤ 10MB)</p>
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  {/* Drag & Drop Area */}
                  <div
                    className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                      isDragOver
                        ? 'border-blue-400 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={handleFileInputChange}
                      accept=".pdf,.docx,.txt,.jpg,.jpeg,.png"
                    />

                    {!selectedFile ? (
                      <div className="space-y-3">
                        <div className="w-14 h-14 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                          <ArrowUpTrayIcon className="w-7 h-7 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-base font-medium text-gray-900">
                            Kéo thả file vào đây hoặc{' '}
                            <span className="text-blue-600 hover:text-blue-700 cursor-pointer">chọn file</span>
                          </p>
                          <p className="text-xs text-gray-500 mt-1">Hỗ trợ PDF, DOCX, TXT, JPG, PNG (≤ 10MB)</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="w-14 h-14 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                          <DocumentIcon className="w-7 h-7 text-green-600" />
                        </div>
                        <div>
                          <p className="text-base font-medium text-gray-900 truncate">{selectedFile.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                        </div>
                        <div className="flex justify-end">
                          <button
                            onClick={handleRemoveFile}
                            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-md transition-colors"
                          >
                            <XMarkIcon className="w-4 h-4" />
                            Xóa file
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-5 flex justify-end space-x-3">
                    <button
                      onClick={() => router.back()}
                      className="px-5 py-2 border border-gray-300 rounded-md text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleUpload}
                      disabled={!selectedFile || isUploading}
                      className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      {isUploading ? (
                        <>
                          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Đang upload...
                        </>
                      ) : (
                        <>
                          <ArrowUpTrayIcon className="w-4 h-4" />
                          Upload File
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Info & Status (2/5) */}
            <div className="md:col-span-2 space-y-4">
              {/* File Info */}
              <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
                  <h3 className="text-sm font-semibold text-gray-900">Thông tin upload</h3>
                </div>
                <div className="p-4 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trạng thái:</span>
                    <span className="font-medium">{isUploading ? 'Đang upload' : (uploadResult ? 'Hoàn tất' : 'Chưa bắt đầu')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tên file:</span>
                    <span className="font-medium truncate max-w-[160px] text-right">{selectedFile ? selectedFile.name : '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Kích thước:</span>
                    <span className="font-medium">{selectedFile ? formatFileSize(selectedFile.size) : '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Loại:</span>
                    <span className="font-medium">{selectedFile ? (selectedFile.type || '—') : '-'}</span>
                  </div>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center">
                    <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center mr-3">
                      <XMarkIcon className="w-3 h-3 text-white" />
                    </div>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              )}

              {/* Progress */}
              {isUploading && (
                <div className="bg-white rounded-xl shadow border border-gray-100 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Đang upload...</span>
                    <span className="text-sm text-gray-500">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}

              {/* Result */}
              {uploadResult && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center">
                    <div className="w-7 h-7 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="text-sm">
                      <p className="font-semibold text-green-800">Upload thành công!</p>
                      <p className="text-green-700">File ID: {uploadResult.id}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Compact Instructions */}
              <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
                  <h3 className="text-sm font-semibold text-gray-900">Hướng dẫn nhanh</h3>
                </div>
                <div className="p-4 space-y-3 text-sm">
                  <div className="flex items-start space-x-2">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs font-semibold">1</span>
                    <p>Kéo thả file hoặc bấm để chọn.</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs font-semibold">2</span>
                    <p>Kiểm tra định dạng và kích thước (≤ 10MB).</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs font-semibold">3</span>
                    <p>Nhấn "Upload File" để bắt đầu tải lên.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}