'use client'

import React, { useState, useRef, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout'
import { HeaderPanel, PrimaryContent, GradientButton } from '@/components/ui'
import { useRouter, useParams } from 'next/navigation'
import toast from 'react-hot-toast'
import { automationAPI } from '@/lib/api'
import { ArrowRightIcon, DocumentTextIcon, CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface UploadedFile {
  file: File
  status: 'pending' | 'uploading' | 'success' | 'error'
  progress: number
  documentId?: string
  error?: string
}

export default function UploadFilesPage() {
  const router = useRouter()
  const params = useParams()
  const repositoryId = params.repositoryId as string
  
  const [selectedFiles, setSelectedFiles] = useState<UploadedFile[]>([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Check repository exists
  useEffect(() => {
    if (!repositoryId || repositoryId === 'default') {
      toast.error('Vui lòng chọn kho tài liệu trước khi upload')
      router.push('/repositories')
    }
  }, [repositoryId, router])

  // Global drag and drop
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
    }

    const handleDrop = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()

      const files = e.dataTransfer?.files
      if (files && files.length > 0) {
        handleFilesAdded(Array.from(files))
      }
    }

    document.addEventListener('dragover', handleDragOver)
    document.addEventListener('drop', handleDrop)

    return () => {
      document.removeEventListener('dragover', handleDragOver)
      document.removeEventListener('drop', handleDrop)
    }
  }, [])

  const handleFilesAdded = (files: File[]) => {
    const newFiles: UploadedFile[] = files.map(file => ({
      file,
      status: 'pending',
      progress: 0
    }))
    setSelectedFiles(prev => [...prev, ...newFiles])
    toast.success(`Đã thêm ${files.length} file`)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFilesAdded(Array.from(files))
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleUploadAll = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Chưa có file nào được chọn')
      return
    }

    setUploading(true)

    try {
      // Upload từng file với progress tracking
      for (let i = 0; i < selectedFiles.length; i++) {
        if (selectedFiles[i].status !== 'pending') continue

        // Update status uploading
        setSelectedFiles(prev => prev.map((f, idx) => 
          idx === i ? { ...f, status: 'uploading' as const, progress: 0 } : f
        ))

        try {
          const response = await automationAPI.uploadFile(
            selectedFiles[i].file,
            { repositoryId },
            { folder: 'documents', user_id: 'user123' }
          )

          if (response.data.statusCode === 201 || response.status === 201) {
            // Success
            setSelectedFiles(prev => prev.map((f, idx) => 
              idx === i ? { 
                ...f, 
                status: 'success' as const, 
                progress: 100,
                documentId: (response.data.data as any)?.documentId 
              } : f
            ))
          } else {
            throw new Error(response.data.description || 'Upload failed')
          }
        } catch (error: any) {
          setSelectedFiles(prev => prev.map((f, idx) => 
            idx === i ? { 
              ...f, 
              status: 'error' as const, 
              error: error.message 
            } : f
          ))
        }
      }

      const successCount = selectedFiles.filter(f => f.status === 'success').length
      toast.success(`Upload thành công ${successCount}/${selectedFiles.length} file`)
    } finally {
      setUploading(false)
    }
  }

  const getStatusColor = (status: UploadedFile['status']) => {
    switch (status) {
      case 'pending': return 'text-gray-500'
      case 'uploading': return 'text-blue-600'
      case 'success': return 'text-green-600'
      case 'error': return 'text-red-600'
    }
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 p-5">
        <div className="max-w-7xl mx-auto space-y-5">
          <HeaderPanel 
            title="Upload tài liệu"
            subtitle={`Kho: ${repositoryId} • Hỗ trợ upload nhiều file cùng lúc`}
            breadcrumbs={[
              { label: 'Kho tài liệu', href: '/repositories' },
              { label: repositoryId, href: `/repositories/${repositoryId}` },
              { label: 'Upload', current: true }
            ]}
            gradientFrom="emerald-500"
            gradientTo="teal-500"
          />

          {/* Upload Area */}
          <PrimaryContent>
            <div className="space-y-5">
              {/* Drag Drop Zone */}
              <div 
                className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-emerald-500 transition cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg text-gray-700 mb-2">Kéo thả file vào đây hoặc click để chọn</p>
                <p className="text-sm text-gray-500">Hỗ trợ mọi loại file • Upload nhiều file cùng lúc</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileInputChange}
                />
              </div>

              {/* Files List */}
              {selectedFiles.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Files đã chọn ({selectedFiles.length})
                    </h3>
                    <div className="flex gap-2">
                      <GradientButton
                        onClick={handleUploadAll}
                        disabled={uploading}
                        size="sm"
                      >
                        {uploading ? 'Đang upload...' : 'Upload tất cả'}
                        <ArrowRightIcon className="h-4 w-4" />
                      </GradientButton>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {selectedFiles.map((uploadedFile, index) => (
                      <div key={index} className="bg-white rounded-lg border p-4 flex items-center gap-4">
                        <DocumentTextIcon className={`h-8 w-8 ${getStatusColor(uploadedFile.status)}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {uploadedFile.file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(uploadedFile.file.size / 1024).toFixed(2)} KB
                          </p>
                          {uploadedFile.status === 'uploading' && (
                            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-emerald-600 h-2 rounded-full transition-all"
                                style={{ width: `${uploadedFile.progress}%` }}
                              />
                            </div>
                          )}
                          {uploadedFile.error && (
                            <p className="text-xs text-red-600 mt-1">{uploadedFile.error}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {uploadedFile.status === 'success' && (
                            <>
                              <CheckCircleIcon className="h-6 w-6 text-green-600" />
                              <GradientButton
                                onClick={() => router.push(`/repositories/${repositoryId}/files/${uploadedFile.documentId}`)}
                                size="sm"
                                variant="secondary"
                              >
                                Xem chi tiết
                              </GradientButton>
                            </>
                          )}
                          {uploadedFile.status === 'pending' && (
                            <button
                              onClick={() => removeFile(index)}
                              className="p-1 hover:bg-gray-100 rounded"
                            >
                              <XMarkIcon className="h-5 w-5 text-gray-500" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-4 border-t">
                <GradientButton
                  onClick={() => router.push(`/repositories/${repositoryId}`)}
                  variant="secondary"
                  size="sm"
                >
                  ← Quay về kho tài liệu
                </GradientButton>
                <GradientButton
                  onClick={() => setSelectedFiles([])}
                  variant="secondary"
                  size="sm"
                  disabled={selectedFiles.length === 0}
                >
                  Xóa tất cả
                </GradientButton>
              </div>
            </div>
          </PrimaryContent>
        </div>
      </div>
    </DashboardLayout>
  )
}
