'use client'

import React, { useState, useRef } from 'react'
import { DashboardLayout } from '@/components/layout'
import { TitlePanel } from '@/components/ui'
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
  const ocrFileInputRef = useRef<HTMLInputElement>(null)

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
      
      if (apiKey) {
        formData.append('api_key', apiKey)
      }

      // Add versioning data if enabled
      if (createFromOldVersion && baseContractId) {
        formData.append('base_contract_id', baseContractId)
        if (newVersionName) {
          formData.append('new_version_name', newVersionName)
        }
      }

      const response = await automationAPI.extractText(selectedFile, apiKey)
      
      if (response.data.statusCode === 200) {
        setExtractedText(response.data.data?.extractedText || 'Không có văn bản được trích xuất')
        setIsOcrModalOpen(true)
        toast.success('Trích xuất văn bản thành công!')
      } else {
        throw new Error(response.data.shortMessage || 'Có lỗi xảy ra khi xử lý file')
      }
    } catch (error) {
      console.error('OCR Error:', error)
      toast.error('Có lỗi xảy ra khi trích xuất văn bản')
    } finally {
      setOcrLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        <TitlePanel 
          title="Upload file OCR hợp đồng"
          description="Sử dụng AI để trích xuất nội dung từ tài liệu hợp đồng một cách chính xác"
        />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Tải lên tệp hợp đồng để trích xuất văn bản</h3>
                <p className="text-gray-600 text-lg mb-4">Sử dụng AI để trích xuất nội dung từ tài liệu hợp đồng một cách chính xác</p>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 max-w-4xl mx-auto">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <h4 className="text-sm font-semibold text-gray-900 mb-1">Công nghệ AI OCR tiên tiến</h4>
                      <p className="text-sm text-gray-600 mb-2">Hệ thống sử dụng AI để nhận diện và trích xuất văn bản từ các file PDF, DOCX, TXT với độ chính xác cao, hỗ trợ tiếng Việt và tiếng Anh.</p>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">AI chính xác</span>
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full">Hỗ trợ đa ngôn ngữ</span>
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full">Xử lý nhanh</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Versioning panel */}
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-4 max-w-4xl mx-auto">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Tạo phiên bản từ hợp đồng cũ</h3>
                    <p className="text-sm text-gray-600 mt-1">Chọn hợp đồng đã có để tạo phiên bản mới (ví dụ: v2, v3).</p>
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
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium text-gray-700">ID hợp đồng gốc</label>
                      <input
                        type="text"
                        value={baseContractId}
                        onChange={(e) => setBaseContractId(e.target.value)}
                        placeholder="VD: 1024"
                        className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500">Nhập ID của hợp đồng cần tạo phiên bản mới.</p>
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium text-gray-700">Tên phiên bản mới (tùy chọn)</label>
                      <input
                        type="text"
                        value={newVersionName}
                        onChange={(e) => setNewVersionName(e.target.value)}
                        placeholder="VD: v2 hoặc 2.0"
                        className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500">Để trống để hệ thống tự đánh số tiếp theo.</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="max-w-4xl mx-auto">
                {/* Upload Zone */}
                <div className="space-y-6">
                  <div 
                    className={`w-full border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
                      ocrDragActive
                        ? 'border-blue-500 bg-blue-50 scale-[1.02]'
                        : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                    }`}
                    onDragEnter={handleOcrDrag}
                    onDragLeave={handleOcrDrag}
                    onDragOver={handleOcrDrag}
                    onDrop={handleOcrDrop}
                  >
                    <input
                      ref={ocrFileInputRef}
                      type="file"
                      accept=".pdf,.docx,.txt"
                      onChange={handleOcrFileSelect}
                      className="hidden"
                    />
                    
                    {selectedFile ? (
                      // File Selected State
                      <div className="flex flex-col items-center space-y-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                          {getFileIcon(selectedFile.name)}
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-lg font-semibold text-gray-900">{selectedFile.name}</h4>
                          <p className="text-sm text-gray-600">
                            Kích thước: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          <p className="text-xs text-gray-500">
                            Loại: {selectedFile.type || 'Không xác định'}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => setSelectedFile(null)}
                            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            Chọn file khác
                          </button>
                          <button
                            onClick={() => ocrFileInputRef.current?.click()}
                            className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-colors"
                          >
                            Thay đổi
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Empty State
                      <div className="flex flex-col items-center space-y-6">
                        <div className="relative">
                          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                            <DocumentTextIcon className="w-10 h-10 text-blue-600" />
                          </div>
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="text-xl font-semibold text-gray-900">Chọn file hợp đồng để OCR</h4>
                          <p className="text-gray-600">Hỗ trợ định dạng: PDF, DOCX, TXT</p>
                          <button
                            onClick={() => ocrFileInputRef.current?.click()}
                            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all duration-200 shadow-lg hover:shadow-xl"
                          >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Chọn file từ máy tính
                          </button>
                        </div>
                        
                        <div className="text-center space-y-3">
                          <div>
                            <p className="text-sm text-gray-500 mb-2">Hỗ trợ định dạng:</p>
                            <div className="flex flex-wrap justify-center gap-2">
                              {['PDF', 'DOCX', 'TXT'].map((type) => (
                                <span
                                  key={type}
                                  className="px-3 py-1 bg-blue-100 text-blue-600 text-xs rounded-full"
                                >
                                  {type}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 max-w-md mx-auto">
                            <div className="flex items-center space-x-2 text-xs text-blue-700">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="font-medium">Lưu ý:</span>
                            </div>
                            <p className="text-xs text-blue-600 mt-1">
                              File PDF chất lượng cao sẽ cho kết quả OCR tốt nhất. Tránh file scan bị mờ hoặc nghiêng.
                            </p>
                          </div>
                          
                          <p className="text-xs text-gray-400">
                            Kích thước tối đa: 50MB
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Extract Button */}
                  {selectedFile && (
                    <div className="text-center">
                      <button
                        onClick={handleOcrExtract}
                        disabled={!selectedFile || ocrLoading}
                        className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                      >
                        {ocrLoading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Đang upload...
                          </>
                        ) : (
                          <>
                            <ArrowUpTrayIcon className="w-5 h-5 mr-2" />
                            Xác nhận tải hợp đồng
                          </>
                        )}
                      </button>
                      <p className="text-sm text-gray-500 mt-3">
                        Upload file của bạn lên Automation Service để xử lý
                      </p>
                      
                      {/* Additional Features Info */}
                      <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                          <div className="flex flex-col items-center space-y-2">
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                              </svg>
                            </div>
                            <h5 className="text-sm font-semibold text-gray-900">AI thông minh</h5>
                            <p className="text-xs text-gray-600">Nhận diện văn bản chính xác 99%</p>
                          </div>

                          <div className="flex flex-col items-center space-y-2">
                            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                            </div>
                            <h5 className="text-sm font-semibold text-gray-900">Đa ngôn ngữ</h5>
                            <p className="text-xs text-gray-600">Hỗ trợ tiếng Việt và tiếng Anh</p>
                          </div>
                          
                          <div className="flex flex-col items-center space-y-2">
                            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                            </div>
                            <h5 className="text-sm font-semibold text-gray-900">Xử lý nhanh</h5>
                            <p className="text-xs text-gray-600">Trích xuất trong vài giây</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* OCR Results Modal */}
        {isOcrModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <DocumentTextIcon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Kết quả trích xuất văn bản</h3>
                      <p className="text-sm text-gray-600">Nội dung đã được AI xử lý và trích xuất</p>
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
                <div className="bg-gray-50 rounded-xl p-4 max-h-96 overflow-y-auto">
                  <pre className="text-sm text-gray-800 whitespace-pre-wrap">{extractedText}</pre>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setIsOcrModalOpen(false)}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Đóng
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(extractedText)
                      toast.success('Đã sao chép văn bản!')
                    }}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Sao chép
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
