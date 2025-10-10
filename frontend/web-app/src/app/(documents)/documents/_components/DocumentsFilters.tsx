'use client'

import React from 'react'
import { MagnifyingGlassIcon, TagIcon, Squares2X2Icon, ListBulletIcon, ArrowPathIcon, FunnelIcon, CalendarIcon, PlusIcon, PencilSquareIcon, TrashIcon, ArrowUturnLeftIcon } from '@heroicons/react/24/outline'
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
    <div className="bg-white/80 backdrop-blur rounded-lg p-[0px] shadow-sm w-full">
      {/* Row 1: Search + Sort + Refresh (controls cluster to the right) */}
      <div className="flex items-center gap-[5px] w-full">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Tìm theo tiêu đề hoặc mô tả.."
              className="w-full rounded-lg border border-gray-300 pl-7 pr-2 h-[28px] text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
        <div className="ml-auto flex items-center gap-[5px]">
                <select
                  value={sortBy}
                  onChange={(e) => onSortByChange(e.target.value)}
          className="h-[28px] px-2 pr-6 py-0 leading-[1.1] min-w-[130px] rounded-lg border border-indigo-300 text-xs text-indigo-700 bg-white hover:bg-indigo-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
          className="h-[28px] px-2 pr-6 py-0 leading-[1.1] min-w-[110px] rounded-lg border border-indigo-300 text-xs text-indigo-700 bg-white hover:bg-indigo-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="asc">Tăng dần</option>
            <option value="desc">Giảm dần</option>
          </select>
          <button onClick={props.onRefresh} className="inline-flex items-center gap-1 px-2 h-[28px] rounded-lg border border-indigo-300 text-xs text-indigo-700 hover:bg-indigo-50"><ArrowPathIcon className="w-3 h-3"/>Làm mới</button>
        </div>
      </div>

      {/* Row 2: Advanced toggle + triggers + Reset + View toggle */}
      <div className="flex items-center gap-[5px] w-full mt-[5px]">
        <button onClick={onToggleAdvanced} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium whitespace-nowrap">{showAdvanced ? 'Ẩn tùy chọn nâng cao' : 'Hiện tùy chọn nâng cao'}</button>
        {showAdvanced && (
          <>
            <div className="ml-auto flex items-center gap-[5px]">
          <button onClick={(e)=>{ setOpenTags(true); (e.currentTarget as HTMLElement).dataset.anchor='tags'; }} className="inline-flex items-center gap-1 px-2 h-[28px] rounded-lg border border-indigo-300 text-xs text-indigo-700 hover:bg-indigo-50" data-anchor-id="tags"><TagIcon className="w-3 h-3"/>Phân loại</button>
          <button onClick={(e)=>{ setOpenTypes(true); (e.currentTarget as HTMLElement).dataset.anchor='types'; }} className="inline-flex items-center gap-1 px-2 h-[28px] rounded-lg border border-indigo-300 text-xs text-indigo-700 hover:bg-indigo-50" data-anchor-id="types"><FunnelIcon className="w-3 h-3"/>Loại file</button>
          <button onClick={(e)=>{ setOpenTime(true); (e.currentTarget as HTMLElement).dataset.anchor='time'; }} className="inline-flex items-center gap-1 px-2 h-[28px] rounded-lg border border-indigo-300 text-xs text-indigo-700 hover:bg-indigo-50" data-anchor-id="time"><CalendarIcon className="w-3 h-3"/>Thời gian</button>
              <button onClick={() => { onSearchChange(''); onStatusChange('ALL'); onTypeChange('ALL'); }} className="inline-flex items-center gap-1 px-2 h-[28px] rounded-lg border border-indigo-300 text-xs text-indigo-700 hover:bg-indigo-50"><ArrowUturnLeftIcon className="w-3 h-3"/>Đặt lại</button>
              <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              <button onClick={() => onViewModeChange?.('grid')} className={`p-1.5 transition-colors ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`} title="Xem dạng card">
                <Squares2X2Icon className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => onViewModeChange?.('list')} className={`p-1.5 transition-colors border-l border-gray-300 ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`} title="Xem dạng bảng">
                <ListBulletIcon className="w-3.5 h-3.5" />
              </button>
            </div>
            </div>
          </>
          )}
        </div>

      {/* Row 3: Actions */}
      <div className="mt-[5px] flex items-center gap-[5px] justify-end">
        <button onClick={()=>setOpenAdd(true)} className="inline-flex items-center gap-1 px-2 h-[28px] rounded-lg border border-indigo-300 text-xs text-indigo-700 hover:bg-indigo-50"><PlusIcon className="w-3 h-3"/>Thêm</button>
        <button className="inline-flex items-center gap-1 px-2 h-[28px] rounded-lg border border-indigo-300 text-xs text-indigo-700 hover:bg-indigo-50"><PencilSquareIcon className="w-3 h-3"/>Sửa</button>
        <button className="inline-flex items-center gap-1 px-2 h-[28px] rounded-lg border border-rose-300 text-xs text-rose-700 hover:bg-rose-50"><TrashIcon className="w-3 h-3"/>Xóa</button>
              </div>

      {/* Advanced content removed to avoid duplicate triggers; row 2 handles toggling label only */}

      {/* Modals */}
      <IncludeExcludeModal
        open={openTags}
        title="Phân loại"
        availableItems={availableTags}
        include={selectedTags}
        exclude={[]}
        onChange={(inc) => {
          // update selectedTags via provided handler
          // ensure unique set
          const next = Array.from(new Set(inc))
          next.forEach(()=>{})
          // Diff to toggle: remove ones not in inc
          // Fallback: just replace by clearing then adding
          selectedTags.forEach(tag => { if (!next.includes(tag)) onToggleTag(tag) })
          next.forEach(tag => { if (!selectedTags.includes(tag)) onToggleTag(tag) })
        }}
        onClose={()=>setOpenTags(false)}
        anchorEl={typeof document !== 'undefined' ? document.querySelector('[data-anchor-id="tags"]') as HTMLElement : null}
      />
      <IncludeExcludeModal
        open={openTypes}
        title="Loại file"
        availableItems={getContractTypes(t).map(x=>x.label)}
        include={type && type !== 'ALL' ? [type] : []}
        exclude={[]}
        onChange={(inc) => {
          const picked = Array.isArray(inc) && inc.length > 0 ? inc[0] : 'ALL'
          onTypeChange(picked)
        }}
        onClose={()=>setOpenTypes(false)}
        anchorEl={typeof document !== 'undefined' ? document.querySelector('[data-anchor-id="types"]') as HTMLElement : null}
      />
      <TimeRangeModal
        open={openTime}
        title="Thời gian"
        value={{}}
        onChange={() => {}}
        onClose={()=>setOpenTime(false)}
        anchorEl={typeof document !== 'undefined' ? document.querySelector('[data-anchor-id="time"]') as HTMLElement : null}
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

