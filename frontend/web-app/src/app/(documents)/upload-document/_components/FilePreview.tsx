'use client'

import React, { useMemo } from 'react'
import { formatFileSize } from '@/utils/helpers'
import dynamic from 'next/dynamic'
import { DocumentTextIcon } from '@heroicons/react/24/outline'

interface FilePreviewProps {
  selectedFile: File | null
}

// Loading fallback for preview components
function LoadingPreview() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-sm text-gray-600">Đang tải xem trước…</p>
      </div>
    </div>
  )
}

// Lazy loaders per preview type (loaded only when needed)
const GenericPreview = dynamic(() => import('@/components/preview/GenericPreview'), { ssr: false, loading: LoadingPreview })
const PdfPreview = dynamic(() => import('@/components/preview/PdfPreview'), { ssr: false, loading: LoadingPreview })
const OfficePreview = dynamic(() => import('@/components/preview/OfficePreview'), { ssr: false, loading: LoadingPreview })
const ImagePreview = dynamic(() => import('@/components/preview/ImagePreview'), { ssr: false, loading: LoadingPreview })
const VideoPreview = dynamic(() => import('@/components/preview/VideoPreview'), { ssr: false, loading: LoadingPreview })
const AudioPreview = dynamic(() => import('@/components/preview/AudioPreview'), { ssr: false, loading: LoadingPreview })
const TextPreview = dynamic(() => import('@/components/preview/TextPreview'), { ssr: false, loading: LoadingPreview })
const ArchivePreview = dynamic(() => import('@/components/preview/ArchivePreview'), { ssr: false, loading: LoadingPreview })

function getExtension(fileName: string): string {
  const parts = fileName.split('.')
  return parts.length > 1 ? parts.pop()!.toLowerCase() : ''
}

export default function FilePreview({ selectedFile }: FilePreviewProps) {
  const PreviewComponent = useMemo(() => {
    if (!selectedFile) return null

    const type = selectedFile.type || ''
    const ext = getExtension(selectedFile.name)

    // PDF
    if (type === 'application/pdf' || ext === 'pdf') return PdfPreview

    // Office documents (supported by OfficePreview via XLSX and DOCX)
    if (/^(xlsx|xls|docx|doc)$/i.test(ext)) return OfficePreview

    // PowerPoint files (not parsed yet -> fallback)
    if (/^(pptx|ppt)$/i.test(ext)) return GenericPreview

    // Archives
    if (/^(zip|rar|7z)$/i.test(ext)) return ArchivePreview

    // Images
    if (type.startsWith('image/') || /^(jpg|jpeg|png|gif|bmp|webp|svg|ico)$/i.test(ext)) return ImagePreview

    // Video
    if (type.startsWith('video/') || /^(mp4|avi|mov|wmv|flv|webm|mkv)$/i.test(ext)) return VideoPreview

    // Audio
    if (type.startsWith('audio/') || /^(mp3|wav|ogg|aac|flac|m4a)$/i.test(ext)) return AudioPreview

    // Text / code
    if (type === 'text/plain' || /^(txt|log|csv)$/i.test(ext)) return TextPreview
    if (/^(html|htm|css|js|jsx|ts|tsx|json|xml|yaml|yml|md|py|java|cpp|c|cs|php|rb|go|rs|sh|sql|vue|svelte)$/i.test(ext)) {
      // CodePreview is part of preview set
      return dynamic(() => import('@/components/preview/CodePreview'), { ssr: false, loading: LoadingPreview }) as any
    }

    // Fallback
    return GenericPreview
  }, [selectedFile])
  
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm h-full flex flex-col">
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-base font-semibold text-gray-900">
          Xem trước nội dung file <span className="text-gray-500 font-normal">• {selectedFile ? `${selectedFile.name} (${formatFileSize(selectedFile.size)})` : 'Chọn file để xem trước'}</span>
        </h3>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden bg-gray-50 min-h-0">
          {selectedFile ? (
            PreviewComponent ? (
              React.createElement(PreviewComponent as React.ComponentType<{ file: File }>, { file: selectedFile })
            ) : (
              <GenericPreview file={selectedFile} />
            )
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-1">Chưa có file được chọn</p>
                <p className="text-xs text-gray-500">Chọn file để xem trước nội dung</p>
              </div>
            </div>
          )}
        </div>
        {selectedFile && (
          <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
            <span>Kích thước: {formatFileSize(selectedFile.size)}</span>
            <span>Loại: {selectedFile.type || 'Không xác định'}</span>
          </div>
        )}
      </div>
    </div>
  )
}

// Helper function for formatting file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}