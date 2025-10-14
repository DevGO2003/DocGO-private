'use client'

import React, { useState, useRef, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout'
import { HeaderPanel, PrimaryContent } from '@/components/ui'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

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
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await fetch('http://localhost:8000/api/files/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'X-User-ID': 'user123' // TODO: Get from auth context
        }
      })

      const result = await response.json()

      if (response.ok && result.statusCode === 201) {
        toast.success('Upload thành công!')
        
        // Show success modal with navigation options
        setTimeout(() => {
          const shouldViewList = confirm('Upload thành công! Bạn muốn xem danh sách tài liệu?')
          if (shouldViewList) {
            router.push('/documents')
          } else {
            // Since backend doesn't return documentId, we can only navigate to documents list
            toast('Tài liệu đã được upload và đang được xử lý. Vui lòng kiểm tra trong danh sách tài liệu.', {
              icon: 'ℹ️',
              duration: 4000,
            })
            router.push('/documents')
          }
        }, 500)
      } else {
        toast.error(result.description || 'Upload thất bại')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Có lỗi xảy ra khi upload file')
    } finally {
      setOcrLoading(false)
    }
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