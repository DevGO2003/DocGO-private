'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  EyeIcon, 
  DocumentTextIcon, 
  ArrowDownTrayIcon, 
  LinkIcon, 
  ClipboardDocumentIcon,
  ShareIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface UploadSuccessControlsProps {
  fileId: string
  fileName: string
  fileType?: string
  fileSize?: string
  onUploadMore?: () => void
  onEditFile?: (fileId: string) => void
  onDeleteFile?: (fileId: string) => void
  className?: string
}

export default function UploadSuccessControls({
  fileId,
  fileName,
  fileType,
  fileSize,
  onUploadMore,
  onEditFile,
  onDeleteFile,
  className = ''
}: UploadSuccessControlsProps) {
  const router = useRouter()
  const [isCopying, setIsCopying] = useState(false)

  // Generate file link
  const generateFileLink = () => {
    const baseUrl = window.location.origin
    return `${baseUrl}/files/${fileId}`
  }

  // Copy link to clipboard
  const handleCopyLink = async () => {
    try {
      setIsCopying(true)
      const link = generateFileLink()
      await navigator.clipboard.writeText(link)
      toast.success('Đã copy link file!')
    } catch (error) {
      console.error('Failed to copy link:', error)
      toast.error('Không thể copy link')
    } finally {
      setIsCopying(false)
    }
  }

  // View file details
  const handleViewFile = () => {
    router.push(`/files/${fileId}`)
  }

  // View file list
  const handleViewFileList = () => {
    router.push('/files')
  }

  // Download file
  const handleDownloadFile = () => {
    // TODO: Implement download functionality
    toast('Chức năng tải xuống đang được phát triển', { icon: 'ℹ️' })
  }

  // Share file
  const handleShareFile = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: fileName,
          text: `Chia sẻ file: ${fileName}`,
          url: generateFileLink()
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      handleCopyLink()
    }
  }

  // Edit file
  const handleEditFile = () => {
    if (onEditFile) {
      onEditFile(fileId)
    } else {
      router.push(`/files/${fileId}/edit`)
    }
  }

  // Delete file
  const handleDeleteFile = () => {
    if (onDeleteFile) {
      onDeleteFile(fileId)
    } else {
      // TODO: Implement delete functionality
      toast('Chức năng xóa file đang được phát triển', { icon: 'ℹ️' })
    }
  }

  // Upload more files
  const handleUploadMore = () => {
    if (onUploadMore) {
      onUploadMore()
    } else {
      router.push('/upload-document')
    }
  }

  const controlButtons = [
    {
      id: 'view-file',
      label: 'Xem file',
      icon: EyeIcon,
      onClick: handleViewFile,
      color: 'bg-blue-600 hover:bg-blue-700',
      description: 'Xem chi tiết file'
    },
    {
      id: 'view-list',
      label: 'Danh sách',
      icon: DocumentTextIcon,
      onClick: handleViewFileList,
      color: 'bg-gray-600 hover:bg-gray-700',
      description: 'Xem danh sách files'
    },
    {
      id: 'preview',
      label: 'Preview',
      icon: EyeIcon,
      onClick: () => router.push(`/files/${fileId}?preview=true`),
      color: 'bg-purple-600 hover:bg-purple-700',
      description: 'Xem trước file'
    },
    {
      id: 'copy-link',
      label: 'Copy link',
      icon: isCopying ? ClipboardDocumentIcon : LinkIcon,
      onClick: handleCopyLink,
      color: 'bg-green-600 hover:bg-green-700',
      description: 'Copy link chia sẻ',
      loading: isCopying
    },
    {
      id: 'download',
      label: 'Tải xuống',
      icon: ArrowDownTrayIcon,
      onClick: handleDownloadFile,
      color: 'bg-indigo-600 hover:bg-indigo-700',
      description: 'Tải file về máy'
    },
    {
      id: 'share',
      label: 'Chia sẻ',
      icon: ShareIcon,
      onClick: handleShareFile,
      color: 'bg-orange-600 hover:bg-orange-700',
      description: 'Chia sẻ file'
    }
  ]

  const actionButtons = [
    {
      id: 'edit',
      label: 'Chỉnh sửa',
      icon: PencilIcon,
      onClick: handleEditFile,
      color: 'bg-yellow-600 hover:bg-yellow-700',
      description: 'Chỉnh sửa file'
    },
    {
      id: 'upload-more',
      label: 'Upload thêm',
      icon: PlusIcon,
      onClick: handleUploadMore,
      color: 'bg-emerald-600 hover:bg-emerald-700',
      description: 'Upload thêm files'
    },
    {
      id: 'delete',
      label: 'Xóa file',
      icon: TrashIcon,
      onClick: handleDeleteFile,
      color: 'bg-red-600 hover:bg-red-700',
      description: 'Xóa file khỏi hệ thống'
    }
  ]

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Upload thành công!</h3>
            <p className="text-sm text-gray-600">File đã được lưu vào hệ thống</p>
          </div>
        </div>
      </div>

      {/* File Info */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <DocumentTextIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{fileName}</p>
            <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
              <span>ID: {fileId}</span>
              {fileType && <span>{fileType.toUpperCase()}</span>}
              {fileSize && <span>{fileSize}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 py-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Thao tác nhanh</h4>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {controlButtons.map((button) => (
            <button
              key={button.id}
              onClick={button.onClick}
              disabled={button.loading}
              className={`flex items-center justify-center space-x-2 px-4 py-3 text-white rounded-lg transition-all duration-200 hover:shadow-md disabled:opacity-50 ${button.color}`}
              title={button.description}
            >
              {button.loading ? (
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <button.icon className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">{button.label}</span>
            </button>
          ))}
        </div>

        {/* Additional Actions */}
        <div className="border-t border-gray-100 pt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Thao tác khác</h4>
          <div className="flex flex-wrap gap-2">
            {actionButtons.map((button) => (
              <button
                key={button.id}
                onClick={button.onClick}
                className={`flex items-center space-x-2 px-3 py-2 text-white rounded-md transition-all duration-200 hover:shadow-sm text-sm ${button.color}`}
                title={button.description}
              >
                <button.icon className="w-4 h-4" />
                <span>{button.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* File Link */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-2">Link chia sẻ:</p>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={generateFileLink()}
              readOnly
              className="flex-1 px-3 py-1 text-xs bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              onClick={handleCopyLink}
              disabled={isCopying}
              className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isCopying ? 'Copying...' : 'Copy'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
