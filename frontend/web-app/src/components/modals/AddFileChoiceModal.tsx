'use client'

import React from 'react'

type AddFileChoiceModalProps = {
  open: boolean
  onCreateNew: () => void
  onUpload: () => void
  onClose: () => void
}

export default function AddFileChoiceModal({ open, onCreateNew, onUpload, onClose }: AddFileChoiceModalProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-xl border border-gray-200 shadow-lg w-full max-w-sm">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">Thêm tài liệu</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <div className="p-4 space-y-3">
          <button onClick={onCreateNew} className="w-full h-10 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50">Tạo file mới</button>
          <button onClick={onUpload} className="w-full h-10 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50">Upload file</button>
        </div>
        <div className="px-4 pb-4 flex justify-end">
          <button onClick={onClose} className="px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50">Đóng</button>
        </div>
      </div>
    </div>
  )
}


