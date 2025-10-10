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
    </div>
  )
}
