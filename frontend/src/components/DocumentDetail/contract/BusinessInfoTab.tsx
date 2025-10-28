'use client'

import React from 'react'
import { BuildingOfficeIcon, UserIcon, PhoneIcon, MapPinIcon, CreditCardIcon } from '@heroicons/react/24/outline'

interface BusinessInfoTabProps {
  documentData: any
}

export function BusinessInfoTab({ documentData }: BusinessInfoTabProps) {
  const parties = documentData?.parties || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-medium text-gray-900">Các bên tham gia</h4>
        <span className="text-sm text-gray-500">{parties.length} bên</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {parties.map((party: any, index: number) => (
          <div key={index} className="bg-gray-50 rounded-lg p-6 border">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <BuildingOfficeIcon className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="text-lg font-medium text-gray-900 truncate">{party.name}</h5>
                <p className="text-sm text-indigo-600 font-medium">{party.role}</p>
                
                <div className="mt-4 space-y-3">
                  {party.representative && (
                    <div className="flex items-center text-sm text-gray-600">
                      <UserIcon className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="truncate">Đại diện: {party.representative}</span>
                    </div>
                  )}
                  
                  {party.taxCode && (
                    <div className="flex items-center text-sm text-gray-600">
                      <CreditCardIcon className="w-4 h-4 mr-2 text-gray-400" />
                      <span>MST: {party.taxCode}</span>
                    </div>
                  )}
                  
                  {party.contact && (
                    <div className="flex items-center text-sm text-gray-600">
                      <PhoneIcon className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{party.contact}</span>
                    </div>
                  )}
                  
                  {party.address && (
                    <div className="flex items-start text-sm text-gray-600">
                      <MapPinIcon className="w-4 h-4 mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                      <span className="break-words">{party.address}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Business Information */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Thông tin bổ sung</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-bold text-blue-600">2</span>
            </div>
            <h5 className="text-sm font-medium text-gray-900">Số bên tham gia</h5>
            <p className="text-xs text-gray-500 mt-1">Khách hàng & Nhà cung cấp</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-bold text-green-600">✓</span>
            </div>
            <h5 className="text-sm font-medium text-gray-900">Trạng thái pháp lý</h5>
            <p className="text-xs text-gray-500 mt-1">Đã xác minh thông tin</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-bold text-purple-600">📋</span>
            </div>
            <h5 className="text-sm font-medium text-gray-900">Hồ sơ đầy đủ</h5>
            <p className="text-xs text-gray-500 mt-1">Tất cả giấy tờ hợp lệ</p>
          </div>
        </div>
      </div>

      {/* Contract Timeline */}
      {documentData?.effectiveDate && documentData?.expiryDate && (
        <div className="bg-white border rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Timeline hợp đồng</h4>
          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className="text-sm font-medium text-gray-900">Ngày ký</div>
              <div className="text-xs text-gray-500 mt-1">
                {new Date(documentData.effectiveDate).toLocaleDateString('vi-VN')}
              </div>
            </div>
            <div className="flex-1 mx-4">
              <div className="h-1 bg-gray-200 rounded-full">
                <div className="h-1 bg-blue-500 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-gray-900">Ngày hết hạn</div>
              <div className="text-xs text-gray-500 mt-1">
                {new Date(documentData.expiryDate).toLocaleDateString('vi-VN')}
              </div>
            </div>
          </div>
          <div className="mt-3 text-center">
            <span className="text-sm text-gray-600">
              Thời gian hiệu lực: {Math.ceil((new Date(documentData.expiryDate).getTime() - new Date(documentData.effectiveDate).getTime()) / (1000 * 60 * 60 * 24))} ngày
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
