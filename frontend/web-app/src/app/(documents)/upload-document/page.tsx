'use client'

import React, { useState, useRef, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout'
import { HeaderPanel, PrimaryContent } from '@/components/ui'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { automationAPI } from '@/lib/apis'
import UploadProgress from '@/components/UploadProgress'

// Import components
import {
  VersioningPanel,
  UploadPanel,
  FilePreview,
  SystemInfoPanel
} from './_components'

export default function UploadDocumentPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [ocrLoading, setOcrLoading] = useState(false)
  const [createFromOldVersion, setCreateFromOldVersion] = useState(false)
  const [baseContractId, setBaseContractId] = useState('')
  const [newVersionName, setNewVersionName] = useState('')
  const [uploadingDocumentId, setUploadingDocumentId] = useState<string | null>(null)
  const [showProgress, setShowProgress] = useState(false)
  const ocrFileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Check for dropped file from sessionStorage
  useEffect(() => {
    const droppedFileData = sessionStorage.getItem('droppedFile')
    if (droppedFileData) {
      try {
        const fileData = JSON.parse(droppedFileData)
        
        // Convert data URL back to file
        const byteCharacters = atob(fileData.content.split(',')[1])
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        
        const file = new File([byteArray], fileData.name, {
          type: fileData.type,
          lastModified: fileData.lastModified
        })
        
        setSelectedFile(file)
        sessionStorage.removeItem('droppedFile') // Clean up
        toast.success(`Đã chọn file: ${fileData.name}`)
      } catch (error) {
        console.error('Error parsing dropped file data:', error)
        sessionStorage.removeItem('droppedFile')
      }
    }
  }, [])

  // Global drag and drop handlers
  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
    }

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
    }

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
    }

    const handleDrop = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()

      const files = e.dataTransfer?.files
      if (files && files.length > 0) {
        // Hỗ trợ mọi loại file
        const file = files[0]
        setSelectedFile(file)
        toast.success(`Đã chọn file: ${file.name}`)
      }
    }

    document.addEventListener('dragenter', handleDragEnter)
    document.addEventListener('dragleave', handleDragLeave)
    document.addEventListener('dragover', handleDragOver)
    document.addEventListener('drop', handleDrop)

    return () => {
      document.removeEventListener('dragenter', handleDragEnter)
      document.removeEventListener('dragleave', handleDragLeave)
      document.removeEventListener('dragover', handleDragOver)
      document.removeEventListener('drop', handleDrop)
    }
  }, [])

  const handleOcrFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      toast.success(`Đã chọn file: ${file.name}`)
    }
  }

  const handleOcrExtract = async () => {
    if (!selectedFile) return

    setOcrLoading(true)
    try {
      // Sử dụng automationAPI thay vì direct fetch call
      const response = await automationAPI.uploadFile(selectedFile, undefined, {
        folder: 'documents',
        user_id: 'user123' // TODO: Get from auth context
      })

      console.log('[Upload Page] Response received:', {
        status: response.status,
        data: response.data,
        statusCode: response.data?.statusCode,
        shortMessage: response.data?.shortMessage
      })

      if (response.data.statusCode === 201 || response.status === 201) {
        // Sync upload - completed immediately
        toast.success('Upload thành công!')
        
        // Show success modal with navigation options
        setTimeout(() => {
          const shouldViewList = confirm('Upload thành công! Bạn muốn xem danh sách tài liệu?')
          if (shouldViewList) {
            router.push('/documents')
          } else {
            router.push('/documents')
          }
        }, 500)
      } else if (response.data.statusCode === 202 || response.status === 202) {
        // Async upload - show progress tracking
        const documentId = (response.data.data as any)?.documentId
        if (documentId) {
          setUploadingDocumentId(documentId)
          setShowProgress(true)
          toast.success('File đã được nhận, đang xử lý nền...')
        } else {
          toast.error('Không nhận được document ID')
        }
      } else {
        toast.error(response.data.description || 'Upload thất bại')
      }
    } catch (error: any) {
      console.error('Upload error:', error)
      // Error handling được tự động xử lý bởi apiClient interceptors
      // Chỉ hiển thị toast nếu chưa có toast nào được hiển thị
      if (!error.response?.data?.statusCode || error.response.data.statusCode >= 400) {
        toast.error('Có lỗi xảy ra khi upload file')
      }
    } finally {
      setOcrLoading(false)
    }
  }

  const handleProgressComplete = (result: any) => {
    console.log('[Upload Page] Processing completed:', result)
    toast.success('Xử lý hoàn tất!')
    
    setTimeout(() => {
      const shouldViewList = confirm('Xử lý hoàn tất! Bạn muốn xem danh sách tài liệu?')
      if (shouldViewList) {
        router.push('/documents')
      } else {
        router.push('/documents')
      }
    }, 500)
    
    // Reset progress state
    setShowProgress(false)
    setUploadingDocumentId(null)
  }

  const handleProgressError = (error: string) => {
    console.error('[Upload Page] Processing error:', error)
    toast.error(`Lỗi xử lý: ${error}`)
    
    // Reset progress state
    setShowProgress(false)
    setUploadingDocumentId(null)
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="space-y-6">
          <HeaderPanel 
            title="Upload tài liệu"
            subtitle="Sử dụng AI để trích xuất nội dung từ tài liệu hợp đồng một cách chính xác"
            breadcrumbs={[{ label: 'Tài liệu', href: '/documents' }, { label: 'Upload', current: true }]}
          />

          {/* Content */}
          <PrimaryContent>
            <div className="space-y-6">
              {/* Progress tracking for async uploads */}
              {showProgress && uploadingDocumentId && (
                <UploadProgress
                  documentId={uploadingDocumentId}
                  onComplete={handleProgressComplete}
                  onError={handleProgressError}
                  className="mb-6"
                />
              )}

              {/* Grid 2 hàng: Cột phải Preview chiếm 3 cột và 2 hàng */}
              <div className="grid grid-cols-1 lg:grid-cols-5 lg:grid-rows-2 gap-6">
                {/* Hàng 1 - Cột trái gồm 2 khối mỗi khối 1 cột */}
                <div className="lg:col-span-1 lg:row-span-1">
                  <VersioningPanel
                    createFromOldVersion={createFromOldVersion}
                    setCreateFromOldVersion={setCreateFromOldVersion}
                    baseContractId={baseContractId}
                    setBaseContractId={setBaseContractId}
                    newVersionName={newVersionName}
                    setNewVersionName={setNewVersionName}
                  />
                </div>
                <div className="lg:col-span-1 lg:row-span-1">
                  <UploadPanel
                    selectedFile={selectedFile}
                    setSelectedFile={setSelectedFile}
                    ocrFileInputRef={ocrFileInputRef}
                    handleOcrFileSelect={handleOcrFileSelect}
                    handleOcrExtract={handleOcrExtract}
                    ocrLoading={ocrLoading}
                  />
                </div>

                {/* Cột phải: Preview chiếm 3 cột và 2 hàng */}
                <div className="lg:col-span-3 lg:row-span-2">
                  <FilePreview selectedFile={selectedFile} />
                </div>

                {/* Hàng 2 - Cột trái: System Info chiếm 2 cột */}
                <div className="lg:col-span-2 lg:row-span-1">
                  <SystemInfoPanel />
                </div>
              </div>
            </div>
          </PrimaryContent>
        </div>

      </div>
    </DashboardLayout>
  )
}