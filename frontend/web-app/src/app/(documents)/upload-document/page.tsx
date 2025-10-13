'use client'

import React, { useState, useRef, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout'
import { HeaderPanel, PrimaryContent } from '@/components/ui'
import { DocumentTextIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

// Import components
import {
  VersioningPanel,
  UploadPanel,
  FilePreview,
  SystemInfoPanel,
  GlobalDragOverlay
} from './_components'

export default function UploadDocumentPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [ocrLoading, setOcrLoading] = useState(false)
  const [createFromOldVersion, setCreateFromOldVersion] = useState(false)
  const [baseContractId, setBaseContractId] = useState('')
  const [newVersionName, setNewVersionName] = useState('')
  const [globalDragActive, setGlobalDragActive] = useState(false)
  const ocrFileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Global drag and drop handlers
  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setGlobalDragActive(true)
    }

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (e.target === document) {
        setGlobalDragActive(false)
      }
    }

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
    }

    const handleDrop = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setGlobalDragActive(false)

      const files = e.dataTransfer?.files
      if (files && files.length > 0) {
        const file = files[0]
        if (file.type === 'application/pdf' || 
            file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            file.type === 'text/plain' ||
            file.type.startsWith('image/')) {
          setSelectedFile(file)
          toast.success(`Đã chọn file: ${file.name}`)
        } else {
          toast.error('Chỉ hỗ trợ file PDF, DOCX, TXT, Images')
        }
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

      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Upload thành công!')
        
        // Show success modal with navigation options
        setTimeout(() => {
          const shouldViewList = confirm('Upload thành công! Bạn muốn xem danh sách tài liệu?')
          if (shouldViewList) {
            router.push('/documents')
          } else {
            const shouldViewNew = confirm('Bạn có muốn xem tài liệu vừa upload không?')
            if (shouldViewNew && result.data?.id) {
              router.push(`/documents/${result.data.id}`)
            }
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
              {/* Dòng 1: Full width version panel */}
              <VersioningPanel
                createFromOldVersion={createFromOldVersion}
                setCreateFromOldVersion={setCreateFromOldVersion}
                baseContractId={baseContractId}
                setBaseContractId={setBaseContractId}
                newVersionName={newVersionName}
                setNewVersionName={setNewVersionName}
              />

              {/* Dòng 2: Chia tỷ lệ 2|3 - Upload | Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Khung upload (2/5) */}
                <div className="lg:col-span-2">
                  <UploadPanel
                    selectedFile={selectedFile}
                    setSelectedFile={setSelectedFile}
                    ocrFileInputRef={ocrFileInputRef}
                    handleOcrFileSelect={handleOcrFileSelect}
                    handleOcrExtract={handleOcrExtract}
                    ocrLoading={ocrLoading}
                  />
                </div>

                {/* Cửa sổ preview file (3/5) */}
                <div className="lg:col-span-3">
                  <FilePreview selectedFile={selectedFile} />
                </div>
              </div>

              {/* Dòng 3: Full width thông tin */}
              <SystemInfoPanel />
            </div>
          </PrimaryContent>
        </div>

        {/* Global Drag Overlay */}
        <GlobalDragOverlay globalDragActive={globalDragActive} />
      </div>
    </DashboardLayout>
  )
}