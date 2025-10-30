'use client'

import React from 'react'
import { CheckCircleIcon, ClockIcon, ArrowRightIcon } from '@heroicons/react/24/outline'

export interface WorkflowCardProps {
  currentStage: string
  progress: number
  nextActions: string[]
  deadlines: { title: string; description: string; date: string; urgent?: boolean }[]
  assignments: { task: string; assignee: string; status: 'completed' | 'in-progress' | 'pending' }[]
}

export function WorkflowCard({ currentStage, progress, nextActions, deadlines, assignments }: WorkflowCardProps) {
  const stages = [
    { id: 'draft', name: 'Nháp' },
    { id: 'review', name: 'Phê duyệt' },
    { id: 'sign', name: 'Ký số' },
    { id: 'active', name: 'Hiệu lực' },
    { id: 'archive', name: 'Lưu trữ' }
  ]

  const getStatus = (id: string) => {
    const idx = stages.findIndex(s => s.id === id)
    const cur = stages.findIndex(s => s.id === currentStage)
    if (idx < cur) return 'completed'
    if (idx === cur) return 'current'
    return 'upcoming'
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Tiến độ quy trình</h3>
          <span className="text-sm text-gray-500">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${progress}%` }} />
        </div>
        <div className="space-y-3">
          {stages.map((s, i) => {
            const status = getStatus(s.id)
            const isLast = i === stages.length - 1
            return (
              <div key={s.id} className="flex items-center">
                {status === 'completed' ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                ) : status === 'current' ? (
                  <ClockIcon className="h-5 w-5 text-blue-500" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                )}
                <div className={`ml-3 text-sm px-2 py-1 rounded-full ${
                  status === 'completed'
                    ? 'bg-green-50 text-green-700'
                    : status === 'current'
                    ? 'bg-blue-50 text-blue-700'
                    : 'bg-gray-50 text-gray-600'
                }`}>{s.name}</div>
                {!isLast && <ArrowRightIcon className="h-4 w-4 text-gray-400 mx-4" />}
              </div>
            )
          })}
        </div>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-3">Hành động tiếp theo</h4>
        <div className="space-y-2">
          {nextActions.map((a, idx) => (
            <div key={idx} className="p-3 bg-blue-50 rounded flex items-center justify-between text-sm">
              <div className="text-blue-700">{a}</div>
              <button className="text-blue-600 hover:text-blue-800">Thực hiện</button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-3">Mốc thời gian</h4>
        <div className="space-y-2">
          {deadlines.map((d, idx) => (
            <div key={idx} className="p-3 bg-gray-50 rounded flex items-center justify-between text-sm">
              <div>
                <div className="font-medium text-gray-900">{d.title}</div>
                <div className="text-gray-600">{d.description}</div>
              </div>
              <div className="text-right">
                <div className="font-medium">{d.date}</div>
                <div className={`text-xs ${d.urgent ? 'text-red-600' : 'text-gray-500'}`}>{d.urgent ? 'Khẩn cấp' : 'Bình thường'}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
