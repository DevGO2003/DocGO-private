'use client'

import React from 'react'
import { WorkflowCard } from '../WorkflowCard'

interface WorkflowTabProps {
  documentData: any
}

export function WorkflowTab({ documentData }: WorkflowTabProps) {
  // Enhanced workflow data with more diverse information
  const workflowData = {
    currentStage: documentData?.status === 'PENDING_REVIEW' ? 'review' : 'draft',
    progress: documentData?.status === 'PENDING_REVIEW' ? 75 : 30,
    nextActions: [
      'Phê duyệt từ pháp lý',
      'Ký số điện tử',
      'Lưu trữ tài liệu',
      'Thông báo các bên liên quan'
    ],
    deadlines: [
      {
        title: 'Phê duyệt pháp lý',
        description: 'Cần phê duyệt từ phòng pháp lý trước khi ký',
        date: '25/01/2024',
        urgent: true
      },
      {
        title: 'Ký số điện tử',
        description: 'Hoàn tất ký số điện tử từ các bên',
        date: '30/01/2024',
        urgent: false
      },
      {
        title: 'Hiệu lực hợp đồng',
        description: 'Hợp đồng chính thức có hiệu lực',
        date: '01/02/2024',
        urgent: true
      },
      {
        title: 'Báo cáo tiến độ đầu tiên',
        description: 'Báo cáo tiến độ 30 ngày đầu tiên',
        date: '01/03/2024',
        urgent: false
      }
    ],
    assignments: [
      {
        task: 'Phê duyệt tài liệu',
        assignee: 'Legal Team',
        status: 'in-progress' as const
      },
      {
        task: 'Ký số điện tử',
        assignee: 'Admin',
        status: 'pending' as const
      },
      {
        task: 'Thông báo bên thứ ba',
        assignee: 'Project Manager',
        status: 'pending' as const
      },
      {
        task: 'Lưu trữ tài liệu',
        assignee: 'Document Team',
        status: 'pending' as const
      }
    ]
  }

  return (
    <div className="space-y-6">
      {/* Workflow Overview */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">🔄 Quy trình xử lý</h3>
          <span className="text-sm text-gray-500">Tiến độ: {workflowData.progress}%</span>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Trạng thái hiện tại</span>
            <span>{workflowData.progress}% hoàn thành</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${workflowData.progress}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center mb-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-sm font-medium text-gray-900">Giai đoạn</span>
            </div>
            <p className="text-lg font-bold text-gray-900 capitalize">
              {workflowData.currentStage === 'review' ? 'Đang duyệt' : 'Nháp'}
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm font-medium text-gray-900">Hành động tiếp theo</span>
            </div>
            <p className="text-lg font-bold text-gray-900">{workflowData.nextActions.length}</p>
          </div>
          
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center mb-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
              <span className="text-sm font-medium text-gray-900">Deadline</span>
            </div>
            <p className="text-lg font-bold text-gray-900">{workflowData.deadlines.length}</p>
          </div>
        </div>
      </div>

      {/* Main Workflow Card */}
      <WorkflowCard {...workflowData} />

      {/* Workflow Steps */}
      <div className="bg-white border rounded-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">📋 Các bước trong quy trình</h4>
        <div className="space-y-4">
          <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
              1
            </div>
            <div className="flex-1">
              <h5 className="text-sm font-medium text-gray-900">Tạo tài liệu</h5>
              <p className="text-sm text-gray-600">Tạo và soạn thảo hợp đồng</p>
            </div>
            <span className="text-xs text-green-600 font-medium">Hoàn thành</span>
          </div>
          
          <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
              2
            </div>
            <div className="flex-1">
              <h5 className="text-sm font-medium text-gray-900">Phê duyệt pháp lý</h5>
              <p className="text-sm text-gray-600">Rà soát và phê duyệt từ phòng pháp lý</p>
            </div>
            <span className="text-xs text-blue-600 font-medium">Đang xử lý</span>
          </div>
          
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border-l-4 border-gray-300">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-sm font-medium">
              3
            </div>
            <div className="flex-1">
              <h5 className="text-sm font-medium text-gray-900">Ký số điện tử</h5>
              <p className="text-sm text-gray-600">Ký số từ các bên tham gia</p>
            </div>
            <span className="text-xs text-gray-500 font-medium">Chờ xử lý</span>
          </div>
          
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border-l-4 border-gray-300">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-sm font-medium">
              4
            </div>
            <div className="flex-1">
              <h5 className="text-sm font-medium text-gray-900">Lưu trữ và thông báo</h5>
              <p className="text-sm text-gray-600">Lưu trữ tài liệu và thông báo các bên</p>
            </div>
            <span className="text-xs text-gray-500 font-medium">Chờ xử lý</span>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white border rounded-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">📅 Timeline chi tiết</h4>
        <div className="space-y-4">
          {workflowData.deadlines.map((deadline, index) => (
            <div key={index} className={`flex items-center justify-between p-4 rounded-lg border-l-4 ${
              deadline.urgent ? 'bg-red-50 border-red-500' : 'bg-blue-50 border-blue-500'
            }`}>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h5 className="text-sm font-medium text-gray-900">{deadline.title}</h5>
                  {deadline.urgent && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Khẩn cấp
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">{deadline.description}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{deadline.date}</p>
                <p className="text-xs text-gray-500">
                  {deadline.urgent ? 'Cần xử lý ngay' : 'Có thể linh hoạt'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
