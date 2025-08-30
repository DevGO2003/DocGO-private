'use client'

import { useState } from 'react'
import { 
  DocumentTextIcon, 
  UserGroupIcon, 
  CogIcon, 
  ChartBarIcon,
  DocumentDuplicateIcon,
  CloudArrowUpIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState('')

  const features = [
    {
      title: 'Quản lý hợp đồng',
      description: 'Tạo, chỉnh sửa và theo dõi hợp đồng một cách hiệu quả',
      icon: DocumentTextIcon,
      href: '/contracts'
    },
    {
      title: 'Quản lý người dùng',
      description: 'Quản lý tài khoản và phân quyền người dùng',
      icon: UserGroupIcon,
      href: '/users'
    },
    {
      title: 'Xử lý AI',
      description: 'Trích xuất và phân tích tài liệu với AI',
      icon: CogIcon,
      href: '/ai-processing'
    },
    {
      title: 'Báo cáo & Analytics',
      description: 'Theo dõi hiệu suất và tạo báo cáo chi tiết',
      icon: ChartBarIcon,
      href: '/reports'
    },
    {
      title: 'Quản lý tài liệu',
      description: 'Lưu trữ và tổ chức tài liệu một cách có hệ thống',
      icon: DocumentDuplicateIcon,
      href: '/documents'
    },
    {
      title: 'Lưu trữ file',
      description: 'Quản lý và chia sẻ file an toàn',
      icon: CloudArrowUpIcon,
      href: '/storage'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <DocumentTextIcon className="h-8 w-8 text-primary-600" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">DocGO</h1>
            </div>
            
            {/* Search Bar */}
            <div className="flex-1 max-w-lg mx-8">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm tài liệu, hợp đồng..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="btn-secondary">Đăng nhập</button>
              <button className="btn-primary">Đăng ký</button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Quản lý tài liệu thông minh với AI
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            DocGO giúp bạn quản lý hợp đồng, tài liệu và quy trình làm việc một cách hiệu quả. 
            Tích hợp AI để tự động hóa việc xử lý và phân tích tài liệu.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature) => (
            <div key={feature.title} className="card hover:shadow-lg transition-shadow duration-300 cursor-pointer">
              <div className="flex items-center mb-4">
                <feature.icon className="h-8 w-8 text-primary-600" />
                <h3 className="ml-3 text-lg font-semibold text-gray-900">{feature.title}</h3>
              </div>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Thống kê hệ thống</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600">1,234</div>
              <div className="text-gray-600">Hợp đồng</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600">567</div>
              <div className="text-gray-600">Người dùng</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600">89</div>
              <div className="text-gray-600">Tài liệu</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600">99.9%</div>
              <div className="text-gray-600">Uptime</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-400">
              © 2024 DocGO. Phát triển bởi DevGO2003. Tất cả quyền được bảo lưu.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
