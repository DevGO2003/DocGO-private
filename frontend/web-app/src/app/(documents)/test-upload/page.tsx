'use client'

import React, { useState } from 'react'
import { DashboardLayout } from '@/components/layout'
import { TitlePanel } from '@/components/ui'
import ProgressBar from '@/components/ProgressBar'
import FileListModal from '@/components/FileListModal'
import { ArrowUpTrayIcon } from '@heroicons/react/24/outline'
import { fileStorageAPI } from '@/lib/api'
import toast from 'react-hot-toast'

export default function TestUploadPage() {
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
      <TitlePanel title="Test Upload với Progress Bar" description="Test upload file với progress bar và file list modal" />
      
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload File Test</h2>
          
          {/* File Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn file để upload
            </label>
            <input
              type="file"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
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
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Xem danh sách files
                </button>
                <button
                  onClick={() => {
                    setUploadSuccess(false)
                    setSelectedFile(null)
                  }}
                  className="inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Upload file khác
                </button>
              </div>
            </div>
          )}
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
