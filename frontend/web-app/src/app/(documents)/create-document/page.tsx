'use client'

import React, { useState } from 'react'
import { DashboardLayout } from '@/components/layout'
import { TitlePanel } from '@/components/ui'
import ProgressBar from '@/components/ProgressBar'
import FileListModal from '@/components/FileListModal'
import { ArrowUpTrayIcon, DocumentTextIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline'
import { fileStorageAPI } from '@/lib/api'
import toast from 'react-hot-toast'

export default function CreateDocumentPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileUploading, setFileUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [showFileList, setShowFileList] = useState(false)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setUploadSuccess(false)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Vui lòng chọn file để tải lên')
      return
    }

    try {
      setFileUploading(true)
      setUploadProgress(0)
      
      const res = await fileStorageAPI.uploadFile(selectedFile, undefined, undefined, (progress) => {
        setUploadProgress(progress)
      })
      
      const body = res.data

      if (body && (body.statusCode === 200 || body.statusCode === 201)) {
        toast.success('Tải lên file thành công!')
        setSelectedFile(null)
        setUploadProgress(0)
        setUploadSuccess(true)
      } else {
        toast.error(body?.description || 'Tải lên thất bại')
      }
    } catch (error: any) {
      console.error('File Upload Error:', error)
      const msg = error?.response?.data?.description || error?.message || 'Lỗi tải lên file'
      toast.error(msg)
    } finally {
      setFileUploading(false)
    }
  }

  return (
    <DashboardLayout>
      <TitlePanel 
        title="Tạo tài liệu mới" 
        description="Upload và quản lý tài liệu với AI processing và progress tracking" 
      />
      
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <ArrowUpTrayIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Upload Tài liệu</h2>
                <p className="text-sm text-gray-600">Tải lên file để xử lý và phân tích</p>
              </div>
            </div>
            
            {/* File Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn file để upload
              </label>
              <input
                type="file"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
              />
            </div>

            {/* Progress Bar */}
            {fileUploading && (
              <div className="mb-6">
                <ProgressBar 
                  progress={uploadProgress} 
                  color="emerald" 
                  size="md"
                  className="mb-2"
                />
                <p className="text-sm text-gray-600 text-center">
                  Đang tải lên... {uploadProgress}%
                </p>
              </div>
            )}

            {/* Upload Button */}
            <button
              onClick={handleUpload}
              disabled={!selectedFile || fileUploading}
              className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-teal-700 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {fileUploading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                  Đang tải lên... {uploadProgress}%
                </>
              ) : (
                <>
                  <ArrowUpTrayIcon className="w-5 h-5 mr-2" />
                  Tải lên file
                </>
              )}
            </button>

            {/* Success Actions */}
            {uploadSuccess && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center mb-3">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <h3 className="text-sm font-semibold text-green-800">Upload thành công!</h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setShowFileList(true)}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <DocumentTextIcon className="w-4 h-4 mr-2" />
                    Xem danh sách files
                  </button>
                  <button
                    onClick={() => {
                      setUploadSuccess(false)
                      setSelectedFile(null)
                    }}
                    className="inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <DocumentDuplicateIcon className="w-4 h-4 mr-2" />
                    Upload file khác
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Features Section */}
          <div className="space-y-6">
            {/* AI Processing Features */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tính năng AI Processing</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Phân loại tự động</h4>
                    <p className="text-xs text-gray-600">AI tự động nhận diện loại tài liệu</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Trích xuất nội dung</h4>
                    <p className="text-xs text-gray-600">OCR và AI extract text từ tài liệu</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Tóm tắt thông minh</h4>
                    <p className="text-xs text-gray-600">AI tạo tóm tắt nội dung chính</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Supported Formats */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Định dạng hỗ trợ</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>PDF</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Word (.doc, .docx)</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                  <span>Text (.txt)</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Images (.jpg, .png)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* File List Modal */}
      <FileListModal
        isOpen={showFileList}
        onClose={() => setShowFileList(false)}
        onFileSelect={(file) => {
          console.log('Selected file:', file)
          toast.success(`Đã chọn file: ${file.filename}`)
        }}
      />
    </DashboardLayout>
  )
}