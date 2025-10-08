'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { automationAPI, VersionConflictCheck } from '@/lib/apis/automation-api'
import toast from 'react-hot-toast'
import { ArrowUpTrayIcon, XMarkIcon, DocumentIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

interface GlobalDragDropProps {
  children: React.ReactNode
}

export default function GlobalDragDrop({ children }: GlobalDragDropProps) {
  const router = useRouter()
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [versionConflict, setVersionConflict] = useState<VersionConflictCheck | null>(null)
  const [showVersionWarning, setShowVersionWarning] = useState(false)

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
      toast.error('File quá lớn. Kích thước tối đa là 10MB.')
      return false
    }

    if (!allowedTypes.includes(file.type)) {
      toast.error('Định dạng file không được hỗ trợ. Chỉ chấp nhận PDF, DOCX, TXT, JPG, PNG.')
      return false
    }

    return true
  }

  // Check version conflict
  const checkVersionConflict = useCallback(async (file: File) => {
    try {
      const response = await automationAPI.checkFileVersion(
        file.name,
        file.size,
        file.lastModified ? new Date(file.lastModified).toISOString() : undefined
      )
      
      if (response.data.statusCode === 200) {
        const conflictData = response.data.data
        if (conflictData && typeof conflictData === 'object' && 'hasConflict' in conflictData) {
          setVersionConflict(conflictData as unknown as VersionConflictCheck)
          setShowVersionWarning(true)
          return true // Has conflict
        }
      }
      return false // No conflict
    } catch (error) {
      console.error('Error checking version conflict:', error)
      return false // Continue with upload on error
    }
  }, [])

  // Handle file upload
  const handleFileUpload = useCallback(async (file: File) => {
    if (!validateFile(file)) return

    // Check version conflict first
    const hasConflict = await checkVersionConflict(file)
    if (hasConflict) {
      setSelectedFile(file)
      return // Don't proceed with upload yet
    }

    setSelectedFile(file)
    setShowUploadModal(true)
    setIsUploading(true)
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

      const response = await automationAPI.uploadFile(file, {
        originalName: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
        source: 'global-drag-drop'
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      const bodyStatus = response.data?.statusCode
      if ((bodyStatus === 200 || bodyStatus === 201 || bodyStatus === 204) || (response.status >= 200 && response.status < 300)) {
        toast.success('Upload file thành công!')
        
        // Close modal after 2 seconds
        setTimeout(() => {
          setShowUploadModal(false)
          setSelectedFile(null)
          setUploadProgress(0)
          setIsUploading(false)
        }, 2000)
      } else {
        throw new Error(response.data.shortMessage || 'Có lỗi xảy ra khi upload file')
      }
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error.message || 'Upload file thất bại!')
      setShowUploadModal(false)
      setSelectedFile(null)
      setUploadProgress(0)
    } finally {
      setIsUploading(false)
    }
  }, [])

  // Handle drag events
  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Check if dragging files
    if (e.dataTransfer?.types.includes('Files')) {
      setIsDragOver(true)
    }
  }, [])

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Only hide if leaving the window
    if (e.target === document.body) {
      setIsDragOver(false)
    }
  }, [])

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer?.files || [])
    if (files.length > 0) {
      const file = files[0]
      // Serialize file to sessionStorage and navigate to upload page
      try {
        const reader = new FileReader()
        reader.onload = () => {
          try {
            const result = reader.result as ArrayBuffer
            const bytes = new Uint8Array(result)
            // Convert to base64
            let binary = ''
            const chunkSize = 0x8000
            for (let i = 0; i < bytes.length; i += chunkSize) {
              const chunk = bytes.subarray(i, i + chunkSize)
              binary += String.fromCharCode.apply(null, Array.from(chunk) as unknown as number[])
            }
            const base64 = btoa(binary)
            const payload = {
              name: file.name,
              type: file.type,
              size: file.size,
              lastModified: file.lastModified,
              data: base64
            }
            sessionStorage.setItem('docgo_global_drop_file', JSON.stringify(payload))
            router.push('/upload-document')
          } catch (err) {
            console.error('Failed to serialize dropped file:', err)
            // Fallback to old inline upload if serialization fails
            handleFileUpload(file)
          }
        }
        reader.onerror = () => {
          console.error('FileReader error while reading dropped file')
          handleFileUpload(file)
        }
        reader.readAsArrayBuffer(file)
      } catch (error) {
        console.error('Error handling global drop:', error)
        handleFileUpload(file)
      }
    }
  }, [handleFileUpload, router])

  // Add global event listeners
  useEffect(() => {
    document.addEventListener('dragover', handleDragOver)
    document.addEventListener('dragleave', handleDragLeave)
    document.addEventListener('drop', handleDrop)

    return () => {
      document.removeEventListener('dragover', handleDragOver)
      document.removeEventListener('dragleave', handleDragLeave)
      document.removeEventListener('drop', handleDrop)
    }
  }, [handleDragOver, handleDragLeave, handleDrop])

  // Handle version conflict actions
  const handleOverwriteFile = useCallback(async () => {
    if (!selectedFile) return
    
    setShowVersionWarning(false)
    setVersionConflict(null)
    
    // Proceed with upload
    setShowUploadModal(true)
    setIsUploading(true)
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
        uploadedAt: new Date().toISOString(),
        source: 'global-drag-drop',
        overwrite: true
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      const bodyStatus2 = response.data?.statusCode
      if ((bodyStatus2 === 200 || bodyStatus2 === 201 || bodyStatus2 === 204) || (response.status >= 200 && response.status < 300)) {
        toast.success('Upload file thành công! (Đã ghi đè file cũ)')
        
        // Close modal after 2 seconds
        setTimeout(() => {
          setShowUploadModal(false)
          setSelectedFile(null)
          setUploadProgress(0)
          setIsUploading(false)
        }, 2000)
      } else {
        throw new Error(response.data.shortMessage || 'Có lỗi xảy ra khi upload file')
      }
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error.message || 'Upload file thất bại!')
      setShowUploadModal(false)
      setSelectedFile(null)
      setUploadProgress(0)
    } finally {
      setIsUploading(false)
    }
  }, [selectedFile])

  const handleCancelUpload = useCallback(() => {
    setShowVersionWarning(false)
    setVersionConflict(null)
    setSelectedFile(null)
  }, [])

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <>
      {children}
      
      {/* Global Drag Overlay */}
      {isDragOver && (
        <div className="fixed inset-0 z-50 bg-blue-500 bg-opacity-20 flex items-center justify-center pointer-events-none">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center border-4 border-dashed border-blue-500">
            <ArrowUpTrayIcon className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Thả file để upload</h3>
            <p className="text-gray-600">Kéo thả file vào đây để upload lên hệ thống</p>
          </div>
        </div>
      )}

      {/* Version Conflict Warning Modal */}
      {showVersionWarning && versionConflict && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Phát hiện thay đổi tài liệu</h3>
              </div>
              <button
                onClick={handleCancelUpload}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 font-medium mb-2">
                  Phiên bản tài liệu trong phiên trình duyệt của bạn có vẻ cũ hơn phiên bản hiện có.
                </p>
                <p className="text-yellow-700 text-sm">
                  Lưu tài liệu ở đây có thể ghi đè lên các thay đổi khác đã được thực hiện. 
                  Để khôi phục phiên bản hiện có, hãy hủy bỏ các thay đổi của bạn hoặc đóng tài liệu.
                </p>
              </div>

              {versionConflict.existingFile && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">File hiện có:</h4>
                    <span className="text-sm text-gray-500">Version {versionConflict.existingFile.version}</span>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Tên file:</span>
                      <span className="text-sm font-medium">{versionConflict.existingFile.filename}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Kích thước:</span>
                      <span className="text-sm font-medium">{formatFileSize(versionConflict.existingFile.size)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Sửa đổi lần cuối:</span>
                      <span className="text-sm font-medium">
                        {new Date(versionConflict.existingFile.lastModified).toLocaleString('vi-VN')}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">File hiện tại:</h4>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tên file:</span>
                    <span className="text-sm font-medium">{versionConflict.currentFile.filename}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Kích thước:</span>
                    <span className="text-sm font-medium">{formatFileSize(versionConflict.currentFile.size)}</span>
                  </div>
                  {versionConflict.currentFile.lastModified && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Sửa đổi lần cuối:</span>
                      <span className="text-sm font-medium">
                        {new Date(versionConflict.currentFile.lastModified).toLocaleString('vi-VN')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleCancelUpload}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Hủy bỏ thay đổi
                </button>
                <button
                  onClick={handleOverwriteFile}
                  className="flex-1 px-4 py-2 bg-yellow-600 text-white font-medium rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Ghi đè file cũ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Upload File</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {selectedFile && (
              <div className="space-y-4">
                {/* File Info */}
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <DocumentIcon className="w-8 h-8 text-blue-500" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                  </div>
                </div>

                {/* Upload Progress */}
                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Đang upload...</span>
                      <span className="text-sm text-gray-500">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Success Message */}
                {!isUploading && uploadProgress === 100 && (
                  <div className="flex items-center space-x-2 p-4 bg-green-50 rounded-lg">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-green-700 font-medium">Upload thành công!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
