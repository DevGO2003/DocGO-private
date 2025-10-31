import React from 'react'
import { CalendarIcon, CurrencyDollarIcon, BriefcaseIcon, BuildingOfficeIcon, ExclamationTriangleIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'
import { formatDate, formatCurrency, formatValue, translateEnum } from '@/app/(repositories)/repositories/_utils/formatters'
import { vi } from '@/app/(repositories)/repositories/_i18n/vi'

interface ContractOverviewTabProps {
  data: any
}

export function ContractOverviewTab({ data }: ContractOverviewTabProps) {

  const priorityColors: Record<string, string> = {
    HIGH: 'bg-red-100 text-red-800',
    MEDIUM: 'bg-yellow-100 text-yellow-800',
    LOW: 'bg-green-100 text-green-800',
  }

  const confidentialityColors: Record<string, string> = {
    CONFIDENTIAL: 'bg-red-100 text-red-800',
    INTERNAL: 'bg-yellow-100 text-yellow-800',
    PUBLIC: 'bg-green-100 text-green-800',
    RESTRICTED: 'bg-orange-100 text-orange-800',
  }

  return (
    <div className="space-y-4">
      {/* Contract Dates & Value - Combined */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-indigo-50 to-white rounded-lg border border-indigo-100 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <CalendarIcon className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-semibold text-gray-900">Thời hạn hợp đồng</h3>
          </div>
          <div className="space-y-2">
            <div>
              <label className="text-xs text-gray-500">{vi.contract.effectiveDate}</label>
              <p className="text-base font-semibold text-gray-900">{formatDate(data?.effectiveDate)}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500">{vi.contract.expiryDate}</label>
              <p className="text-base font-semibold text-gray-900">{formatDate(data?.expiryDate)}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-white rounded-lg border border-green-100 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <CurrencyDollarIcon className="w-4 h-4 text-green-600" />
            <h3 className="text-sm font-semibold text-gray-900">Giá trị hợp đồng</h3>
          </div>
          <div className="text-center py-2">
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(data?.totalValue, data?.currency)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Tổng giá trị</p>
          </div>
        </div>
      </div>

      {/* Project, Department, Priority & Confidentiality - Combined */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <BriefcaseIcon className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-semibold text-gray-900">Thông tin dự án</h3>
            </div>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-gray-500">{vi.contract.project}</label>
                <p className="text-sm font-medium text-gray-900">{formatValue(data?.project)}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500">{vi.contract.department}</label>
                <p className="text-sm font-medium text-gray-900">{formatValue(data?.department)}</p>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheckIcon className="w-4 h-4 text-purple-600" />
              <h3 className="text-sm font-semibold text-gray-900">Phân loại</h3>
            </div>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-gray-500">{vi.contract.priority}</label>
                <div className="mt-1">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${priorityColors[data?.priority || ''] || 'bg-gray-100 text-gray-800'}`}>
                    {translateEnum(data?.priority, 'priority')}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500">{vi.contract.confidentiality}</label>
                <div className="mt-1">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${confidentialityColors[data?.confidentiality || ''] || 'bg-gray-100 text-gray-800'}`}>
                    {translateEnum(data?.confidentiality, 'confidentiality')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      {data?.summary && (
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <h3 className="text-sm font-semibold mb-2 text-gray-900">Tóm tắt hợp đồng</h3>
          <p className="text-sm text-gray-700 leading-relaxed">{data.summary}</p>
        </div>
      )}
    </div>
  )
}
