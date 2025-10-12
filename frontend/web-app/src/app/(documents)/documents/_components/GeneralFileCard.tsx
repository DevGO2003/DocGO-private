'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { DocumentTextIcon, EyeIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import type { Document } from '../_types'

type Props = {
  document: Document
  isSelected: boolean
  onToggleSelect: (id: string) => void
  badgeClass: (status: string) => string
  t: (key: string, vars?: Record<string, any>) => string
}

export default function GeneralFileCard({ document, isSelected, onToggleSelect, badgeClass, t }: Props) {
  const [previewDoc, setPreviewDoc] = useState<string | null>(null)
  const [previewPos, setPreviewPos] = useState<{x: number, y: number} | null>(null)
  const [previewTags, setPreviewTags] = useState<{docId: string, tags: string[]} | null>(null)
  const [tagsPos, setTagsPos] = useState<{x: number, y: number} | null>(null)

  const handlePreviewEnter = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setPreviewPos({ x: rect.left + rect.width/2, y: rect.top - 10 })
    setPreviewDoc(document.id)
  }

  const handlePreviewLeave = () => {
    setPreviewDoc(null)
    setPreviewPos(null)
  }

  const handleTagsEnter = (e: React.MouseEvent) => {
    if (document.tags && document.tags.length > 2) {
      const rect = e.currentTarget.getBoundingClientRect()
      setTagsPos({ x: rect.left + rect.width/2, y: rect.top - 10 })
      setPreviewTags({ docId: document.id, tags: document.tags })
    }
  }

  const handleTagsLeave = () => {
    setPreviewTags(null)
    setTagsPos(null)
  }

  const handleDownload = () => {
    console.log('Downloading file:', document.title)
    // Demo download logic - API chưa sẵn sàng
  }

  const getFileIcon = (fileType?: string) => {
    if (!fileType) return <DocumentTextIcon className="w-8 h-8 text-gray-400" />
    
    if (fileType.includes('pdf')) {
      return <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center">
        <span className="text-red-600 font-bold text-xs">PDF</span>
      </div>
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
        <span className="text-blue-600 font-bold text-xs">DOC</span>
      </div>
    } else if (fileType.includes('sheet') || fileType.includes('excel')) {
      return <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
        <span className="text-green-600 font-bold text-xs">XLS</span>
      </div>
    } else if (fileType.includes('presentation') || fileType.includes('powerpoint')) {
      return <div className="w-8 h-8 bg-orange-100 rounded flex items-center justify-center">
        <span className="text-orange-600 font-bold text-xs">PPT</span>
      </div>
    } else {
      return <DocumentTextIcon className="w-8 h-8 text-gray-400" />
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A'
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('vi-VN')
    } catch {
      return dateString
    }
  }

  return (
    <div className="group bg-white rounded-2xl border border-gray-200 p-[10px] shadow-sm hover:shadow-md hover:-translate-y-[1px] transition relative" style={{aspectRatio: '5/6'}}>
      <div className={`absolute top-2 left-2 z-30 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(document.id)}
          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
        />
      </div>
      
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto pr-1 pb-12 no-scrollbar">
          <div className="flex justify-between items-start gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-indigo-700 transition text-sm">{document.title}</h3>
              {document.category && (
                <div className="mt-1 text-xs text-gray-500">Loại: {document.category}</div>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <span className={`text-xs px-1.5 py-0.5 rounded-full border ${badgeClass(document.status)}`}>
                {document.status}
              </span>
            </div>
          </div>
          
          <p className="mt-2 text-xs text-gray-600 line-clamp-2">{document.description || 'Không có mô tả'}</p>
          
          <div className="mt-2 flex flex-wrap gap-1">
            {document.tags?.slice(0,2).map(tag => (
              <span key={tag} className="text-xs px-1.5 py-0.5 rounded-full bg-gray-50 text-gray-700 border border-gray-200">#{tag}</span>
            ))}
            {document.tags && document.tags.length > 2 && (
              <span 
                onMouseEnter={handleTagsEnter}
                onMouseLeave={handleTagsLeave}
                className="text-xs px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-300 cursor-pointer hover:bg-gray-200 transition-colors"
              >
                +{document.tags.length - 2}
              </span>
            )}
          </div>
          
          <div className="mt-2 text-xs text-gray-500 space-y-1">
            <div className="flex justify-between">
              <span>Kích thước</span>
              <span>{formatFileSize(document.fileSize)}</span>
            </div>
            <div className="flex justify-between">
              <span>Loại file</span>
              <span>{document.fileType?.split('/')[1]?.toUpperCase() || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span>Ngày tạo</span>
              <span>{formatDate(document.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons - Fixed at bottom */}
        <div className="absolute inset-x-0 bottom-0 z-20">
          <div className="flex rounded-none border-t border-gray-200 overflow-hidden divide-x divide-gray-200 bg-transparent">
            <button 
              onClick={() => window.location.href = `/documents/${document.id}`}
              className="flex-1 h-10 flex items-center justify-center text-gray-700 hover:text-indigo-600 transition-colors"
              title="Mở tệp"
            >
              <DocumentTextIcon className="w-5 h-5" />
            </button>
            
            <button 
              onMouseEnter={handlePreviewEnter}
              onMouseLeave={handlePreviewLeave}
              className="flex-1 h-10 flex items-center justify-center text-gray-700 hover:text-indigo-600 transition-colors"
              title="Xem thử"
            >
              <EyeIcon className="w-5 h-5" />
            </button>
            
            <button 
              onClick={handleDownload}
              className="flex-1 h-10 flex items-center justify-center text-gray-700 hover:text-indigo-600 transition-colors"
              title="Tải về"
            >
              <ArrowDownTrayIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Preview Popup */}
      {previewDoc && previewPos && (
        <div 
          className="fixed z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-sm"
          style={{
            left: `${previewPos.x}px`,
            top: `${previewPos.y}px`,
            transform: 'translateX(-50%) translateY(-100%)'
          }}
        >
          <div className="text-sm">
            <div className="font-medium mb-2">Xem trước (Demo)</div>
            <p className="text-gray-600">Nội dung file sẽ được hiển thị ở đây...</p>
            <p className="text-xs text-gray-500 mt-2">API chưa sẵn sàng</p>
          </div>
        </div>
      )}

      {/* Tags Preview Popup */}
      {previewTags && tagsPos && (
        <div 
          className="fixed z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-3 max-w-xs"
          style={{
            left: `${tagsPos.x}px`,
            top: `${tagsPos.y}px`,
            transform: 'translateX(-50%) translateY(-100%)'
          }}
        >
          <div className="text-sm">
            <div className="font-medium mb-2 text-gray-900">Tất cả tags</div>
            <div className="flex flex-wrap gap-1">
              {previewTags.tags.map(tag => (
                <span key={tag} className="text-xs px-2 py-1 rounded-full bg-gray-50 text-gray-700 border border-gray-200">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Hide scrollbar (keep scroll functionality) */}
      <style jsx>{`
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  )
}
