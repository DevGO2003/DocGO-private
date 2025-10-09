'use client'

import React from 'react'
import { MagnifyingGlassIcon, TagIcon } from '@heroicons/react/24/outline'
import { getContractStatuses, getContractTypes } from '@/utils/tagTranslations'
import { useTranslation } from '@/hooks/useTranslation'

type Props = {
  search: string
  onSearchChange: (v: string) => void
  status: string
  onStatusChange: (v: string) => void
  type: string
  onTypeChange: (v: string) => void
  availableTags: string[]
  tagsLoading: boolean
  tagsError: boolean
  selectedTags: string[]
  onToggleTag: (tag: string) => void
  onRetryTags: () => void
  sortBy: string
  onSortByChange: (v: string) => void
  sortDirection: 'asc' | 'desc'
  onToggleSortDirection: () => void
  showAdvanced: boolean
  onToggleAdvanced: () => void
}

export default function DocumentsFilters(props: Props) {
  const { t } = useTranslation()
  const {
    search, onSearchChange,
    status, onStatusChange,
    type, onTypeChange,
    availableTags, tagsLoading, tagsError, selectedTags, onToggleTag, onRetryTags,
    sortBy, onSortByChange, sortDirection, onToggleSortDirection,
    showAdvanced, onToggleAdvanced,
  } = props

  return (
    <div className="space-y-2">
      <div className="bg-white/80 backdrop-blur rounded-2xl border border-gray-200 p-3 shadow-sm">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3 lg:grid-cols-4">
          <div className="md:col-span-1 lg:col-span-2">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Tìm theo tiêu đề hoặc mô tả"
                className="w-full rounded-lg border-gray-300 pl-7 pr-2 h-7 text-[10px] focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          <div>
            <select
              value={status}
              onChange={(e) => onStatusChange(e.target.value)}
              className="w-full rounded-lg border-gray-300 h-7 px-2 text-[10px] focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {getContractStatuses(t).map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={type}
              onChange={(e) => onTypeChange(e.target.value)}
              className="w-full rounded-lg border-gray-300 h-7 px-2 text-[10px] focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {getContractTypes(t).map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <button
            onClick={onToggleAdvanced}
            className="flex items-center gap-1.5 text-[10px] text-indigo-600 hover:text-indigo-700 font-medium"
          >
            <span>{showAdvanced ? 'Ẩn' : 'Hiện'} tùy chọn nâng cao</span>
            <span className={`transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`}>▼</span>
          </button>

          {showAdvanced && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <label className="text-[10px] text-gray-600">Sắp xếp:</label>
                <select
                  value={sortBy}
                  onChange={(e) => onSortByChange(e.target.value)}
                  className="rounded-lg border-gray-300 h-7 px-2 text-[10px] focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="createdAt">Ngày tạo</option>
                  <option value="title">Tên</option>
                  <option value="status">Trạng thái</option>
                  <option value="totalValue">Giá trị</option>
                  <option value="effectiveDate">Hiệu lực</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-[10px] text-gray-600">Thứ tự:</label>
                <button
                  onClick={onToggleSortDirection}
                  className="flex items-center gap-1 px-2 h-7 rounded-lg border border-gray-300 hover:bg-gray-50 text-[10px]"
                >
                  {sortDirection === 'asc' ? '↑ Tăng dần' : '↓ Giảm dần'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur rounded-2xl border border-gray-200 p-3 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <h4 className="text-[10px] font-semibold text-gray-700">Thẻ phân loại</h4>
          {tagsLoading && (
            <div className="flex items-center gap-1 text-[10px] text-gray-500">
              <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Đang tải...
            </div>
          )}
        </div>

        {tagsError ? (
          <div className="flex items-center justify-between p-2.5 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-xs font-medium text-red-800">Không thể tải danh sách thẻ</p>
                <p className="text-[10px] text-red-600">Vui lòng thử lại sau</p>
              </div>
            </div>
            <button
              onClick={onRetryTags}
              disabled={tagsLoading}
              className="flex items-center gap-1 px-2.5 h-7 text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Thử lại
            </button>
          </div>
        ) : (
          <div className="flex gap-2 overflow-x-auto no-scrollbar whitespace-nowrap">
            {availableTags.map((t: string) => {
              const active = selectedTags.includes(t)
              return (
                <button
                  key={t}
                  onClick={() => onToggleTag(t)}
                  className={`inline-flex items-center rounded-full border px-2 h-7 text-[10px] transition-colors ${
                    active 
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                  title={t}
                >
                  {/* icon hidden for compactness */}
                  <span className="truncate max-w-[140px]">{t}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}


