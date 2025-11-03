import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

type DateTime = string | undefined
type TimeRange = { from?: DateTime; to?: DateTime }

type TimeRangeModalProps = {
  open: boolean
  title?: string
  value?: TimeRange
  onChange?: (next: TimeRange) => void
  onClose: () => void
  anchorEl?: HTMLElement | null
}

export default function TimeRangeModal({ 
  open, 
  title = 'Thời gian', 
  value, 
  onChange, 
  onClose, 
  anchorEl 
}: TimeRangeModalProps) {
  const [local, setLocal] = useState<TimeRange>({ from: value?.from, to: value?.to })
  const panelRef = useRef<HTMLDivElement | null>(null)

  const setField = (key: keyof TimeRange, v?: string) => {
    const next = { ...local, [key]: v }
    setLocal(next)
    onChange?.(next)
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
    <div ref={panelRef} className="fixed rounded-xl border" style={{ borderColor: '#e5e7eb', backgroundColor: '#ffffff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', top, left, width, height }}>
      <div className="p-3 border-b flex items-center justify-between" style={{ borderColor: '#e5e7eb' }} >
        <h3 className="text-sm font-semibold" style={{ color: '#111827' }} >{title}</h3>
        <button onClick={onClose} className="hover:" style={{ color: '#374151', color: '#6b7280' }} >✕</button>
      </div>
      <div className="p-3 space-y-3">
        <div>
          <label className="block text-sm mb-1" style={{ color: '#374151' }} >Từ</label>
          <input 
            type="datetime-local" 
            value={local.from || ''} 
            onChange={(e)=>setField('from', e.target.value || undefined)} 
            className="w-full h-9 px-2 rounded-lg border text-sm focus:ring-2 focus:ring-indigo-500 focus:" style={{ borderColor: '#d1d5db' }} />
        </div>
        <div>
          <label className="block text-sm mb-1" style={{ color: '#374151' }} >Đến</label>
          <input 
            type="datetime-local" 
            value={local.to || ''} 
            onChange={(e)=>setField('to', e.target.value || undefined)} 
            className="w-full h-9 px-2 rounded-lg border text-sm focus:ring-2 focus:ring-indigo-500 focus:" style={{ borderColor: '#d1d5db' }} />
        </div>
        {local.from && local.to && new Date(local.from) > new Date(local.to) && (
          <div className="text-xs text-rose-600">Thời điểm bắt đầu phải nhỏ hơn hoặc bằng thời điểm kết thúc.</div>
        )}
      </div>
    </div>,
    document.body
  )
}

