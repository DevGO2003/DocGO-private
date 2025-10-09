'use client'

import React from 'react'
import Link from 'next/link'
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

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {items.map(c => (
            <div key={c.id} className="group bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md hover:-translate-y-[1px] transition relative">
              <div className="absolute top-4 left-4">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(c.id)}
                  onChange={() => onToggleSelect(c.id)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
              </div>
              <Link href={`/documents/${c.id}`} className="block">
                <div className="flex justify-between items-start gap-4 ml-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-indigo-700 transition">{c.title}</h3>
                    {c.contractNumber && (
                      <div className="mt-1 text-xs text-gray-500">Mã HĐ: {c.contractNumber}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {c.riskLevel && (
                      <span className={`text-xs px-2 py-1 rounded-full border ${
                        c.riskLevel === 'High' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                        c.riskLevel === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>{c.riskLevel}</span>
                    )}
                    <span className={`text-xs px-2 py-1 rounded-full border ${badgeClass(c.status)}`}>{translateContractStatus(c.status, t)}</span>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-600 line-clamp-3 ml-6">{c.description || 'Không có mô tả'}</p>
                <div className="mt-3 flex flex-wrap gap-2 ml-6">
                  <span className="text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">{translateContractType(c.contractType, t)}</span>
                  {c.tags?.slice(0,3).map(tag => (
                    <span key={tag} className="text-xs px-2 py-1 rounded-full bg-gray-50 text-gray-700 border border-gray-200">#{translateContractTag(tag, t)}</span>
                  ))}
                </div>
                <div className="mt-4 text-sm text-gray-500 space-y-1 ml-6">
                  <div className="flex justify-between"><span>Hiệu lực</span><span>{c.effectiveDate}</span></div>
                  <div className="flex justify-between"><span>Hết hạn</span><span>{c.expiryDate}</span></div>
                  <div className="flex justify-between"><span>Giá trị</span><span>{c.totalValue.toLocaleString('vi-VN')} {c.currency}</span></div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // list mode delegates to existing CustomTable via parent for now
  return null
}


