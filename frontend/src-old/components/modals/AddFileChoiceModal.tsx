'use client'

import React from 'react'
import { createPortal } from 'react-dom'

type AddFileChoiceModalProps = {
  open: boolean
  onCreateNew: () => void
  onUpload: () => void
  onClose: () => void
}

export default function AddFileChoiceModal({ open, onCreateNew, onUpload, onClose }: AddFileChoiceModalProps) {
  if (!open || typeof window === 'undefined') return null
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="relative bg-white rounded-xl border border-gray-200 shadow-lg w-full max-w-sm">
        <div className="p-3 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Thêm tài liệu</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <div className="p-3 space-y-2">
          <button onClick={onCreateNew} className="w-full h-9 rounded-lg border border-indigo-300 text-sm text-indigo-700 hover:bg-indigo-50">Tạo file mới</button>
          <button onClick={onUpload} className="w-full h-9 rounded-lg border border-indigo-300 text-sm text-indigo-700 hover:bg-indigo-50">Upload file</button>
        </div>
      </div>
    </div>,
    document.body
  )
}


