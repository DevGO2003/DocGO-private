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
    <div className="bg-white/80 backdrop-blur rounded-lg p-4 shadow-sm w-full">
      {/* Search and Filter Bar - Flex Layout */}
      <div className="flex items-center gap-4 w-full">
        {/* Search Input - Takes maximum space */}
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Tìm theo tiêu đề hoặc mô tả.."
              className="w-full rounded-lg border-gray-300 pl-10 pr-3 h-10 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Document Type Dropdown */}
        <div className="min-w-[140px]">
          <select
            value={type}
            onChange={(e) => onTypeChange(e.target.value)}
            className="w-full rounded-lg border-gray-300 h-10 px-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="ALL">— Loại tài liệu —</option>
            {getContractTypes(t).map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Status Dropdown */}
        <div className="min-w-[120px]">
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full rounded-lg border-gray-300 h-10 px-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="ALL">— Trạng thái —</option>
            {getContractStatuses(t).map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Reset Button */}
        <button
          onClick={() => {
            onSearchChange('')
            onStatusChange('ALL')
            onTypeChange('ALL')
          }}
          className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap"
        >
          Reset
        </button>

        {/* Apply Button */}
        <button
          onClick={() => {
            // Apply logic is handled by the parent component through state changes
            console.log('Apply filters')
          }}
          className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors whitespace-nowrap"
        >
          Áp dụng
        </button>
      </div>

      {/* Advanced Options - Hidden by default, shown when toggled */}
      {showAdvanced && (
        <div className="mt-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Sắp xếp:</label>
              <select
                value={sortBy}
                onChange={(e) => onSortByChange(e.target.value)}
                className="rounded-lg border-gray-300 h-8 px-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="createdAt">Ngày tạo</option>
                <option value="title">Tên</option>
                <option value="status">Trạng thái</option>
                <option value="totalValue">Giá trị</option>
                <option value="effectiveDate">Hiệu lực</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Thứ tự:</label>
              <button
                onClick={onToggleSortDirection}
                className="flex items-center gap-1 px-3 h-8 rounded-lg border border-gray-300 hover:bg-gray-50 text-sm"
              >
                {sortDirection === 'asc' ? '↑ Tăng dần' : '↓ Giảm dần'}
              </button>
            </div>
            <button
              onClick={onToggleAdvanced}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Ẩn tùy chọn nâng cao
            </button>
          </div>
        </div>
      )}

      {/* Toggle Advanced Button - Only show when not advanced */}
      {!showAdvanced && (
        <div className="mt-3">
          <button
            onClick={onToggleAdvanced}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Hiện tùy chọn nâng cao
          </button>
        </div>
      )}
    </div>
  )
}


