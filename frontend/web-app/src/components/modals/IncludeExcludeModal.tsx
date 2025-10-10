'use client'

import React, { useMemo, useState } from 'react'

type IncludeExcludeModalProps = {
  open: boolean
  title: string
  availableItems: string[]
  include: string[]
  exclude: string[]
  onChange: (include: string[], exclude: string[]) => void
  onClose: () => void
}

export default function IncludeExcludeModal({ open, title, availableItems, include, exclude, onChange, onClose }: IncludeExcludeModalProps) {
  const [tab, setTab] = useState<'include' | 'exclude'>('include')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    if (!query) return availableItems
    const q = query.toLowerCase()
    return availableItems.filter(x => x.toLowerCase().includes(q))
  }, [availableItems, query])

  const toggle = (item: string) => {
    if (tab === 'include') {
      const inOther = exclude.includes(item)
      const newExclude = inOther ? exclude.filter(x => x !== item) : exclude
      const isIn = include.includes(item)
      const newInclude = isIn ? include.filter(x => x !== item) : [...include, item]
      onChange(newInclude, newExclude)
    } else {
      const inOther = include.includes(item)
      const newInclude = inOther ? include.filter(x => x !== item) : include
      const isIn = exclude.includes(item)
      const newExclude = isIn ? exclude.filter(x => x !== item) : [...exclude, item]
      onChange(newInclude, newExclude)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-xl border border-gray-200 shadow-lg w-full max-w-xl">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <div className="px-4 pt-3">
          <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
            <button onClick={() => setTab('include')} className={`px-3 py-1.5 text-sm ${tab==='include'?'bg-indigo-600 text-white':'bg-white text-gray-700 hover:bg-gray-50'}`}>Bao gồm</button>
            <button onClick={() => setTab('exclude')} className={`px-3 py-1.5 text-sm border-l border-gray-200 ${tab==='exclude'?'bg-indigo-600 text-white':'bg-white text-gray-700 hover:bg-gray-50'}`}>Loại bỏ</button>
          </div>
        </div>
        <div className="px-4 py-3">
          <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Tìm kiếm..." className="w-full h-9 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm" />
          <div className="mt-3 max-h-64 overflow-auto">
            {filtered.length === 0 ? (
              <div className="text-sm text-gray-500 py-6 text-center">Không có mục phù hợp</div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {filtered.map(item => {
                  const checked = tab==='include' ? include.includes(item) : exclude.includes(item)
                  return (
                    <li key={item} className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-700">{item}</span>
                      <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                        <input type="checkbox" checked={checked} onChange={() => toggle(item)} className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                      </label>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
        <div className="px-4 pb-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50">Đóng</button>
        </div>
      </div>
    </div>
  )
}


