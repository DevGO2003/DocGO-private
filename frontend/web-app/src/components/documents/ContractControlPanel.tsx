'use client'

import React from 'react'
import Link from 'next/link'

interface ContractControlPanelProps {
  selectedItems: string[]
  onRefresh: () => void
  onCreateContract: () => void
  onEditSelected: () => void
  onDeleteSelected: () => void
  onSendForApproval: () => void
  onClearSelection: () => void
}

export default function ContractControlPanel({
  selectedItems,
  onRefresh,
  onCreateContract,
  onEditSelected,
  onDeleteSelected,
  onSendForApproval,
  onClearSelection
}: ContractControlPanelProps) {
  const hasSelection = selectedItems.length > 0

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onRefresh}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-50 text-xs"
            title="Làm mới danh sách hợp đồng"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="font-medium">Làm mới</span>
          </button>
          
          <Link 
            href="/upload-document" 
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 text-xs"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="font-medium">Tạo hợp đồng</span>
          </Link>
      </div>

      {/* Selection Actions */}
        {hasSelection && (
          <div className="mt-3 rounded-lg border border-gray-200 p-3">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                <span className="font-semibold">{selectedItems.length} hợp đồng đã chọn</span>
              </div>
              <button
                onClick={onClearSelection}
                className="text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 px-2 py-1 rounded"
              >
                Bỏ chọn tất cả
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  onClick={onEditSelected}
                  className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 text-xs font-medium"
                  title="Chỉnh sửa hợp đồng đã chọn"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Chỉnh sửa ({selectedItems.length})</span>
                </button>
                
                <button
                  onClick={onSendForApproval}
                  className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-md bg-green-600 text-white hover:bg-green-700 text-xs font-medium"
                  title="Gửi duyệt hợp đồng đã chọn"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Gửi duyệt ({selectedItems.length})</span>
                </button>
                
                <button
                  onClick={onDeleteSelected}
                  className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-md bg-red-600 text-white hover:bg-red-700 text-xs font-medium"
                  title="Xóa hợp đồng đã chọn"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Xóa ({selectedItems.length})</span>
                </button>
            </div>
          </div>
        )}
    </div>
  )
}
