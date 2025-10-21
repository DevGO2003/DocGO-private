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
    <div className="space-y-6">
      {/* Contract Dates */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <CalendarIcon className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-semibold">{vi.contract.effectiveDate} & {vi.contract.expiryDate}</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600">{vi.contract.effectiveDate}</label>
            <p className="text-lg font-medium">{formatDate(data?.effectiveDate)}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">{vi.contract.expiryDate}</label>
            <p className="text-lg font-medium">{formatDate(data?.expiryDate)}</p>
          </div>
        </div>
      </div>

      {/* Contract Value */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <CurrencyDollarIcon className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold">Giá trị hợp đồng</h3>
        </div>
        <div className="text-center py-4">
          <p className="text-3xl font-bold text-green-600">
            {formatCurrency(data?.totalValue, data?.currency)}
          </p>
          <p className="text-sm text-gray-600 mt-1">Tổng giá trị</p>
        </div>
      </div>

      {/* Project & Department */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <BriefcaseIcon className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold">{vi.contract.project} & {vi.contract.department}</h3>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-600">{vi.contract.project}</label>
            <p className="font-medium">{formatValue(data?.project)}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">{vi.contract.department}</label>
            <p className="font-medium">{formatValue(data?.department)}</p>
          </div>
        </div>
      </div>

      {/* Priority & Confidentiality */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheckIcon className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold">{vi.contract.priority} & {vi.contract.confidentiality}</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600">{vi.contract.priority}</label>
            <div className="mt-1">
              <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${priorityColors[data?.priority || ''] || 'bg-gray-100 text-gray-800'}`}>
                {translateEnum(data?.priority, 'priority')}
              </span>
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-600">{vi.contract.confidentiality}</label>
            <div className="mt-1">
              <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${confidentialityColors[data?.confidentiality || ''] || 'bg-gray-100 text-gray-800'}`}>
                {translateEnum(data?.confidentiality, 'confidentiality')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      {data?.summary && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-3">Tóm tắt hợp đồng</h3>
          <p className="text-gray-700 leading-relaxed">{data.summary}</p>
        </div>
      )}
    </div>
  )
}
