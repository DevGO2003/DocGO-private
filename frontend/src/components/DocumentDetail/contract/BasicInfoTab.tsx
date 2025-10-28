'use client'

import React from 'react'

interface BasicInfoTabProps {
  documentData: any
}

function getStatusBadgeClass(status: string) {
  switch (status) {
    case 'DRAFT':
      return 'bg-gray-100 text-gray-800'
    case 'PENDING_REVIEW':
      return 'bg-yellow-100 text-yellow-800'
    case 'APPROVED':
      return 'bg-blue-100 text-blue-800'
    case 'ACTIVE':
      return 'bg-green-100 text-green-800'
    case 'EXPIRED':
      return 'bg-red-100 text-red-800'
    case 'TERMINATED':
      return 'bg-red-100 text-red-800'
    case 'ARCHIVED':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

function translateContractType(type: string) {
  const types: { [key: string]: string } = {
    'SERVICE_AGREEMENT': 'Hợp đồng dịch vụ',
    'LEASE_AGREEMENT': 'Hợp đồng thuê',
    'SUPPLY_AGREEMENT': 'Hợp đồng cung cấp',
    'INSURANCE_AGREEMENT': 'Hợp đồng bảo hiểm',
    'EMPLOYMENT_AGREEMENT': 'Hợp đồng lao động',
    'PARTNERSHIP_AGREEMENT': 'Hợp đồng hợp tác',
    'PURCHASE_AGREEMENT': 'Hợp đồng mua bán',
    'OTHER': 'Khác'
  }
  return types[type] || type
}

function translateContractStatus(status: string) {
  const statuses: { [key: string]: string } = {
    'DRAFT': 'Nháp',
    'PENDING_REVIEW': 'Chờ duyệt',
    'APPROVED': 'Đã duyệt',
    'ACTIVE': 'Có hiệu lực',
    'EXPIRED': 'Hết hạn',
    'TERMINATED': 'Chấm dứt',
    'ARCHIVED': 'Lưu trữ'
  }
  return statuses[status] || status
}

export function BasicInfoTab({ documentData }: BasicInfoTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu đề tài liệu</label>
          <input 
            type="text" 
            value={documentData?.title || ''} 
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            readOnly
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Loại tài liệu</label>
          <select 
            value={documentData?.contractType || ''} 
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            disabled
          >
            <option value="SERVICE_AGREEMENT">Hợp đồng dịch vụ</option>
            <option value="LEASE_AGREEMENT">Hợp đồng thuê</option>
            <option value="SUPPLY_AGREEMENT">Hợp đồng cung cấp</option>
            <option value="INSURANCE_AGREEMENT">Hợp đồng bảo hiểm</option>
            <option value="EMPLOYMENT_AGREEMENT">Hợp đồng lao động</option>
            <option value="PARTNERSHIP_AGREEMENT">Hợp đồng hợp tác</option>
            <option value="PURCHASE_AGREEMENT">Hợp đồng mua bán</option>
            <option value="OTHER">Khác</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(documentData?.status)}`}>
            {translateContractStatus(documentData?.status || 'DRAFT')}
          </span>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Ngày tạo</label>
          <input 
            type="text" 
            value={new Date().toLocaleDateString('vi-VN')} 
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
            readOnly
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Ngày có hiệu lực</label>
          <input 
            type="text" 
            value={documentData?.effectiveDate ? new Date(documentData.effectiveDate).toLocaleDateString('vi-VN') : ''} 
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            readOnly
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Ngày hết hạn</label>
          <input 
            type="text" 
            value={documentData?.expiryDate ? new Date(documentData.expiryDate).toLocaleDateString('vi-VN') : ''} 
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            readOnly
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
        <textarea 
          value={documentData?.description || ''} 
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          readOnly
        />
      </div>

      {/* Payment Summary */}
      {documentData?.paymentDetails && (
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="text-lg font-medium text-gray-900 mb-3">Tổng quan thanh toán</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-700">Tổng giá trị:</span>
              <span className="ml-2 text-lg font-bold text-blue-600">
                {documentData.paymentDetails.totalValue?.toLocaleString('vi-VN')} {documentData.paymentDetails.currency}
              </span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">Phương thức thanh toán:</span>
              <span className="ml-2 text-sm text-gray-600">{documentData.paymentDetails.paymentMethod}</span>
            </div>
          </div>
          {documentData.paymentDetails.schedule && (
            <div className="mt-3">
              <span className="text-sm font-medium text-gray-700">Lịch thanh toán:</span>
              <p className="text-sm text-gray-600 mt-1">{documentData.paymentDetails.schedule}</p>
            </div>
          )}
        </div>
      )}

      {/* Quick Statistics */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <span className="text-2xl mr-2">📊</span>
          Thống kê nhanh
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border text-center">
            <div className="text-2xl font-bold text-indigo-600">
              {documentData?.keyClauses?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Điều khoản chính</div>
            <div className="text-xs text-gray-500 mt-1">
              {documentData?.keyClauses?.filter((c: any) => c.importance === 'High').length || 0} quan trọng
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border text-center">
            <div className="text-2xl font-bold text-green-600">
              {documentData?.parties?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Bên tham gia</div>
            <div className="text-xs text-gray-500 mt-1">
              {documentData?.parties?.filter((p: any) => p.role === 'Khách hàng').length || 0} khách hàng
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border text-center">
            <div className="text-2xl font-bold text-orange-600">
              {documentData?.reminders?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Nhắc nhở</div>
            <div className="text-xs text-gray-500 mt-1">
              {documentData?.reminders?.filter((r: any) => new Date(r.date) > new Date()).length || 0} sắp tới
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border text-center">
            <div className="text-2xl font-bold text-purple-600">
              {documentData?.tags?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Nhãn phân loại</div>
            <div className="text-xs text-gray-500 mt-1">
              {documentData?.tags?.filter((t: string) => ['IT', 'AI', 'Cloud'].includes(t)).length || 0} công nghệ
            </div>
          </div>
        </div>
      </div>

      {/* Contract Timeline Progress */}
      {documentData?.effectiveDate && documentData?.expiryDate && (
        <div className="bg-white border rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <span className="text-2xl mr-2">⏱️</span>
            Tiến độ hợp đồng
          </h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-gray-700">Thời gian hiệu lực</div>
              <div className="text-sm text-gray-600">
                {new Date(documentData.effectiveDate).toLocaleDateString('vi-VN')} - {new Date(documentData.expiryDate).toLocaleDateString('vi-VN')}
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${Math.min(100, Math.max(0, 
                    ((new Date().getTime() - new Date(documentData.effectiveDate).getTime()) / 
                     (new Date(documentData.expiryDate).getTime() - new Date(documentData.effectiveDate).getTime())) * 100
                  ))}%` 
                }}
              ></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {Math.ceil((new Date(documentData.expiryDate).getTime() - new Date(documentData.effectiveDate).getTime()) / (1000 * 60 * 60 * 24))} ngày
                </div>
                <div className="text-xs text-gray-500">Tổng thời gian</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {Math.max(0, Math.ceil((new Date(documentData.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} ngày
                </div>
                <div className="text-xs text-gray-500">Còn lại</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {documentData?.status === 'ACTIVE' ? 'Đang hoạt động' : 
                   documentData?.status === 'PENDING_REVIEW' ? 'Chờ duyệt' :
                   documentData?.status === 'EXPIRED' ? 'Hết hạn' : 'Khác'}
                </div>
                <div className="text-xs text-gray-500">Trạng thái</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Risk & Compliance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Risk Assessment */}
        <div className="bg-white border rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <span className="text-2xl mr-2">⚠️</span>
            Đánh giá rủi ro
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Mức độ rủi ro</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                documentData?.riskAssessment?.riskLevel === 'LOW' ? 'bg-green-100 text-green-800' :
                documentData?.riskAssessment?.riskLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {documentData?.riskAssessment?.riskLevel || 'LOW'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Yếu tố rủi ro</span>
              <span className="text-sm text-gray-600">{documentData?.riskAssessment?.riskFactors?.length || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Biện pháp giảm thiểu</span>
              <span className="text-sm text-gray-600">{documentData?.riskAssessment?.mitigationMeasures?.length || 0}</span>
            </div>
          </div>
        </div>

        {/* Compliance Status */}
        <div className="bg-white border rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <span className="text-2xl mr-2">✅</span>
            Tình trạng tuân thủ
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Trạng thái</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                documentData?.complianceStatus?.status === 'COMPLIANT' ? 'bg-green-100 text-green-800' :
                documentData?.complianceStatus?.status === 'NON_COMPLIANT' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {documentData?.complianceStatus?.status === 'COMPLIANT' ? 'Tuân thủ' :
                 documentData?.complianceStatus?.status === 'NON_COMPLIANT' ? 'Không tuân thủ' :
                 'Cần xem xét'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Vấn đề cần giải quyết</span>
              <span className="text-sm text-gray-600">{documentData?.complianceStatus?.issues?.length || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Khuyến nghị</span>
              <span className="text-sm text-gray-600">{documentData?.complianceStatus?.recommendations?.length || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
