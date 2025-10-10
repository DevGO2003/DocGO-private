'use client'

import React from 'react'
import { MagnifyingGlassIcon, TagIcon, Squares2X2Icon, ListBulletIcon, ArrowPathIcon, FunnelIcon, CalendarIcon } from '@heroicons/react/24/outline'
import IncludeExcludeModal from '@/components/modals/IncludeExcludeModal'
import TimeRangeModal from '@/components/modals/TimeRangeModal'
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
  onRefresh?: () => void
  onOpenTags?: () => void
  onOpenType?: () => void
  onOpenDate?: () => void
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
    onRefresh, onOpenTags, onOpenType, onOpenDate,
  } = props

  const [openTags, setOpenTags] = React.useState(false)
  const [openTypes, setOpenTypes] = React.useState(false)
  const [openTime, setOpenTime] = React.useState(false)

  return (
    <div className="bg-white/80 backdrop-blur rounded-lg p-4 shadow-sm w-full">
      {/* Top bar: sort + refresh */}
      <div className="flex items-center justify-between gap-4 w-full">
        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            className="h-9 px-2 rounded-lg border border-gray-300 text-sm"
          >
            <option value="createdAt">Ngày tạo</option>
            <option value="title">Tên</option>
            <option value="status">Trạng thái</option>
            <option value="totalValue">Giá trị</option>
            <option value="effectiveDate">Hiệu lực</option>
          </select>
          <select
            value={sortDirection}
            onChange={() => onToggleSortDirection()}
            className="h-9 px-2 rounded-lg border border-gray-300 text-sm"
          >
            <option value="asc">Tăng dần</option>
            <option value="desc">Giảm dần</option>
          </select>
        </div>
        <button onClick={props.onRefresh} className="inline-flex items-center gap-1 px-3 h-9 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"><ArrowPathIcon className="w-4 h-4"/>Làm mới</button>
      </div>

      {/* Search + Advanced triggers */}
      <div className="flex items-center gap-2 w-full mt-3">
        {/* Search Input - Takes maximum space */}
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Tìm theo tiêu đề hoặc mô tả.."
              className="w-full rounded-lg border border-gray-300 pl-10 pr-3 h-10 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={()=>setOpenTags(true)} className="inline-flex items-center gap-1 px-3 h-10 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"><TagIcon className="w-4 h-4"/>Tags</button>
          <button onClick={()=>setOpenTypes(true)} className="inline-flex items-center gap-1 px-3 h-10 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"><FunnelIcon className="w-4 h-4"/>Loại file</button>
          <button onClick={()=>setOpenTime(true)} className="inline-flex items-center gap-1 px-3 h-10 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"><CalendarIcon className="w-4 h-4"/>Thời gian</button>
        </div>
      </div>

      {/* Advanced Options - Hidden by default, shown when toggled */}
      {showAdvanced && (
        <div className="mt-4">
          <div className="flex items-center gap-2">
            <button onClick={()=>setOpenTags(true)} className="inline-flex items-center gap-1 px-3 h-9 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"><TagIcon className="w-4 h-4"/>Tags</button>
            <button onClick={()=>setOpenTypes(true)} className="inline-flex items-center gap-1 px-3 h-9 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"><FunnelIcon className="w-4 h-4"/>Loại file</button>
            <button onClick={()=>setOpenTime(true)} className="inline-flex items-center gap-1 px-3 h-9 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"><CalendarIcon className="w-4 h-4"/>Thời gian</button>
            <button onClick={onToggleAdvanced} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium ml-auto">Ẩn tùy chọn nâng cao</button>
          </div>
          <div className="mt-3">
            <button
              onClick={() => {
                onSearchChange('')
                onStatusChange('ALL')
                onTypeChange('ALL')
              }}
              className="px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
            >
              Reset
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

      {/* Modals */}
      <IncludeExcludeModal
        open={openTags}
        title="Tags"
        availableItems={availableTags}
        include={[]}
        exclude={[]}
        onChange={() => {}}
        onClose={()=>setOpenTags(false)}
      />
      <IncludeExcludeModal
        open={openTypes}
        title="Loại file"
        availableItems={getContractTypes(t).map(x=>x.label)}
        include={[]}
        exclude={[]}
        onChange={() => {}}
        onClose={()=>setOpenTypes(false)}
      />
      <TimeRangeModal
        open={openTime}
        title="Thời gian"
        value={{}}
        onChange={() => {}}
        onClose={()=>setOpenTime(false)}
      />
    </div>
  )
}

