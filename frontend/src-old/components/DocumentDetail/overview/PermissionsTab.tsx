'use client'

import React, { useState } from 'react'
import { ShieldCheckIcon, UserPlusIcon, EyeIcon, PencilIcon, TrashIcon, LockClosedIcon, KeyIcon } from '@heroicons/react/24/outline'

interface PermissionsTabProps {
  documentData: any
}

export function PermissionsTab({ documentData }: PermissionsTabProps) {
  const [showAddUser, setShowAddUser] = useState(false)

  const users = [
    {
      id: 1,
      name: 'Admin',
      email: 'admin@docgo.com',
      role: 'Owner',
      avatar: 'A',
      color: 'indigo',
      permissions: ['read', 'write', 'delete', 'share'],
      lastAccess: '2024-01-22T10:30:00Z'
    },
    {
      id: 2,
      name: 'Legal Team',
      email: 'legal@docgo.com',
      role: 'Editor',
      avatar: 'L',
      color: 'blue',
      permissions: ['read', 'write'],
      lastAccess: '2024-01-21T14:20:00Z'
    },
    {
      id: 3,
      name: 'Finance Team',
      email: 'finance@docgo.com',
      role: 'Viewer',
      avatar: 'F',
      color: 'green',
      permissions: ['read'],
      lastAccess: '2024-01-20T09:15:00Z'
    }
  ]

  const getRoleColor = (role: string) => {
    const colors = {
      'Owner': 'bg-green-100 text-green-800',
      'Editor': 'bg-blue-100 text-blue-800',
      'Viewer': 'bg-gray-100 text-gray-800'
    }
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getAvatarColor = (color: string) => {
    const colors = {
      'indigo': 'bg-indigo-500',
      'blue': 'bg-blue-500',
      'green': 'bg-green-500',
      'purple': 'bg-purple-500',
      'orange': 'bg-orange-500'
    }
    return colors[color as keyof typeof colors] || 'bg-gray-500'
  }

  const getPermissionIcon = (permission: string) => {
    const icons = {
      'read': EyeIcon,
      'write': PencilIcon,
      'delete': TrashIcon,
      'share': UserPlusIcon
    }
    return icons[permission as keyof typeof icons] || EyeIcon
  }

  const getPermissionLabel = (permission: string) => {
    const labels = {
      'read': 'Xem',
      'write': 'Chỉnh sửa',
      'delete': 'Xóa',
      'share': 'Chia sẻ'
    }
    return labels[permission as keyof typeof labels] || permission
  }

  return (
    <div className="space-y-6">
      {/* Access Control Overview */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <ShieldCheckIcon className="w-6 h-6 text-blue-600 mr-2" />
            Kiểm soát truy cập
          </h3>
          <button 
            onClick={() => setShowAddUser(!showAddUser)}
            className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <UserPlusIcon className="w-4 h-4 mr-1" />
            Thêm người dùng
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm font-medium text-gray-900">Chủ sở hữu</span>
            </div>
            <p className="text-lg font-bold text-gray-900">1</p>
          </div>
          
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center mb-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-sm font-medium text-gray-900">Biên tập viên</span>
            </div>
            <p className="text-lg font-bold text-gray-900">1</p>
          </div>
          
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center mb-2">
              <div className="w-3 h-3 bg-gray-500 rounded-full mr-2"></div>
              <span className="text-sm font-medium text-gray-900">Người xem</span>
            </div>
            <p className="text-lg font-bold text-gray-900">1</p>
          </div>
        </div>
      </div>

      {/* User Permissions */}
      <div className="bg-white border rounded-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Quyền người dùng</h4>
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 ${getAvatarColor(user.color)} rounded-full flex items-center justify-center text-white text-lg font-medium`}>
                  {user.avatar}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                  <div className="text-xs text-gray-400">
                    Truy cập lần cuối: {new Date(user.lastAccess).toLocaleString('vi-VN')}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                  {user.role}
                </span>
                
                <div className="flex items-center space-x-1">
                  {user.permissions.map((permission) => {
                    const Icon = getPermissionIcon(permission)
                    return (
                      <div key={permission} className="flex items-center space-x-1 px-2 py-1 bg-white rounded border">
                        <Icon className="w-3 h-3 text-gray-500" />
                        <span className="text-xs text-gray-600">{getPermissionLabel(permission)}</span>
                      </div>
                    )
                  })}
                </div>
                
                <button className="text-gray-400 hover:text-gray-600">
                  ⋯
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Document Security */}
      <div className="bg-white border rounded-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Bảo mật tài liệu</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <LockClosedIcon className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium text-gray-900">Mã hóa</span>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Bật
                </span>
              </div>
              <p className="text-xs text-gray-500">Tài liệu được mã hóa khi lưu trữ</p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <KeyIcon className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm font-medium text-gray-900">Chữ ký số</span>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Chờ xử lý
                </span>
              </div>
              <p className="text-xs text-gray-500">Đang chờ chữ ký số từ các bên</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">Watermark</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Có
                </span>
              </div>
              <p className="text-xs text-gray-500">Tài liệu có watermark bảo vệ</p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">Theo dõi truy cập</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Bật
                </span>
              </div>
              <p className="text-xs text-gray-500">Ghi log mọi hoạt động truy cập</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sharing Settings */}
      <div className="bg-white border rounded-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Chia sẻ</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="text-sm font-medium text-gray-900">Link chia sẻ công khai</div>
              <div className="text-sm text-gray-500">Chỉ người có quyền truy cập</div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 text-sm border rounded hover:bg-gray-50">
                Tạo link
              </button>
              <button className="px-3 py-1 text-sm border rounded hover:bg-gray-50">
                Sao chép
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="text-sm font-medium text-gray-900">Chia sẻ qua email</div>
              <div className="text-sm text-gray-500">Gửi link qua email cho người dùng</div>
            </div>
            <button className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700">
              Gửi email
            </button>
          </div>
        </div>
      </div>

      {/* Permission Templates */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Mẫu quyền hạn</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border">
            <h5 className="text-sm font-medium text-gray-900 mb-2">Chủ sở hữu</h5>
            <div className="space-y-1">
              {['Xem', 'Chỉnh sửa', 'Xóa', 'Chia sẻ'].map((permission) => (
                <div key={permission} className="flex items-center space-x-2 text-xs text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>{permission}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border">
            <h5 className="text-sm font-medium text-gray-900 mb-2">Biên tập viên</h5>
            <div className="space-y-1">
              {['Xem', 'Chỉnh sửa'].map((permission) => (
                <div key={permission} className="flex items-center space-x-2 text-xs text-gray-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>{permission}</span>
                </div>
              ))}
              {['Xóa', 'Chia sẻ'].map((permission) => (
                <div key={permission} className="flex items-center space-x-2 text-xs text-gray-400">
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  <span>{permission}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border">
            <h5 className="text-sm font-medium text-gray-900 mb-2">Người xem</h5>
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-xs text-gray-600">
                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                <span>Xem</span>
              </div>
              {['Chỉnh sửa', 'Xóa', 'Chia sẻ'].map((permission) => (
                <div key={permission} className="flex items-center space-x-2 text-xs text-gray-400">
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  <span>{permission}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
