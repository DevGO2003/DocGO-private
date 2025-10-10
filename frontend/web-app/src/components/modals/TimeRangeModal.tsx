'use client'

import React, { useState } from 'react'

type DateTime = string | undefined // ISO string compatible with input[type=datetime-local]

type TimeRange = {
  from?: DateTime
  to?: DateTime
}

type TimeRangeModalProps = {
  open: boolean
  title?: string
  value?: TimeRange
  onChange?: (next: TimeRange) => void
  onClose: () => void
}

export default function TimeRangeModal({ open, title = 'Thời gian', value, onChange, onClose }: TimeRangeModalProps) {
  const [local, setLocal] = useState<TimeRange>({ from: value?.from, to: value?.to })

  const setField = (key: keyof TimeRange, v?: string) => {
    const next = { ...local, [key]: v }
    setLocal(next)
    onChange?.(next)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-xl border border-gray-200 shadow-lg w-full max-w-md">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Từ</label>
            <input
              type="datetime-local"
              value={local.from || ''}
              onChange={(e)=>setField('from', e.target.value || undefined)}
              className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Đến</label>
            <input
              type="datetime-local"
              value={local.to || ''}
              onChange={(e)=>setField('to', e.target.value || undefined)}
              className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          {local.from && local.to && new Date(local.from) > new Date(local.to) && (
            <div className="text-xs text-rose-600">Thời điểm bắt đầu phải nhỏ hơn hoặc bằng thời điểm kết thúc.</div>
          )}
        </div>
        <div className="px-4 pb-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50">Đóng</button>
        </div>
      </div>
    </div>
  )
}


