'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout'
import FileDetailView from '@/components/FileDetailView'
import { fileStorageAPI } from '@/lib/api'
import toast from 'react-hot-toast'

export default function FileDetailPage() {
  const params = useParams() as { id: string }
  const router = useRouter()
  const [file, setFile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFile = async () => {
      try {
        setLoading(true)
        const response = await fileStorageAPI.getFileDetails(params.id)
        if (response.data?.statusCode === 200) {
          const fileData = response.data.data
          setFile({
            id: fileData.id || params.id,
            name: fileData.fileName || 'Unknown File',
            size: fileData.fileSize || 0,
            type: fileData.fileType || 'application/octet-stream',
            uploadDate: fileData.uploadDate || new Date().toISOString().split('T')[0],
            lastModified: fileData.lastModified || new Date().toISOString().split('T')[0],
            storagePath: fileData.storagePath || 'Default',
            tags: fileData.tags || [],
            description: fileData.description || '',
            metadata: fileData.metadata || {}
          })
        } else {
          toast.error('Không tìm thấy file')
          router.back()
        }
      } catch (error) {
        console.error('Error fetching file:', error)
        toast.error('Lỗi khi tải thông tin file')
        router.back()
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchFile()
    }
  }, [params.id, router])

  const handleSave = async (fileData: any) => {
    try {
      // TODO: Implement save functionality
      toast.success('Đã lưu thông tin file')
    } catch (error) {
      console.error('Error saving file:', error)
      toast.error('Lỗi khi lưu file')
    }
  }

  const handleDiscard = () => {
    router.back()
  }

  const handleClose = () => {
    router.back()
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
        </div>
      </DashboardLayout>
    )
  }

  if (!file) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy file</h2>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Quay lại
            </button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <FileDetailView
        file={file}
        onClose={handleClose}
        onSave={handleSave}
        onDiscard={handleDiscard}
      />
    </DashboardLayout>
  )
}




