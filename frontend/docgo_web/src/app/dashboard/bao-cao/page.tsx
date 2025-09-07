'use client'

import React, { useState } from 'react'
import { DashboardLayout } from '@/components/layout'

interface ReportTemplate {
  id: string
  name: string
  description: string
  category: 'CONTRACT' | 'USER' | 'SYSTEM' | 'FINANCIAL'
  format: 'PDF' | 'EXCEL' | 'CSV'
  parameters: {
    name: string
    type: 'date' | 'select' | 'text' | 'number'
    required: boolean
    options?: string[]
    label: string
  }[]
}

export default function BaoCaoPage() {
  const [activeTab, setActiveTab] = useState<'templates' | 'history' | 'scheduled'>('templates')
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [reportParams, setReportParams] = useState<Record<string, any>>({})
  const [generating, setGenerating] = useState(false)

  const reportTemplates: ReportTemplate[] = [
    {
      id: '1',
      name: 'Báo cáo hợp đồng theo tháng',
      description: 'Thống kê tất cả hợp đồng được tạo trong tháng với chi tiết trạng thái',
      category: 'CONTRACT',
      format: 'PDF',
      parameters: [
        { name: 'month', type: 'select', required: true, label: 'Tháng', options: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'] },
        { name: 'year', type: 'number', required: true, label: 'Năm' },
        { name: 'status', type: 'select', required: false, label: 'Trạng thái', options: ['DRAFT', 'PENDING', 'ACTIVE', 'EXPIRED', 'CANCELLED'] }
      ]
    },
    {
      id: '2',
      name: 'Báo cáo tài chính hợp đồng',
      description: 'Tổng hợp giá trị hợp đồng và doanh thu theo khoảng thời gian',
      category: 'FINANCIAL',
      format: 'EXCEL',
      parameters: [
        { name: 'startDate', type: 'date', required: true, label: 'Từ ngày' },
        { name: 'endDate', type: 'date', required: true, label: 'Đến ngày' },
        { name: 'contractType', type: 'select', required: false, label: 'Loại hợp đồng', options: ['Hợp đồng lao động', 'Hợp đồng mua bán', 'Hợp đồng dịch vụ'] }
      ]
    },
    {
      id: '3',
      name: 'Báo cáo hoạt động người dùng',
      description: 'Thống kê hoạt động đăng nhập và sử dụng hệ thống của người dùng',
      category: 'USER',
      format: 'PDF',
      parameters: [
        { name: 'startDate', type: 'date', required: true, label: 'Từ ngày' },
        { name: 'endDate', type: 'date', required: true, label: 'Đến ngày' },
        { name: 'department', type: 'select', required: false, label: 'Phòng ban', options: ['IT', 'HR', 'Finance', 'Legal', 'Operations'] }
      ]
    },
    {
      id: '4',
      name: 'Báo cáo hiệu suất hệ thống',
      description: 'Thống kê hiệu suất và tình trạng hoạt động của hệ thống',
      category: 'SYSTEM',
      format: 'CSV',
      parameters: [
        { name: 'startDate', type: 'date', required: true, label: 'Từ ngày' },
        { name: 'endDate', type: 'date', required: true, label: 'Đến ngày' },
        { name: 'includeErrors', type: 'select', required: false, label: 'Bao gồm lỗi', options: ['Yes', 'No'] }
      ]
    },
    {
      id: '5',
      name: 'Báo cáo phê duyệt hợp đồng',
      description: 'Thống kê quá trình phê duyệt hợp đồng và thời gian xử lý',
      category: 'CONTRACT',
      format: 'PDF',
      parameters: [
        { name: 'startDate', type: 'date', required: true, label: 'Từ ngày' },
        { name: 'endDate', type: 'date', required: true, label: 'Đến ngày' },
        { name: 'approver', type: 'text', required: false, label: 'Người phê duyệt' }
      ]
    },
    {
      id: '6',
      name: 'Báo cáo chữ ký điện tử',
      description: 'Thống kê việc sử dụng chữ ký điện tử và thời gian hoàn thành',
      category: 'CONTRACT',
      format: 'EXCEL',
      parameters: [
        { name: 'startDate', type: 'date', required: true, label: 'Từ ngày' },
        { name: 'endDate', type: 'date', required: true, label: 'Đến ngày' },
        { name: 'signatureType', type: 'select', required: false, label: 'Loại chữ ký', options: ['Digital', 'Biometric', 'OTP'] }
      ]
    }
  ]

  const mockReportHistory = [
    {
      id: '1',
      templateName: 'Báo cáo hợp đồng theo tháng',
      generatedAt: '2024-01-15T10:30:00Z',
      generatedBy: 'Nguyễn Văn A',
      status: 'COMPLETED',
      downloadUrl: '/reports/contract-report-jan-2024.pdf',
      parameters: { month: '1', year: '2024' }
    },
    {
      id: '2',
      templateName: 'Báo cáo tài chính hợp đồng',
      generatedAt: '2024-01-14T15:20:00Z',
      generatedBy: 'Trần Thị B',
      status: 'COMPLETED',
      downloadUrl: '/reports/financial-report-q1-2024.xlsx',
      parameters: { startDate: '2024-01-01', endDate: '2024-03-31' }
    },
    {
      id: '3',
      templateName: 'Báo cáo hoạt động người dùng',
      generatedAt: '2024-01-13T09:15:00Z',
      generatedBy: 'Lê Văn C',
      status: 'FAILED',
      downloadUrl: null,
      parameters: { startDate: '2024-01-01', endDate: '2024-01-31' }
    }
  ]

  const mockScheduledReports = [
    {
      id: '1',
      templateName: 'Báo cáo hợp đồng theo tháng',
      schedule: 'MONTHLY',
      nextRun: '2024-02-01T00:00:00Z',
      recipients: ['admin@docgo.com', 'manager@docgo.com'],
      status: 'ACTIVE'
    },
    {
      id: '2',
      templateName: 'Báo cáo tài chính hợp đồng',
      schedule: 'WEEKLY',
      nextRun: '2024-01-22T00:00:00Z',
      recipients: ['finance@docgo.com'],
      status: 'ACTIVE'
    }
  ]

  const handleGenerateReport = async () => {
    if (!selectedTemplate) return
    
    setGenerating(true)
    try {
      // Mock report generation
      await new Promise(resolve => setTimeout(resolve, 3000))
      alert('Báo cáo đã được tạo thành công!')
    } catch (error) {
      alert('Có lỗi xảy ra khi tạo báo cáo')
    } finally {
      setGenerating(false)
    }
  }

  const getCategoryIcon = (category: ReportTemplate['category']) => {
    switch (category) {
      case 'CONTRACT':
        return '📄'
      case 'USER':
        return '👥'
      case 'SYSTEM':
        return '⚙️'
      case 'FINANCIAL':
        return '💰'
      default:
        return '📊'
    }
  }

  const getCategoryColor = (category: ReportTemplate['category']) => {
    switch (category) {
      case 'CONTRACT':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'USER':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'SYSTEM':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'FINANCIAL':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getFormatIcon = (format: ReportTemplate['format']) => {
    switch (format) {
      case 'PDF':
        return '📄'
      case 'EXCEL':
        return '📊'
      case 'CSV':
        return '📋'
      default:
        return '📄'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const selectedTemplateData = reportTemplates.find(t => t.id === selectedTemplate)

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto px-2 sm:px-4">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl border bg-white shadow-sm ring-1 ring-gray-100">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-50 via-orange-50 to-red-50 opacity-50" />
          <div className="relative px-6 py-6">
            <h1 className="text-2xl font-bold text-gray-900">Báo cáo</h1>
            <p className="mt-1 text-gray-600">Tạo và quản lý các báo cáo chi tiết của hệ thống.</p>
          </div>
          <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500" />
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 rounded-lg bg-gray-100 p-1">
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === 'templates'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📋 Mẫu báo cáo
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === 'history'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📚 Lịch sử
          </button>
          <button
            onClick={() => setActiveTab('scheduled')}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === 'scheduled'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            ⏰ Đã lên lịch
          </button>
        </div>

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Templates List */}
            <div className="lg:col-span-2">
              <div className="rounded-2xl border bg-white shadow-sm ring-1 ring-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Mẫu báo cáo có sẵn</h2>
                <div className="space-y-4">
                  {reportTemplates.map((template) => (
                    <div
                      key={template.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        selectedTemplate === template.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedTemplate(template.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">{getCategoryIcon(template.category)}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-gray-900">{template.name}</h3>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(template.category)}`}>
                              {template.category === 'CONTRACT' ? 'Hợp đồng' :
                               template.category === 'USER' ? 'Người dùng' :
                               template.category === 'SYSTEM' ? 'Hệ thống' : 'Tài chính'}
                            </span>
                            <span className="text-lg">{getFormatIcon(template.format)}</span>
                          </div>
                          <p className="text-sm text-gray-600">{template.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Parameters Panel */}
            <div className="space-y-6">
              {selectedTemplateData ? (
                <div className="rounded-2xl border bg-white shadow-sm ring-1 ring-gray-100 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Tham số báo cáo</h2>
                  <div className="space-y-4">
                    {selectedTemplateData.parameters.map((param, index) => (
                      <div key={index}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {param.label} {param.required && <span className="text-red-500">*</span>}
                        </label>
                        {param.type === 'date' && (
                          <input
                            type="date"
                            value={reportParams[param.name] || ''}
                            onChange={(e) => setReportParams(prev => ({ ...prev, [param.name]: e.target.value }))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        )}
                        {param.type === 'select' && (
                          <select
                            value={reportParams[param.name] || ''}
                            onChange={(e) => setReportParams(prev => ({ ...prev, [param.name]: e.target.value }))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Chọn {param.label.toLowerCase()}</option>
                            {param.options?.map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        )}
                        {param.type === 'text' && (
                          <input
                            type="text"
                            value={reportParams[param.name] || ''}
                            onChange={(e) => setReportParams(prev => ({ ...prev, [param.name]: e.target.value }))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={`Nhập ${param.label.toLowerCase()}`}
                          />
                        )}
                        {param.type === 'number' && (
                          <input
                            type="number"
                            value={reportParams[param.name] || ''}
                            onChange={(e) => setReportParams(prev => ({ ...prev, [param.name]: e.target.value }))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={`Nhập ${param.label.toLowerCase()}`}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleGenerateReport}
                    disabled={generating}
                    className="w-full mt-6 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {generating ? 'Đang tạo báo cáo...' : 'Tạo báo cáo'}
                  </button>
                </div>
              ) : (
                <div className="rounded-2xl border bg-white shadow-sm ring-1 ring-gray-100 p-6">
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">📊</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Chọn mẫu báo cáo</h3>
                    <p className="text-gray-600">Chọn một mẫu báo cáo từ danh sách bên trái để bắt đầu tạo báo cáo.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="rounded-2xl border bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Lịch sử báo cáo</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Tên báo cáo</th>
                    <th className="px-4 py-3 text-left font-medium">Người tạo</th>
                    <th className="px-4 py-3 text-left font-medium">Thời gian tạo</th>
                    <th className="px-4 py-3 text-left font-medium">Trạng thái</th>
                    <th className="px-4 py-3 text-left font-medium">Tham số</th>
                    <th className="px-4 py-3 text-right font-medium">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {mockReportHistory.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {report.templateName}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {report.generatedBy}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {formatDate(report.generatedAt)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                          report.status === 'COMPLETED' 
                            ? 'bg-green-100 text-green-800 border-green-200'
                            : 'bg-red-100 text-red-800 border-red-200'
                        }`}>
                          {report.status === 'COMPLETED' ? 'Hoàn thành' : 'Thất bại'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        <div className="text-xs">
                          {Object.entries(report.parameters).map(([key, value]) => (
                            <div key={key}>{key}: {value}</div>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {report.downloadUrl && (
                          <a
                            href={report.downloadUrl}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Tải xuống
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Scheduled Tab */}
        {activeTab === 'scheduled' && (
          <div className="rounded-2xl border bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Báo cáo đã lên lịch</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Tên báo cáo</th>
                    <th className="px-4 py-3 text-left font-medium">Lịch trình</th>
                    <th className="px-4 py-3 text-left font-medium">Chạy tiếp theo</th>
                    <th className="px-4 py-3 text-left font-medium">Người nhận</th>
                    <th className="px-4 py-3 text-left font-medium">Trạng thái</th>
                    <th className="px-4 py-3 text-right font-medium">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {mockScheduledReports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {report.templateName}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {report.schedule === 'MONTHLY' ? 'Hàng tháng' : 'Hàng tuần'}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {formatDate(report.nextRun)}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        <div className="text-xs">
                          {report.recipients.map(email => (
                            <div key={email}>{email}</div>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                          report.status === 'ACTIVE' 
                            ? 'bg-green-100 text-green-800 border-green-200'
                            : 'bg-gray-100 text-gray-800 border-gray-200'
                        }`}>
                          {report.status === 'ACTIVE' ? 'Hoạt động' : 'Tạm dừng'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="text-blue-600 hover:text-blue-800 text-sm">
                            Chỉnh sửa
                          </button>
                          <button className="text-red-600 hover:text-red-800 text-sm">
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
