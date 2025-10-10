'use client'

import React from 'react'
import { CalendarIcon, UserIcon, TagIcon, FolderIcon } from '@heroicons/react/24/outline'

interface DetailsTabProps {
  documentData: any
}

export function DetailsTab({ documentData }: DetailsTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <TagIcon className="w-4 h-4 mr-2 text-indigo-600" />
            Tiêu đề tài liệu
          </label>
          <input 
            type="text" 
            value={documentData?.title || ''} 
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <FolderIcon className="w-4 h-4 mr-2 text-indigo-600" />
            Mã số lưu trữ
          </label>
          <div className="flex">
            <input 
              type="text" 
              value="HD-001" 
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md text-sm font-medium text-gray-700 hover:bg-gray-200">
              +1
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <CalendarIcon className="w-4 h-4 mr-2 text-indigo-600" />
            Ngày tạo
          </label>
          <div className="flex">
            <input 
              type="text" 
              value="10/09/2024" 
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md">
              📅
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <UserIcon className="w-4 h-4 mr-2 text-indigo-600" />
            Người tạo
          </label>
          <div className="flex">
            <input 
              type="text" 
              placeholder="Chọn người tạo..." 
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 text-gray-400 hover:text-gray-600">
              ▼
            </button>
            <button className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 text-gray-400 hover:text-gray-600">
              +
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Loại tài liệu</label>
          <div className="flex">
            <input 
              type="text" 
              placeholder="Chọn loại tài liệu..." 
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 text-gray-400 hover:text-gray-600">
              ▼
            </button>
            <button className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 text-gray-400 hover:text-gray-600">
              +
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Đường dẫn lưu trữ</label>
          <div className="flex">
            <input 
              type="text" 
              value="Hợp đồng/2024/Dịch vụ IT" 
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 text-gray-400 hover:text-gray-600">
              ▼
            </button>
            <button className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 text-gray-400 hover:text-gray-600">
              +
            </button>
          </div>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
          <TagIcon className="w-4 h-4 mr-2 text-indigo-600" />
          Nhãn phân loại
        </label>
        <div className="flex">
          <input 
            type="text" 
            placeholder="Chọn nhãn..." 
            className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 text-gray-400 hover:text-gray-600">
            ▼
          </button>
          <button className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 text-gray-400 hover:text-gray-600">
            +
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {documentData?.tags?.map((tag: string, index: number) => (
            <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Document Properties */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Thuộc tính tài liệu</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mức độ ưu tiên</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
              <option value="LOW">Thấp</option>
              <option value="MEDIUM" selected>Trung bình</option>
              <option value="HIGH">Cao</option>
              <option value="CRITICAL">Quan trọng</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mức độ bảo mật</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
              <option value="PUBLIC">Công khai</option>
              <option value="INTERNAL" selected>Nội bộ</option>
              <option value="CONFIDENTIAL">Bí mật</option>
              <option value="RESTRICTED">Hạn chế</option>
            </select>
          </div>
        </div>
      </div>

      {/* File Information */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Thông tin file</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Tên file gốc</span>
            </div>
            <p className="text-sm text-gray-600 truncate">hop_dong_it_abc_v1.docx</p>
          </div>
          
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Kích thước</span>
            </div>
            <p className="text-sm text-gray-600">1.2 MB</p>
          </div>
          
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Định dạng</span>
            </div>
            <p className="text-sm text-gray-600">PDF (Archived)</p>
          </div>
        </div>
      </div>

      
    </div>
  )
}
