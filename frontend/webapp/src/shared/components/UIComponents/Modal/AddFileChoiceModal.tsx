import React from 'react'
import { createPortal } from 'react-dom'

type AddFileChoiceModalProps = {
  open: boolean
  onCreateNew: () => void
  onUpload: () => void
  onClose: () => void
}

export default function AddFileChoiceModal({ 
  open, 
  onCreateNew, 
  onUpload, 
  onClose 
}: AddFileChoiceModalProps) {
  if (!open || typeof window === 'undefined') return null
  
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="relative rounded-xl border w-full max-w-sm" style={{ borderColor: '#e5e7eb', backgroundColor: '#ffffff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} >
        <div className="p-3 border-b flex items-center justify-between" style={{ borderColor: '#e5e7eb' }} >
          <h3 className="text-sm font-semibold" style={{ color: '#111827' }} >Thêm tài liệu</h3>
          <button onClick={onClose} className="hover:" style={{ color: '#374151', color: '#6b7280' }} >✕</button>
        </div>
        <div className="p-3 space-y-2">
          <button 
            onClick={onCreateNew} 
            className="w-full h-9 rounded-lg border text-sm hover:bg-indigo-50" style={{ color: '#4338ca' }} >
            Tạo file mới
          </button>
          <button 
            onClick={onUpload} 
            className="w-full h-9 rounded-lg border text-sm hover:bg-indigo-50" style={{ color: '#4338ca' }} >
            Upload file
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

