'use client'

import React, { useState } from 'react'
import { ClockIcon, UserIcon, TagIcon, DocumentIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

interface HistoryTabProps {
  documentData: any
}

export function HistoryTab({ documentData }: HistoryTabProps) {
  const [filter, setFilter] = useState<'all' | 'created' | 'modified' | 'status'>('all')

  const historyEvents = [
    {
      id: 1,
      type: 'created',
      title: 'Tài liệu được tạo',
      description: 'Tài liệu được tạo bởi Admin',
      user: 'Admin',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      icon: DocumentIcon,
      color: 'green'
    },
    {
      id: 2,
      type: 'modified',
      title: 'Tài liệu được chỉnh sửa',
      description: 'Tiêu đề và mô tả được cập nhật',
      user: 'Admin',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      icon: DocumentIcon,
      color: 'blue'
    },
    {
      id: 3,
      type: 'status',
      title: 'Nhãn được cập nhật',
      description: 'Thêm nhãn: IT, Dịch vụ, Phần mềm, Bảo trì',
      user: 'Legal Team',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      icon: TagIcon,
      color: 'purple'
    },
    {
      id: 4,
      type: 'status',
      title: 'Trạng thái thay đổi',
      description: 'Trạng thái thay đổi từ DRAFT thành PENDING_REVIEW',
      user: 'Admin',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      icon: ExclamationTriangleIcon,
      color: 'orange'
    },
    {
      id: 5,
      type: 'modified',
      title: 'Nội dung được cập nhật',
      description: 'Điều khoản bảo hành được chỉnh sửa từ 12 tháng lên 18 tháng',
      user: 'Legal Team',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      icon: DocumentIcon,
      color: 'blue'
    },
    {
      id: 6,
      type: 'comment',
      title: 'Bình luận mới',
      description: 'Thêm bình luận: "Cần kiểm tra điều khoản thanh toán"',
      user: 'Finance',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      icon: UserIcon,
      color: 'indigo'
    }
  ]

  const filteredEvents = historyEvents.filter(event => {
    if (filter === 'all') return true
    return event.type === filter
  })

  const getEventColor = (color: string) => {
    const colors = {
      green: 'bg-green-500',
      blue: 'bg-blue-500',
      purple: 'bg-purple-500',
      orange: 'bg-orange-500',
      indigo: 'bg-indigo-500'
    }
    return colors[color as keyof typeof colors] || 'bg-gray-500'
  }

  const getEventBorderColor = (color: string) => {
    const colors = {
      green: 'border-green-500',
      blue: 'border-blue-500',
      purple: 'border-purple-500',
      orange: 'border-orange-500',
      indigo: 'border-indigo-500'
    }
    return colors[color as keyof typeof colors] || 'border-gray-500'
  }

  const getEventBgColor = (color: string) => {
    const colors = {
      green: 'bg-green-50',
      blue: 'bg-blue-50',
      purple: 'bg-purple-50',
      orange: 'bg-orange-50',
      indigo: 'bg-indigo-50'
    }
    return colors[color as keyof typeof colors] || 'bg-gray-50'
  }

  return (
    <div className="space-y-6">
      {/* History Header */}
      <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <ClockIcon className="w-6 h-6 text-gray-600 mr-2" />
            Lịch sử tài liệu
          </h3>
          <span className="text-sm text-gray-500">{historyEvents.length} sự kiện</span>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'Tất cả' },
            { key: 'created', label: 'Tạo mới' },
            { key: 'modified', label: 'Chỉnh sửa' },
            { key: 'status', label: 'Trạng thái' }
          ].map((filterOption) => (
            <button
              key={filterOption.key}
              onClick={() => setFilter(filterOption.key as any)}
              className={`px-3 py-1 text-sm rounded-full border transition ${
                filter === filterOption.key
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {filterOption.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white border rounded-lg p-6">
        <div className="space-y-6">
          {filteredEvents.map((event, index) => {
            const Icon = event.icon
            return (
              <div key={event.id} className="relative">
                {/* Timeline Line */}
                {index < filteredEvents.length - 1 && (
                  <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200"></div>
                )}
                
                <div className={`flex items-start space-x-4 p-4 rounded-lg border-l-4 ${getEventBgColor(event.color)} ${getEventBorderColor(event.color)}`}>
                  <div className={`flex-shrink-0 w-12 h-12 ${getEventColor(event.color)} rounded-full flex items-center justify-center text-white`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="text-sm font-medium text-gray-900">{event.title}</h5>
                      <span className="text-xs text-gray-500">
                        {new Date(event.timestamp).toLocaleString('vi-VN')}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                    
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        <UserIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-xs text-gray-500">{event.user}</span>
                      </div>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500 capitalize">
                        {event.type === 'created' ? 'Tạo mới' :
                         event.type === 'modified' ? 'Chỉnh sửa' :
                         event.type === 'status' ? 'Trạng thái' :
                         event.type === 'comment' ? 'Bình luận' : event.type}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Statistics */}
      <div className="bg-white border rounded-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Thống kê hoạt động</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">1</div>
            <div className="text-sm text-gray-600">Lần tạo</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">2</div>
            <div className="text-sm text-gray-600">Lần chỉnh sửa</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">2</div>
            <div className="text-sm text-gray-600">Thay đổi trạng thái</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">1</div>
            <div className="text-sm text-gray-600">Bình luận</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Hoạt động gần đây</h4>
        <div className="space-y-3">
          {historyEvents.slice(0, 3).map((event) => (
            <div key={event.id} className="flex items-center space-x-3 p-3 bg-white rounded-lg border">
              <div className={`w-8 h-8 ${getEventColor(event.color)} rounded-full flex items-center justify-center text-white text-sm`}>
                {event.user.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{event.title}</p>
                <p className="text-xs text-gray-500">{new Date(event.timestamp).toLocaleString('vi-VN')}</p>
              </div>
              <div className="text-xs text-gray-400">
                {event.user}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-white border rounded-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Xuất dữ liệu</h4>
        <div className="flex flex-wrap gap-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm">
            📊 Xuất Excel
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm">
            📄 Xuất PDF
          </button>
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm">
            📋 Sao chép timeline
          </button>
          <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition text-sm">
            🔍 Tìm kiếm nâng cao
          </button>
        </div>
      </div>
    </div>
  )
}
