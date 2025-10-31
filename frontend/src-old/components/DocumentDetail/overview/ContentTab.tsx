'use client'

import React, { useState } from 'react'
import { DocumentTextIcon, EyeIcon, ArrowDownTrayIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

interface ContentTabProps {
  documentData: any
}

export function ContentTab({ documentData }: ContentTabProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [showFullContent, setShowFullContent] = useState(false)

  const content = documentData?.content || ''
  const displayedContent = showFullContent ? content : content.substring(0, 1000) + (content.length > 1000 ? '...' : '')

  const highlightSearchTerm = (text: string, term: string) => {
    if (!term) return text
    const regex = new RegExp(`(${term})`, 'gi')
    return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>')
  }

  return (
    <div className="space-y-6">
      {/* Content Toolbar */}
      <div className="bg-white border rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-medium text-gray-900 flex items-center">
            <DocumentTextIcon className="w-5 h-5 mr-2 text-indigo-600" />
            Nội dung tài liệu
          </h4>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 text-sm border rounded hover:bg-gray-50">
              <EyeIcon className="w-4 h-4 inline mr-1" />
              Xem trước
            </button>
              <button className="px-3 py-1 text-sm border rounded hover:bg-gray-50">
                <ArrowDownTrayIcon className="w-4 h-4 inline mr-1" />
                Tải xuống
              </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm trong nội dung..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Content Display */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-600">
            {content.length} ký tự • {content.split('\n').length} dòng
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFullContent(!showFullContent)}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
            >
              {showFullContent ? 'Thu gọn' : 'Xem đầy đủ'}
            </button>
          </div>
        </div>

        <div className="prose max-w-none">
          <div 
            className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap"
            dangerouslySetInnerHTML={{
              __html: highlightSearchTerm(displayedContent, searchTerm)
            }}
          />
        </div>

        {!showFullContent && content.length > 1000 && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setShowFullContent(true)}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
            >
              Xem thêm {content.length - 1000} ký tự...
            </button>
          </div>
        )}
      </div>

      {/* File Attachments */}
      <div className="bg-white border rounded-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">File đính kèm</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <DocumentTextIcon className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">hop_dong_it_abc.pdf</div>
                <div className="text-xs text-gray-500">PDF • 1.2 MB • 22/07/2024</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 text-sm border rounded hover:bg-gray-50">
                <EyeIcon className="w-4 h-4 inline mr-1" />
                Xem
              </button>
              <button className="px-3 py-1 text-sm border rounded hover:bg-gray-50">
                <ArrowDownTrayIcon className="w-4 h-4 inline mr-1" />
                Tải
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <DocumentTextIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">phu_luc_ky_thuat.docx</div>
                <div className="text-xs text-gray-500">DOCX • 856 KB • 20/07/2024</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 text-sm border rounded hover:bg-gray-50">
                <EyeIcon className="w-4 h-4 inline mr-1" />
                Xem
              </button>
              <button className="px-3 py-1 text-sm border rounded hover:bg-gray-50">
                <ArrowDownTrayIcon className="w-4 h-4 inline mr-1" />
                Tải
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Analysis */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Phân tích nội dung</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Từ khóa chính</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {['hợp đồng', 'dịch vụ', 'IT', 'phần mềm', 'bảo hành'].map((keyword, index) => (
                <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Số từ</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{content.split(' ').length}</p>
          </div>
          
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Độ phức tạp</span>
            </div>
            <p className="text-sm text-gray-600">Trung bình</p>
            <div className="mt-1 w-full bg-gray-200 rounded-full h-1">
              <div className="bg-yellow-500 h-1 rounded-full" style={{ width: '65%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Version History */}
      <div className="bg-white border rounded-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Lịch sử phiên bản</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                v2
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">Phiên bản hiện tại</div>
                <div className="text-xs text-gray-500">Cập nhật điều khoản bảo hành</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">22/07/2024 10:30</div>
              <div className="text-xs text-gray-500">Admin</div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white text-sm font-medium">
                v1
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">Phiên bản đầu tiên</div>
                <div className="text-xs text-gray-500">Tạo tài liệu ban đầu</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">19/07/2024 08:30</div>
              <div className="text-xs text-gray-500">Admin</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
