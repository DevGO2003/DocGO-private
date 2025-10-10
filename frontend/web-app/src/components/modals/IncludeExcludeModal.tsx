'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

type IncludeExcludeModalProps = {
  open: boolean
  title: string
  availableItems: string[]
  include: string[]
  exclude: string[]
  onChange: (include: string[], exclude: string[]) => void
  onClose: () => void
  anchorEl?: HTMLElement | null
}

export default function IncludeExcludeModal({ open, title, availableItems, include, exclude, onChange, onClose, anchorEl }: IncludeExcludeModalProps) {
  const [tab, setTab] = useState<'include' | 'exclude'>('include')
  const [query, setQuery] = useState('')
  const panelRef = useRef<HTMLDivElement | null>(null)

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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node
      if (panelRef.current && !panelRef.current.contains(t) && anchorEl && !anchorEl.contains(t)) onClose()
    }
    if (open) {
      document.addEventListener('keydown', onKey)
      document.addEventListener('mousedown', onClick)
    }
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onClick)
    }
  }, [open, onClose, anchorEl])

  if (!open || typeof window === 'undefined' || !anchorEl) return null

  const width = 300
  const height = 500
  const rect = anchorEl.getBoundingClientRect()
  const top = Math.min(window.scrollY + rect.bottom + 6, window.scrollY + window.innerHeight - height - 8)
  const left = Math.min(window.scrollX + rect.left, window.scrollX + window.innerWidth - width - 8)

  return createPortal(
    <div ref={panelRef} className="fixed z-[100] bg-white rounded-xl border border-gray-200 shadow-lg" style={{ top, left, width, height }}>
      <div className="p-3 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
      </div>
      <div className="px-3 pt-2">
        <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
          <button onClick={() => setTab('include')} className={`px-3 py-1.5 text-xs ${tab==='include'?'bg-indigo-600 text-white':'bg-white text-gray-700 hover:bg-gray-50'}`}>Bao gồm</button>
          <button onClick={() => setTab('exclude')} className={`px-3 py-1.5 text-xs border-l border-gray-200 ${tab==='exclude'?'bg-indigo-600 text-white':'bg-white text-gray-700 hover:bg-gray-50'}`}>Loại bỏ</button>
        </div>
      </div>
      <div className="px-3 py-2">
        <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Tìm kiếm..." className="w-full h-8 px-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-xs" />
        <div className="mt-2 overflow-auto" style={{ maxHeight: height - 150 }}>
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
      <div className="px-3 pb-3 flex justify-end gap-2">
        <button onClick={onClose} className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs text-gray-700 hover:bg-gray-50">Đóng</button>
      </div>
    </div>,
    document.body
  )
}


