'use client'

import React from 'react'
import { MagnifyingGlassIcon, TagIcon, Squares2X2Icon, ListBulletIcon, ArrowPathIcon, FunnelIcon, CalendarIcon } from '@heroicons/react/24/outline'
import IncludeExcludeModal from '@/components/modals/IncludeExcludeModal'
import TimeRangeModal from '@/components/modals/TimeRangeModal'
import AddFileChoiceModal from '@/components/modals/AddFileChoiceModal'
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
  viewMode?: 'grid' | 'list'
  onViewModeChange?: (mode: 'grid' | 'list') => void
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
    viewMode = 'grid', onViewModeChange,
  } = props

  const [openTags, setOpenTags] = React.useState(false)
  const [openTypes, setOpenTypes] = React.useState(false)
  const [openTime, setOpenTime] = React.useState(false)
  const [openAdd, setOpenAdd] = React.useState(false)

  return (
    <div className="bg-white/80 backdrop-blur rounded-lg p-4 shadow-sm w-full">
      {/* Row 1: Search + Sort + Refresh */}
      <div className="flex items-center gap-2 w-full">
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
        <select
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value)}
          className="h-10 px-2 rounded-lg border border-gray-300 text-sm"
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
          className="h-10 px-2 rounded-lg border border-gray-300 text-sm"
        >
          <option value="asc">Tăng dần</option>
          <option value="desc">Giảm dần</option>
        </select>
        <button onClick={props.onRefresh} className="inline-flex items-center gap-1 px-3 h-10 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"><ArrowPathIcon className="w-4 h-4"/>Làm mới</button>
      </div>

      {/* Row 2: Advanced toggle + triggers + Reset + View toggle */}
      <div className="flex items-center gap-2 w-full mt-3">
        <button onClick={onToggleAdvanced} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium whitespace-nowrap">{showAdvanced ? 'Ẩn tùy chọn nâng cao' : 'Hiện tùy chọn nâng cao'}</button>
        {showAdvanced && (
          <>
            <div className="flex items-center gap-2 ml-2">
              <button onClick={()=>setOpenTags(true)} className="inline-flex items-center gap-1 px-3 h-10 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"><TagIcon className="w-4 h-4"/>Phân loại</button>
              <button onClick={()=>setOpenTypes(true)} className="inline-flex items-center gap-1 px-3 h-10 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"><FunnelIcon className="w-4 h-4"/>Loại file</button>
              <button onClick={()=>setOpenTime(true)} className="inline-flex items-center gap-1 px-3 h-10 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"><CalendarIcon className="w-4 h-4"/>Thời gian</button>
              <button onClick={() => { onSearchChange(''); onStatusChange('ALL'); onTypeChange('ALL'); }} className="px-3 h-10 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50">Reset</button>
            </div>
            <div className="ml-auto flex rounded-lg border border-gray-300 overflow-hidden">
              <button onClick={() => onViewModeChange?.('grid')} className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`} title="Xem dạng card">
                <Squares2X2Icon className="w-4 h-4" />
              </button>
              <button onClick={() => onViewModeChange?.('list')} className={`p-2 transition-colors border-l border-gray-300 ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`} title="Xem dạng bảng">
                <ListBulletIcon className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Row 3: Actions */}
      <div className="mt-3 flex items-center gap-2">
        <button onClick={()=>setOpenAdd(true)} className="px-3 h-9 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50">Thêm</button>
        <button className="px-3 h-9 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50">Sửa</button>
        <button className="px-3 h-9 rounded-lg border border-rose-300 text-sm text-rose-700 hover:bg-rose-50">Xóa</button>
      </div>

      {/* Advanced content removed to avoid duplicate triggers; row 2 handles toggling label only */}

      {/* Modals */}
      <IncludeExcludeModal
        open={openTags}
        title="Phân loại"
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
      <AddFileChoiceModal
        open={openAdd}
        onCreateNew={() => console.log('create new')}
        onUpload={() => console.log('upload')}
        onClose={()=>setOpenAdd(false)}
      />
    </div>
  )
}

