'use client'

import React from 'react'
import { ExclamationTriangleIcon, CheckCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline'

type RecommendationType = 'warning' | 'error' | 'info' | 'success'

export interface Recommendation {
  type: RecommendationType
  title: string
  description: string
  action?: string
}

export interface AIAnalysisCardProps {
  riskLevel: string
  confidence: number
  warnings: number
  recommendations: Recommendation[]
  keyClauses: any[]
}

export function AIAnalysisCard({ riskLevel, confidence, warnings, recommendations, keyClauses }: AIAnalysisCardProps) {
  const riskColor: Record<string, string> = {
    LOW: 'text-green-600',
    MEDIUM: 'text-yellow-600',
    HIGH: 'text-red-600',
  }

  const badge = riskColor[riskLevel] || 'text-gray-600'

  return (
    <div className="space-y-6">
      <div className="rounded-lg border p-6 bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Đánh giá rủi ro AI</h3>
          <div className={`text-sm font-medium ${badge}`}>{riskLevel}</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className={`text-3xl font-bold ${badge}`}>{riskLevel}</div>
            <div className="text-sm text-gray-600">Mức rủi ro</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{confidence}%</div>
            <div className="text-sm text-gray-600">Độ tin cậy</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">{warnings}</div>
            <div className="text-sm text-gray-600">Cảnh báo</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
          <InformationCircleIcon className="h-5 w-5 text-blue-500 mr-2" />
          Điều khoản quan trọng
        </h4>
        <div className="space-y-2">
          {keyClauses?.map((c: any, idx: number) => (
            <div key={idx} className="p-3 rounded bg-gray-50 text-sm text-gray-700">
              <span className="font-medium">{c.name}:</span> {c.description}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
          <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
          Khuyến nghị AI
        </h4>
        <div className="space-y-2">
          {recommendations?.map((r, idx) => (
            <div
              key={idx}
              className={`p-3 rounded border-l-4 text-sm ${
                r.type === 'warning'
                  ? 'bg-yellow-50 border-yellow-400'
                  : r.type === 'error'
                  ? 'bg-red-50 border-red-400'
                  : r.type === 'info'
                  ? 'bg-blue-50 border-blue-400'
                  : 'bg-green-50 border-green-400'
              }`}
            >
              <div className="font-medium text-gray-900">{r.title}</div>
              <div className="text-gray-700">{r.description}</div>
              {r.action && <div className="text-gray-500 text-xs mt-1">Hành động: {r.action}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
