import React from 'react'
import { ExclamationTriangleIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'

interface RiskTabProps {
  data: any
}

export function RiskTab({ data }: RiskTabProps) {
  const risk = data?.risk
  if (!risk) return <div className="text-gray-500">Không có dữ liệu phân tích rủi ro</div>

  const riskLevelColors: Record<string, string> = {
    LOW: 'bg-green-100 text-green-800 border-green-300',
    MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    HIGH: 'bg-red-100 text-red-800 border-red-300',
  }

  const probabilityColors: Record<string, string> = {
    LOW: 'text-green-700',
    MEDIUM: 'text-yellow-700',
    HIGH: 'text-red-700',
  }

  const impactColors: Record<string, string> = {
    LOW: 'text-green-700',
    MEDIUM: 'text-yellow-700',
    HIGH: 'text-red-700',
  }

  const typeColors: Record<string, string> = {
    TECHNICAL: 'bg-blue-100 text-blue-800',
    SCHEDULE: 'bg-purple-100 text-purple-800',
    FINANCIAL: 'bg-green-100 text-green-800',
    LEGAL: 'bg-red-100 text-red-800',
    OPERATIONAL: 'bg-orange-100 text-orange-800',
  }

  return (
    <div className="space-y-6">
      {/* Overall Risk Level */}
      <div className={`rounded-lg border-2 p-6 ${riskLevelColors[risk.riskLevel] || 'bg-gray-100 text-gray-800 border-gray-300'}`}>
        <div className="flex items-center gap-3">
          <ExclamationTriangleIcon className="w-8 h-8" />
          <div>
            <h3 className="text-xl font-bold">Mức rủi ro tổng thể</h3>
            <p className="text-2xl font-bold mt-1">{risk.riskLevel}</p>
          </div>
        </div>
      </div>

      {/* Risk Factors */}
      {risk.factors && risk.factors.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Các yếu tố rủi ro ({risk.factors.length})</h3>

          <div className="space-y-4">
            {risk.factors.map((factor: any, idx: number) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium mb-2 ${typeColors[factor.type] || 'bg-gray-100 text-gray-800'}`}>
                      {factor.type}
                    </span>
                    <h4 className="font-semibold text-base">{factor.description}</h4>
                  </div>
                </div>

                {factor.content && (
                  <div className="bg-gray-50 p-3 rounded text-sm italic text-gray-600 mb-3">
                    {factor.content}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <span className="text-xs text-gray-600">Xác suất:</span>
                    <p className={`font-semibold ${probabilityColors[factor.probability] || 'text-gray-700'}`}>
                      {factor.probability}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-600">Tác động:</span>
                    <p className={`font-semibold ${impactColors[factor.impact] || 'text-gray-700'}`}>
                      {factor.impact}
                    </p>
                  </div>
                </div>

                {factor.riskToParties && factor.riskToParties.length > 0 && (
                  <div className="mb-2">
                    <span className="text-xs text-gray-600">Rủi ro ảnh hưởng đến:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {factor.riskToParties.map((party: any, pIdx: number) => (
                        <span key={pIdx} className="px-2 py-0.5 bg-red-50 text-red-700 rounded text-xs">
                          {party.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {factor.beneficiaries && factor.beneficiaries.length > 0 && (
                  <div>
                    <span className="text-xs text-gray-600">Bên lợi:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {factor.beneficiaries.map((party: any, bIdx: number) => (
                        <span key={bIdx} className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs">
                          {party.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mitigation Proposals */}
      {risk.mitigationProposals && risk.mitigationProposals.length > 0 && (
        <div className="bg-white rounded-lg border border-green-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheckIcon className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-semibold">Đề xuất giảm thiểu rủi ro ({risk.mitigationProposals.length})</h3>
          </div>

          <div className="space-y-3">
            {risk.mitigationProposals.map((proposal: any, idx: number) => (
              <div key={idx} className="border-l-4 border-green-400 pl-4 py-2 bg-green-50">
                <p className="text-sm text-gray-700">{proposal.description || proposal}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
