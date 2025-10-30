'use client'

import React, { useState } from 'react'
import { TagIcon, ExclamationTriangleIcon, ShieldCheckIcon, StarIcon } from '@heroicons/react/24/outline'

interface ClassificationTabProps {
  documentData: any
}

export function ClassificationTab({ documentData }: ClassificationTabProps) {
  const [priority, setPriority] = useState('MEDIUM')
  const [securityLevel, setSecurityLevel] = useState('INTERNAL')
  const [newTag, setNewTag] = useState('')
  const [tags, setTags] = useState<string[]>(documentData?.tags || [])

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const priorityOptions = [
    { value: 'LOW', label: 'Thấp', color: 'bg-gray-100 text-gray-800' },
    { value: 'MEDIUM', label: 'Trung bình', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'HIGH', label: 'Cao', color: 'bg-orange-100 text-orange-800' },
    { value: 'CRITICAL', label: 'Quan trọng', color: 'bg-red-100 text-red-800' }
  ]

  const securityOptions = [
    { value: 'PUBLIC', label: 'Công khai', color: 'bg-green-100 text-green-800' },
    { value: 'INTERNAL', label: 'Nội bộ', color: 'bg-blue-100 text-blue-800' },
    { value: 'CONFIDENTIAL', label: 'Bí mật', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'RESTRICTED', label: 'Hạn chế', color: 'bg-red-100 text-red-800' }
  ]

  const getPriorityColor = (value: string) => {
    return priorityOptions.find(p => p.value === value)?.color || 'bg-gray-100 text-gray-800'
  }

  const getSecurityColor = (value: string) => {
    return securityOptions.find(s => s.value === value)?.color || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      {/* Tags Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-medium text-gray-900 flex items-center">
            <TagIcon className="w-5 h-5 mr-2 text-indigo-600" />
            Nhãn phân loại
          </h4>
          <span className="text-sm text-gray-500">{tags.length} nhãn</span>
        </div>
        
        {/* Add Tag Input */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTag()}
            placeholder="Thêm nhãn mới..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button
            onClick={addTag}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
          >
            Thêm
          </button>
        </div>

        {/* Tags Display */}
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
            >
              {tag}
              <button
                onClick={() => removeTag(tag)}
                className="ml-2 text-indigo-600 hover:text-indigo-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Priority and Security */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <StarIcon className="w-4 h-4 mr-2 text-yellow-500" />
            Mức độ ưu tiên
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          >
            {priorityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="mt-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(priority)}`}>
              {priorityOptions.find(p => p.value === priority)?.label}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <ShieldCheckIcon className="w-4 h-4 mr-2 text-blue-500" />
            Mức độ bảo mật
          </label>
          <select
            value={securityLevel}
            onChange={(e) => setSecurityLevel(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          >
            {securityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="mt-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSecurityColor(securityLevel)}`}>
              {securityOptions.find(s => s.value === securityLevel)?.label}
            </span>
          </div>
        </div>
      </div>

      {/* Document Categories */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Phân loại tài liệu</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center mb-2">
              <TagIcon className="w-5 h-5 text-blue-500 mr-2" />
              <span className="text-sm font-medium text-gray-900">Loại hợp đồng</span>
            </div>
            <p className="text-sm text-gray-600">Dịch vụ IT</p>
          </div>
          
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center mb-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-orange-500 mr-2" />
              <span className="text-sm font-medium text-gray-900">Rủi ro</span>
            </div>
            <p className="text-sm text-gray-600">{documentData?.riskAssessment?.riskLevel || 'MEDIUM'}</p>
          </div>
          
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center mb-2">
              <ShieldCheckIcon className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-sm font-medium text-gray-900">Tuân thủ</span>
            </div>
            <p className="text-sm text-gray-600">{documentData?.complianceStatus?.status || 'COMPLIANT'}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Thống kê nhanh</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">{tags.length}</div>
            <div className="text-sm text-gray-600">Nhãn</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {documentData?.parties?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Bên tham gia</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {documentData?.keyClauses?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Điều khoản chính</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {documentData?.reminders?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Nhắc nhở</div>
          </div>
        </div>
      </div>
    </div>
  )
}
