'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { DocumentTextIcon, EyeIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import type { Document } from '../_types'
import { translateContractStatus, translateContractType, translateContractTag } from '@/utils/tagTranslations'

type Props = {
  items: Document[]
  selectedItems: string[]
  onToggleSelect: (id: string) => void
  onSelectAll: () => void
  onClearSelection: () => void
  viewMode: 'grid' | 'list'
  badgeClass: (status: string) => string
  t: (key: string, vars?: Record<string, any>) => string
}

export default function DocumentsTable({ items, selectedItems, onToggleSelect, onSelectAll, onClearSelection, viewMode, badgeClass, t }: Props) {
  const [previewDoc, setPreviewDoc] = useState<string | null>(null)
  const [previewPos, setPreviewPos] = useState<{x: number, y: number} | null>(null)

  const handlePreviewEnter = (e: React.MouseEvent, doc: Document) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setPreviewPos({ x: rect.left + rect.width/2, y: rect.top - 10 })
    setPreviewDoc(doc.id)
  }

  const handlePreviewLeave = () => {
    setPreviewDoc(null)
    setPreviewPos(null)
  }

  const handleDownload = (doc: Document) => {
    console.log('Downloading file:', doc.title)
    // Demo download logic - API chưa sẵn sàng
  }

  if (viewMode === 'grid') {
    return (
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedItems.length === items.length && items.length > 0}
              onChange={selectedItems.length === items.length ? onClearSelection : onSelectAll}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-600">
              {selectedItems.length === items.length && items.length > 0 ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
            </span>
          </div>
        </div>

        <div className="grid gap-4" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))'}}>
          {items.map(c => (
            <div key={c.id} className="group bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md hover:-translate-y-[1px] transition relative" style={{aspectRatio: '3/4'}}>
              <div className="absolute top-4 left-4">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(c.id)}
                  onChange={() => onToggleSelect(c.id)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
              </div>
              <div className="flex flex-col h-full">
                <div className="flex-1">
                  <div className="flex justify-between items-start gap-2 ml-6">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-indigo-700 transition text-sm">{c.title}</h3>
                      {c.contractNumber && (
                        <div className="mt-1 text-xs text-gray-500">Mã HĐ: {c.contractNumber}</div>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      {c.riskLevel && (
                        <span className={`text-xs px-1.5 py-0.5 rounded-full border ${
                          c.riskLevel === 'High' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                          c.riskLevel === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>{c.riskLevel}</span>
                      )}
                      <span className={`text-xs px-1.5 py-0.5 rounded-full border ${badgeClass(c.status)}`}>{translateContractStatus(c.status, t)}</span>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-gray-600 line-clamp-2 ml-6">{c.description || 'Không có mô tả'}</p>
                  <div className="mt-2 flex flex-wrap gap-1 ml-6">
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">{translateContractType(c.contractType, t)}</span>
                    {c.tags?.slice(0,2).map(tag => (
                      <span key={tag} className="text-xs px-1.5 py-0.5 rounded-full bg-gray-50 text-gray-700 border border-gray-200">#{translateContractTag(tag, t)}</span>
                    ))}
                  </div>
                  <div className="mt-2 text-xs text-gray-500 space-y-1 ml-6">
                    <div className="flex justify-between"><span>Hiệu lực</span><span>{c.effectiveDate}</span></div>
                    <div className="flex justify-between"><span>Hết hạn</span><span>{c.expiryDate}</span></div>
                    <div className="flex justify-between"><span>Giá trị</span><span>{c.totalValue.toLocaleString('vi-VN')} {c.currency}</span></div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-3 flex justify-center gap-1 border-t border-gray-100 pt-2">
                  <button 
                    onClick={() => window.location.href = `/documents/${c.id}`}
                    className="flex items-center gap-0.5 px-1.5 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-xs transition-colors"
                  >
                    <DocumentTextIcon className="w-2.5 h-2.5" />
                    Mở
                  </button>
                  
                  <button 
                    onMouseEnter={(e) => handlePreviewEnter(e, c)}
                    onMouseLeave={handlePreviewLeave}
                    className="flex items-center gap-0.5 px-1.5 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-xs transition-colors"
                  >
                    <EyeIcon className="w-2.5 h-2.5" />
                    Xem
                  </button>
                  
                  <button 
                    onClick={() => handleDownload(c)}
                    className="flex items-center gap-0.5 px-1.5 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-xs transition-colors"
                  >
                    <ArrowDownTrayIcon className="w-2.5 h-2.5" />
                    Tải
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Preview Popup */}
        {previewDoc && previewPos && (
          <div 
            className="fixed z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-sm"
            style={{
              left: `${previewPos.x}px`,
              top: `${previewPos.y}px`,
              transform: 'translateX(-50%) translateY(-100%)'
            }}
          >
            <div className="text-sm">
              <div className="font-medium mb-2">Xem trước (Demo)</div>
              <p className="text-gray-600">Nội dung file sẽ được hiển thị ở đây...</p>
              <p className="text-xs text-gray-500 mt-2">API chưa sẵn sàng</p>
            </div>
          </div>
        )}
      </div>
    )
  }

  // list mode delegates to existing CustomTable via parent for now
  return null
}


