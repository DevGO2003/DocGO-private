'use client'

import React from 'react'
import { DashboardLayout } from '@/components/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { 
  DocumentTextIcon, 
  UserGroupIcon, 
  CogIcon, 
  ChartBarIcon 
} from '@heroicons/react/24/outline'

export default function DashboardPage() {
  const stats = [
    {
      title: 'Tổng hợp đồng',
      value: '1,234',
      change: '+12%',
      changeType: 'increase',
      icon: DocumentTextIcon,
    },
    {
      title: 'Người dùng hoạt động',
      value: '567',
      change: '+8%',
      changeType: 'increase',
      icon: UserGroupIcon,
    },
    {
      title: 'Tài liệu đã xử lý',
      value: '890',
      change: '+15%',
      changeType: 'increase',
      icon: CogIcon,
    },
    {
      title: 'Báo cáo tạo',
      value: '45',
      change: '+5%',
      changeType: 'increase',
      icon: ChartBarIcon,
    },
  ]

  const recentActivities = [
    {
      id: 1,
      type: 'contract',
      action: 'Hợp đồng mới được tạo',
      description: 'Hợp đồng cung cấp dịch vụ #CTR-001',
      time: '2 giờ trước',
      user: 'Nguyễn Văn A',
    },
    {
      id: 2,
      type: 'ai',
      action: 'Xử lý AI hoàn thành',
      description: 'Tài liệu "Báo cáo tài chính Q4" đã được tóm tắt',
      time: '4 giờ trước',
      user: 'Hệ thống AI',
    },
    {
      id: 3,
      type: 'user',
      action: 'Người dùng mới đăng ký',
      description: 'Tài khoản cho Trần Thị B đã được tạo',
      time: '6 giờ trước',
      user: 'Admin',
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Tổng quan về hoạt động của hệ thống DocGO
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card key={stat.title} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <p className="text-xs text-green-600 mt-1">
                  {stat.change} so với tháng trước
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Hoạt động gần đây</CardTitle>
            <CardDescription>
              Các hoạt động mới nhất trong hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    {activity.type === 'contract' && <DocumentTextIcon className="h-4 w-4 text-primary-600" />}
                    {activity.type === 'ai' && <CogIcon className="h-4 w-4 text-primary-600" />}
                    {activity.type === 'user' && <UserGroupIcon className="h-4 w-4 text-primary-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-gray-500">{activity.time}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">{activity.user}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Thao tác nhanh</CardTitle>
            <CardDescription>
              Truy cập nhanh các tính năng chính
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors text-center">
                <DocumentTextIcon className="h-8 w-8 text-primary-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Tạo hợp đồng</p>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors text-center">
                <CogIcon className="h-8 w-8 text-primary-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Xử lý AI</p>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors text-center">
                <UserGroupIcon className="h-8 w-8 text-primary-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Quản lý người dùng</p>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors text-center">
                <ChartBarIcon className="h-8 w-8 text-primary-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Xem báo cáo</p>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}






