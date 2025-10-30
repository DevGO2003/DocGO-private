import React from 'react'
import { CheckBadgeIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

interface ClausesTabProps {
  data: any
}

export function ClausesTab({ data }: ClausesTabProps) {
  const clauses = data?.clauses
  if (!clauses) return <div className="text-gray-500">Không có dữ liệu điều khoản</div>

  const riskColors: Record<string, string> = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
  }

  const importanceColors: Record<string, string> = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-purple-100 text-purple-800',
  }

  return (
    <div className="space-y-3">
      {/* Key Clauses */}
      {clauses.key && clauses.key.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <CheckBadgeIcon className="w-4 h-4 text-green-600" />
            <h3 className="text-sm font-semibold text-gray-900">Điều khoản chính ({clauses.key.length})</h3>
          </div>

          <div className="space-y-2">
            {clauses.key.map((clause: any, idx: number) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow bg-gradient-to-r from-green-50 to-white">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-sm text-gray-900">{clause.name}</h4>
                  <div className="flex gap-1">
                    {clause.importance && (
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${importanceColors[clause.importance.toLowerCase()] || 'bg-gray-100 text-gray-800'}`}>
                        {clause.importance}
                      </span>
                    )}
                    {clause.risk && (
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${riskColors[clause.risk.toLowerCase()] || 'bg-gray-100 text-gray-800'}`}>
                        {clause.risk}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-gray-700 mb-2">{clause.description}</p>

                {clause.content && (
                  <div className="bg-white p-2 rounded text-xs italic text-gray-600 mb-2 border border-gray-200">
                    {clause.content}
                  </div>
                )}

                {clause.advice && (
                  <div className="bg-blue-50 p-2 rounded text-xs border border-blue-200">
                    <span className="font-medium text-blue-900">💡 </span>
                    <span className="text-blue-800">{clause.advice}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unfavorable Clauses */}
      {clauses.unfavorable && clauses.unfavorable.length > 0 && (
        <div className="bg-white rounded-lg border border-red-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />
            <h3 className="text-sm font-semibold text-red-900">Điều khoản bất lợi ({clauses.unfavorable.length})</h3>
          </div>

          <div className="space-y-2">
            {clauses.unfavorable.map((clause: any, idx: number) => (
              <div key={idx} className="border border-red-200 rounded-lg p-3 bg-gradient-to-r from-red-50 to-white">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-sm text-red-900">{clause.name}</h4>
                  {clause.risk && (
                    <span className={`px-2 py-1 rounded text-xs font-medium ${riskColors[clause.risk.toLowerCase()] || 'bg-gray-100 text-gray-800'}`}>
                      Risk: {clause.risk}
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-700 mb-2">{clause.description}</p>

                {clause.content && (
                  <div className="bg-white p-3 rounded text-sm italic text-gray-600 mb-2 border border-red-100">
                    {clause.content}
                  </div>
                )}

                {clause.advice && (
                  <div className="bg-yellow-50 p-3 rounded text-sm border border-yellow-200">
                    <span className="font-medium text-yellow-900">⚠️ Khuyến nghị: </span>
                    <span className="text-yellow-800">{clause.advice}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Other Clauses */}
      {(clauses.intellectualProperty || clauses.confidentiality || clauses.warranty || clauses.termination) && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Điều khoản khác</h3>
          
          <div className="space-y-3">
            {clauses.intellectualProperty && (
              <div className="border-l-4 border-purple-400 pl-4 py-2">
                <h4 className="font-medium text-sm text-gray-700 mb-1">Sở hữu trí tuệ</h4>
                <p className="text-sm text-gray-600">{clauses.intellectualProperty}</p>
              </div>
            )}
            {clauses.confidentiality && (
              <div className="border-l-4 border-blue-400 pl-4 py-2">
                <h4 className="font-medium text-sm text-gray-700 mb-1">Bảo mật</h4>
                <p className="text-sm text-gray-600">{clauses.confidentiality}</p>
              </div>
            )}
            {clauses.warranty && (
              <div className="border-l-4 border-green-400 pl-4 py-2">
                <h4 className="font-medium text-sm text-gray-700 mb-1">Bảo hành</h4>
                <p className="text-sm text-gray-600">{clauses.warranty}</p>
              </div>
            )}
            {clauses.termination && (
              <div className="border-l-4 border-red-400 pl-4 py-2">
                <h4 className="font-medium text-sm text-gray-700 mb-1">Chấm dứt hợp đồng</h4>
                <p className="text-sm text-gray-600">{clauses.termination}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
