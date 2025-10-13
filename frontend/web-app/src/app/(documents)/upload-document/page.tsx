'use client'

import React, { useState, useRef, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout'
import { HeaderPanel } from '@/components/ui'
import { DocumentTextIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import { automationAPI } from '@/lib/api'
import toast from 'react-hot-toast'

export default function UploadDocumentPage() {
  const router = useRouter()
  
  // OCR Tab states
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [apiKey, setApiKey] = useState('')
  const [ocrLoading, setOcrLoading] = useState(false)
  const [extractedText, setExtractedText] = useState('')
  const [isOcrModalOpen, setIsOcrModalOpen] = useState(false)
  
  // Versioning from existing contract (OCR tab)
  const [createFromOldVersion, setCreateFromOldVersion] = useState(false)
  const [baseContractId, setBaseContractId] = useState<string>('')
  const [newVersionName, setNewVersionName] = useState<string>('')
  
  const [ocrDragActive, setOcrDragActive] = useState(false)
  const [globalDragActive, setGlobalDragActive] = useState(false)
  const ocrFileInputRef = useRef<HTMLInputElement>(null)

  // Global drag and drop handlers
  useEffect(() => {
    const handleGlobalDragEnter = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (e.dataTransfer?.types.includes('Files')) {
        setGlobalDragActive(true)
      }
    }

    const handleGlobalDragLeave = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      // Only hide if leaving the document entirely
      if (!e.relatedTarget || (e.relatedTarget as Element).nodeName === 'HTML') {
        setGlobalDragActive(false)
      }
    }

    const handleGlobalDragOver = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
    }

    const handleGlobalDrop = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setGlobalDragActive(false)
      
      if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0]
        if (file.type === 'application/pdf' || 
            file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
            file.type === 'text/plain' ||
            file.name.endsWith('.pdf') || 
            file.name.endsWith('.docx') || 
            file.name.endsWith('.txt')) {
          setSelectedFile(file)
        } else {
          toast.error('Chỉ hỗ trợ file PDF, DOCX, TXT')
        }
      }
    }

    // Add event listeners to document
    document.addEventListener('dragenter', handleGlobalDragEnter)
    document.addEventListener('dragleave', handleGlobalDragLeave)
    document.addEventListener('dragover', handleGlobalDragOver)
    document.addEventListener('drop', handleGlobalDrop)

    // Cleanup
    return () => {
      document.removeEventListener('dragenter', handleGlobalDragEnter)
      document.removeEventListener('dragleave', handleGlobalDragLeave)
      document.removeEventListener('dragover', handleGlobalDragOver)
      document.removeEventListener('drop', handleGlobalDrop)
    }
  }, [])

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    switch (extension) {
      case 'pdf':
        return (
          <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        )
      case 'docx':
        return (
          <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        )
      case 'txt':
        return (
          <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        )
      default:
        return (
          <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        )
    }
  }

  const handleOcrDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setOcrDragActive(true)
    } else if (e.type === 'dragleave') {
      setOcrDragActive(false)
    }
  }

  const handleOcrDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setOcrDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.type === 'application/pdf' || 
          file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
          file.type === 'text/plain' ||
          file.name.endsWith('.pdf') || 
          file.name.endsWith('.docx') || 
          file.name.endsWith('.txt')) {
        setSelectedFile(file)
      } else {
        toast.error('Chỉ hỗ trợ file PDF, DOCX, TXT')
      }
    }
  }

  const handleOcrFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        toast.error('File quá lớn. Kích thước tối đa: 50MB')
        return
      }
      setSelectedFile(file)
    }
  }

  const handleOcrExtract = async () => {
    if (!selectedFile) {
      toast.error('Vui lòng chọn file trước')
      return
    }

    setOcrLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      
      // Add metadata if needed
      if (createFromOldVersion && baseContractId) {
        formData.append('metadata', JSON.stringify({
          baseContractId,
          newVersionName: newVersionName || undefined
        }))
      }

      // Call API Gateway upload endpoint
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'X-User-ID': 'system' // TODO: Get from auth context
        }
      })

      const result = await response.json()
      
      if (response.ok && result.statusCode === 201) {
        const uploadResponse = result.data
        
        toast.success('File đã được upload thành công và đang được xử lý!')
        
        // Show success modal with options
        setIsOcrModalOpen(true)
        setExtractedText(`File đã được upload thành công!
        
File ID: ${uploadResponse.fileId}
Document ID: ${uploadResponse.fileId}
Filename: ${uploadResponse.filename}
Size: ${(uploadResponse.fileSize / 1024 / 1024).toFixed(2)} MB
Status: ${uploadResponse.status}

File đang được xử lý OCR và phân loại tự động. Bạn có thể:
1. Xem danh sách tài liệu để theo dõi tiến trình
2. Mở tài liệu vừa upload để xem kết quả`)
      } else {
        throw new Error(result.description || 'Có lỗi xảy ra khi upload file')
      }
    } catch (error) {
      console.error('Upload Error:', error)
      toast.error('Có lỗi xảy ra khi upload file')
    } finally {
      setOcrLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="py-4 px-4 sm:px-6 lg:px-8 space-y-6">
          <HeaderPanel 
            title="Upload tài liệu"
            subtitle="Sử dụng AI để trích xuất nội dung từ tài liệu hợp đồng một cách chính xác"
            breadcrumbs={[{ label: 'Tài liệu', href: '/documents' }, { label: 'Upload', current: true }]}
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Left Column - Upload Zone */}
            <div className="lg:col-span-2 space-y-6">
              {/* 1. Tạo phiên bản */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Tạo phiên bản từ hợp đồng cũ</h4>
                      <p className="text-xs text-gray-600 mt-1">Chọn hợp đồng đã có để tạo phiên bản mới (ví dụ: v2, v3).</p>
                    </div>
                    <label className="inline-flex items-center cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={createFromOldVersion} 
                        onChange={(e) => setCreateFromOldVersion(e.target.checked)} 
                        aria-checked={createFromOldVersion} 
                        aria-label="Tạo phiên bản từ hợp đồng cũ" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-indigo-600 transition-colors relative">
                        <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 shadow peer-checked:translate-x-[20px]" />
                      </div>
                      <span className="ml-3 text-sm text-gray-700">{createFromOldVersion ? 'Bật' : 'Tắt'}</span>
                    </label>
                  </div>

                  {createFromOldVersion && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-gray-700">ID hợp đồng gốc</label>
                        <input
                          type="text"
                          value={baseContractId}
                          onChange={(e) => setBaseContractId(e.target.value)}
                          placeholder="VD: 1024"
                          className="mt-1 w-full border border-gray-200 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">Nhập ID của hợp đồng cần tạo phiên bản mới.</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700">Tên phiên bản mới (tùy chọn)</label>
                        <input
                          type="text"
                          value={newVersionName}
                          onChange={(e) => setNewVersionName(e.target.value)}
                          placeholder="VD: v2 hoặc 2.0"
                          className="mt-1 w-full border border-gray-200 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">Để trống để hệ thống tự đánh số tiếp theo.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Khung upload file */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="p-3 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-900">Upload file</h3>
                  <p className="text-xs text-gray-600">Chọn file để xử lý OCR và phân loại</p>
                </div>
                <div className="p-4">
                  <input
                    ref={ocrFileInputRef}
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={handleOcrFileSelect}
                    className="hidden"
                  />
                  
                  {selectedFile ? (
                    // File Selected State
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-md border border-blue-200">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          {getFileIcon(selectedFile.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-semibold text-gray-900 truncate">{selectedFile.name}</h4>
                          <p className="text-xs text-gray-600">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {selectedFile.type || 'Không xác định'}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => setSelectedFile(null)}
                            className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                          >
                            Khác
                          </button>
                          <button
                            onClick={() => ocrFileInputRef.current?.click()}
                            className="px-2 py-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
                          >
                            Đổi
                          </button>
                        </div>
                      </div>
                      
                      {/* Upload Button */}
                      <button
                        onClick={handleOcrExtract}
                        disabled={!selectedFile || ocrLoading}
                        className="w-full inline-flex items-center justify-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        {ocrLoading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Đang upload...
                          </>
                        ) : (
                          <>
                            <ArrowUpTrayIcon className="w-3 h-3 mr-2" />
                            Xác nhận tải hợp đồng
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    // Empty State
                    <div className="text-center py-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <DocumentTextIcon className="w-6 h-6 text-blue-600" />
                      </div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-1">Kéo thả file vào đây để upload</h4>
                      <p className="text-xs text-gray-600 mb-3">PDF, DOCX, TXT • Tối đa 50MB</p>
                      <button
                        onClick={() => ocrFileInputRef.current?.click()}
                        className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                      >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Chọn file
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Thông tin (1 panel duy nhất) */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="p-3 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-900">Thông tin hệ thống</h3>
                  <p className="text-xs text-gray-600">Công nghệ AI và tính năng</p>
                </div>
                <div className="p-4 space-y-3">
                  {/* AI Technology */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-lg p-3">
                    <div className="flex items-start space-x-2">
                      <div className="w-6 h-6 bg-blue-500 rounded-md flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <h4 className="text-xs font-semibold text-gray-900 mb-1">AI OCR tiên tiến</h4>
                        <p className="text-xs text-gray-600 mb-2">Hệ thống sử dụng AI để nhận diện và trích xuất văn bản từ các file PDF, DOCX, TXT với độ chính xác cao, hỗ trợ tiếng Việt và tiếng Anh.</p>
                        <div className="flex flex-wrap gap-1">
                          <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">AI chính xác</span>
                          <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs">Đa ngôn ngữ</span>
                          <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded text-xs">Xử lý nhanh</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <div>
                        <h5 className="text-xs font-semibold text-gray-900">AI thông minh</h5>
                        <p className="text-xs text-gray-600">Nhận diện văn bản chính xác 99%</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div>
                        <h5 className="text-xs font-semibold text-gray-900">Đa ngôn ngữ</h5>
                        <p className="text-xs text-gray-600">Hỗ trợ tiếng Việt và tiếng Anh</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div>
                        <h5 className="text-sm font-semibold text-gray-900">Xử lý nhanh</h5>
                        <p className="text-xs text-gray-600">Tự động trong vài phút</p>
                      </div>
                    </div>
                  </div>

                  {/* Tip */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-start space-x-2">
                      <span className="text-green-600 text-sm">💡</span>
                      <p className="text-sm text-green-800">
                        <span className="font-medium">Mẹo:</span> Bạn có thể kéo thả file ở bất kỳ đâu trên màn hình để upload nhanh
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - File Preview */}
            <div className="lg:col-span-3 space-y-6">
              {selectedFile ? (
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className="p-3 border-b border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-900">Xem trước nội dung file</h3>
                    <p className="text-xs text-gray-600">{selectedFile.name}</p>
                  </div>
                  <div className="p-4">
                    <div className="h-80 border border-gray-200 rounded-md overflow-hidden">
                      {selectedFile.type === 'application/pdf' ? (
                        <iframe
                          src={URL.createObjectURL(selectedFile)}
                          className="w-full h-full"
                          title="PDF Preview"
                        />
                      ) : selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ? (
                        <div className="flex items-center justify-center h-full bg-gray-50">
                          <div className="text-center">
                            <svg className="w-8 h-8 text-blue-500 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                            </svg>
                            <p className="text-xs text-gray-600">Không thể xem trước file DOCX</p>
                            <p className="text-xs text-gray-500">File sẽ được xử lý OCR sau khi upload</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full bg-gray-50">
                          <div className="text-center">
                            <svg className="w-12 h-12 text-gray-500 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                            </svg>
                            <p className="text-sm text-gray-600">Không thể xem trước file này</p>
                            <p className="text-xs text-gray-500">Loại: {selectedFile.type || 'Không xác định'}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="mt-3 text-xs text-gray-500">
                      <p>Kích thước: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      <p>Loại: {selectedFile.type || 'Không xác định'}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className="p-3 border-b border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-900">Xem trước nội dung file</h3>
                    <p className="text-xs text-gray-600">Chọn file để xem trước</p>
                  </div>
                  <div className="p-4">
                    <div className="h-80 border border-gray-200 rounded-md flex items-center justify-center bg-gray-50">
                      <div className="text-center">
                        <DocumentTextIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Chưa có file được chọn</p>
                        <p className="text-xs text-gray-500">Chọn file để xem trước nội dung</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Global Drag Overlay */}
        {globalDragActive && (
          <div className="fixed inset-0 bg-blue-500 bg-opacity-20 border-4 border-dashed border-blue-500 z-50 flex items-center justify-center">
            <div className="bg-white rounded-xl p-8 shadow-2xl border-4 border-blue-500">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DocumentTextIcon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Thả file vào đây để upload</h3>
                <p className="text-sm text-gray-600">PDF, DOCX, TXT • Tối đa 50MB</p>
              </div>
            </div>
          </div>
        )}

        {/* Upload Success Modal */}
        {isOcrModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
              <div className="bg-gradient-to-r from-green-50 to-blue-50 px-6 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Upload thành công!</h3>
                      <p className="text-sm text-gray-600">File đang được xử lý OCR và phân loại tự động</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOcrModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <pre className="text-sm text-gray-800 whitespace-pre-wrap">{extractedText}</pre>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-semibold text-blue-800">Tiếp theo</span>
                    </div>
                    <p className="text-sm text-blue-700">
                      File đang được xử lý OCR và phân loại tự động. Quá trình này có thể mất vài phút.
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => {
                        setIsOcrModalOpen(false)
                        router.push('/documents')
                      }}
                      className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Xem danh sách tài liệu
                    </button>
                    
                    <button
                      onClick={() => {
                        setIsOcrModalOpen(false)
                        // TODO: Navigate to specific document when we have the document ID
                        router.push('/documents')
                      }}
                      className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Mở tài liệu vừa tải
                    </button>
                  </div>
                  
                  <button
                    onClick={() => setIsOcrModalOpen(false)}
                    className="w-full px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
