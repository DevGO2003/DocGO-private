'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Squares2X2Icon, ListBulletIcon } from '@heroicons/react/24/outline'
import { DashboardLayout } from '@/components/layout'
import { HeaderPanel, PrimaryContent } from '@/components/ui'
import CustomTable from '@/components/contracts/CustomTable'
import TableSettings, { TableColumn } from '@/components/contracts/TableSettings'
import { useTranslation } from '@/hooks/useTranslation'
import { translateContractStatus, translateContractType, translateContractTag } from '@/utils/tagTranslations'
import DocumentsFilters from './_components/DocumentsFilters'
import DocumentsTable from './_components/DocumentsTable'
import { InlineLoading } from '@/components/ui/LoadingSpinner'
import { tagAPI } from '@/lib/api'
import { useDocumentsQuery } from './_hooks/useDocumentsQuery'
import { DEFAULT_PAGE_SIZE } from './_constants'

type ContractItem = {
  id: string
  title: string
  description?: string
  status: string
  contractType: string
  tags?: string[]
  contractNumber?: string
  createdAt: string
  updatedAt: string
  creatorId: number
  parties: { name: string; role: string }[]
  totalValue: number
  currency: string
  effectiveDate: string
  expiryDate: string
  riskLevel?: string
  reminders?: any[]
}

// local-only view model to match existing CustomTable props

export default function DocumentsPage() {
  function getBadgeClass(status: string) {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-50 text-gray-700 border-gray-200'
      case 'PENDING_REVIEW':
        return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'APPROVED':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'ACTIVE':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'EXPIRED':
        return 'bg-rose-50 text-rose-700 border-rose-200'
      case 'TERMINATED':
        return 'bg-red-50 text-red-700 border-red-200'
      case 'ARCHIVED':
        return 'bg-slate-50 text-slate-700 border-slate-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }
  const { t } = useTranslation()
  const [items, setItems] = useState<ContractItem[]>([])
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [tagsLoading, setTagsLoading] = useState<boolean>(true)
  const [tagsError, setTagsError] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [search, setSearch] = useState<string>('')
  const [debouncedSearch, setDebouncedSearch] = useState<string>('')
  const [status, setStatus] = useState<string>('ALL')
  const [type, setType] = useState<string>('ALL')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [page, setPage] = useState<number>(0)
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [sortBy, setSortBy] = useState<string>('createdAt')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [showTableSettings, setShowTableSettings] = useState<boolean>(false)
  const [allItems, setAllItems] = useState<ContractItem[]>([])
  const [displayedItems, setDisplayedItems] = useState<ContractItem[]>([])
  const [hasMoreData, setHasMoreData] = useState<boolean>(true)
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false)
  const abortRef = useRef<AbortController | null>(null)
  const [activeTab, setActiveTab] = useState<'all' | 'contract'>('all')

  // Table columns configuration
  const [tableColumns, setTableColumns] = useState<TableColumn[]>([
    { key: 'checkbox', label: '', visible: true, order: 0 },
    { key: 'title', label: 'Tài liệu', visible: true, order: 1 },
    { key: 'contractNumber', label: 'Mã HĐ', visible: true, order: 2 },
    { key: 'status', label: 'Trạng thái', visible: true, order: 3 },
    { key: 'contractType', label: 'Loại', visible: true, order: 4 },
    { key: 'totalValue', label: 'Giá trị', visible: true, order: 5 },
    { key: 'effectiveDate', label: 'Hiệu lực', visible: true, order: 6 },
    { key: 'expiryDate', label: 'Hết hạn', visible: true, order: 7 },
    { key: 'riskLevel', label: 'Rủi ro', visible: true, order: 8 },
    { key: 'parties', label: 'Đối tác', visible: false, order: 9 },
    { key: 'createdAt', label: 'Ngày tạo', visible: false, order: 10 },
    { key: 'actions', label: 'Hành động', visible: true, order: 11 }
  ])

  // Removed manual queryString builder; fetchData composes params directly

  // switched to hook-based fetching

  // Hàm refresh riêng với loading state và toast notification
  const refreshData = async () => { setRefreshing(true); try { refetch(); } finally { setRefreshing(false) } }

  // Load available tags once
  useEffect(() => {
    const loadTags = async () => {
      setTagsLoading(true)
      setTagsError(false)
      
      try {
        const res = await tagAPI.getPopularTags()
        const payload: any = res.data?.data
        // Extract tag names from TagDto objects
        const tagsFromApi: string[] = Array.isArray(payload) 
          ? payload.map((tag: any) => tag.name || tag.displayName).filter(Boolean)
          : []
        
        if (tagsFromApi.length === 0) {
          setTagsError(true)
          setAvailableTags([])
          console.warn('[Documents] No tags returned from API')
        } else {
        setAvailableTags(tagsFromApi)
          setTagsError(false)
        console.log('[Documents] Loaded tags from API:', tagsFromApi)
        }
      } catch (error) {
        console.error('[Documents] Error loading tags:', error)
        setTagsError(true)
        setAvailableTags([])
      } finally {
        setTagsLoading(false)
      }
    }
    loadTags()
  }, [])

  // hook binding to params
  const { data: queryData, loading: queryLoading, error: queryError, params: q, setParams, refetch } = useDocumentsQuery({
        pageSize,
    sortBy,
    sortDirection: sortDirection.toUpperCase() as 'ASC' | 'DESC',
    searchTerm: debouncedSearch,
        status,
        type,
    tags: selectedTags,
  })
  useEffect(() => {
    setLoading(queryLoading)
    const mapped = (queryData?.content || []).map(c => ({
      id: String(c.id),
      title: c.title,
      description: c.description,
      status: c.status,
      contractType: c.contractType,
      tags: c.tags || [],
      contractNumber: c.contractNumber,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      creatorId: 0,
      parties: c.parties,
      totalValue: c.totalValue,
      currency: c.currency,
      effectiveDate: c.effectiveDate,
      expiryDate: c.expiryDate,
      riskLevel: c.riskLevel,
      reminders: [],
    }))
    setItems(mapped)
    setDisplayedItems(mapped)
    setAllItems(mapped)
    setTotalPages(queryData?.totalPages || 1)
    setHasMoreData(mapped.length < (queryData?.totalElements || 0))
  }, [queryLoading, queryData])

  // Separate effect for search input to update debouncedSearch
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(0) // Reset to first page when searching
    }, 500)
    return () => clearTimeout(handler)
  }, [search])

  const toggleTag = (t: string) => {
    setPage(0)
    setSelectedTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])
  }

  const toggleSelectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(x => x !== id)
        : [...prev, id]
    )
  }

  const selectAll = () => {
    setSelectedItems(items.map(item => item.id))
  }

  const clearSelection = () => {
    setSelectedItems([])
  }


  // Table Settings Handlers
  const handleTableColumnsChange = (newColumns: TableColumn[]) => {
    setTableColumns(newColumns)
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    // Reset displayed items when page size changes
    setDisplayedItems([])
    setAllItems([])
    setHasMoreData(true)
  }

  const handleShowMore = () => {}

  // Retry loading tags
  const handleRetryTags = () => {
    const loadTags = async () => {
      setTagsLoading(true)
      setTagsError(false)
      
      try {
        const res = await tagAPI.getPopularTags()
        const payload: any = res.data?.data
        const tagsFromApi: string[] = Array.isArray(payload) 
          ? payload.map((tag: any) => tag.name || tag.displayName).filter(Boolean)
          : []
        
        if (tagsFromApi.length === 0) {
          setTagsError(true)
          setAvailableTags([])
        } else {
          setAvailableTags(tagsFromApi)
          setTagsError(false)
        }
      } catch (error) {
        console.error('[Documents] Error loading tags on retry:', error)
        setTagsError(true)
        setAvailableTags([])
      } finally {
        setTagsLoading(false)
      }
    }
    loadTags()
  }

  // Removed handleSearch; using debounced search

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <HeaderPanel
          title="Quản lý tài liệu"
          breadcrumbs={[{ label: 'Documents', href: '/documents' }, { label: 'Danh sách', current: true }]}
          right={
            <div className="w-full">
              <DocumentsFilters
                search={search}
                onSearchChange={(v) => setSearch(v)}
                status={status}
                onStatusChange={(v) => { setStatus(v); setPage(0) }}
                type={type}
                onTypeChange={(v) => { setType(v); setPage(0) }}
                availableTags={availableTags}
                tagsLoading={tagsLoading}
                tagsError={tagsError}
                selectedTags={selectedTags}
                onToggleTag={toggleTag}
                onRetryTags={handleRetryTags}
                sortBy={sortBy}
                onSortByChange={setSortBy}
                sortDirection={sortDirection}
                onToggleSortDirection={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                showAdvanced={showAdvanced}
                onToggleAdvanced={() => setShowAdvanced(!showAdvanced)}
              />
            </div>
          }
        >
          {/* Tabs with space between */}
          <div className="flex justify-between items-center">
            <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
              <button onClick={() => setActiveTab('all')} className={`px-2 py-1.5 text-[10px] md:px-2.5 md:py-1.5 md:text-xs ${activeTab === 'all' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`} title="Tất cả file">
                <span className="md:hidden">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                </span>
                <span className="hidden md:inline">Tất cả file</span>
            </button>
              <button onClick={() => setActiveTab('contract')} className={`px-2 py-1.5 text-[10px] md:px-2.5 md:py-1.5 md:text-xs border-l border-gray-200 ${activeTab === 'contract' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`} title="File hợp đồng">
                <span className="md:hidden">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
                </span>
                <span className="hidden md:inline">File hợp đồng</span>
                  </button>
            </div>
            <div className="flex-1"></div>
        </div>

          {/* View Mode Toggle - align start */}
          <div className="flex justify-start mt-2">
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
                title="Xem dạng card"
              >
                <Squares2X2Icon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 transition-colors border-l border-gray-300 ${
                  viewMode === 'list' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
                title="Xem dạng bảng"
              >
                <ListBulletIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </HeaderPanel>

        {/* Content */}
        <PrimaryContent>
          {loading ? (
            <InlineLoading text="Đang tải tài liệu..." size="lg" />
          ) : items.length === 0 ? (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="mb-4">
                  <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-600 mb-6">Không tìm thấy tài liệu phù hợp.</p>
                <button
                  onClick={() => refreshData()}
                  disabled={refreshing}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {refreshing ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  )}
                  {refreshing ? 'Đang làm mới...' : 'Làm mới'}
                </button>
              </div>
            </div>
          ) : viewMode === 'grid' ? (
            <DocumentsTable
              items={activeTab === 'all' ? items : items.filter(c => c.contractNumber || c.contractType)}
              selectedItems={selectedItems}
              onToggleSelect={toggleSelectItem}
              onSelectAll={selectAll}
              onClearSelection={clearSelection}
              viewMode={viewMode}
              badgeClass={getBadgeClass}
              t={t}
            />
          ) : (
            <div>
              <CustomTable
                items={displayedItems}
                columns={tableColumns}
                selectedItems={selectedItems}
                onToggleSelect={toggleSelectItem}
                onSelectAll={selectAll}
                onClearSelection={clearSelection}
                translateContractStatus={translateContractStatus}
                translateContractType={translateContractType}
                translateContractTag={translateContractTag}
                badgeClass={getBadgeClass}
                t={t}
              />
              
              {/* Show More Button */}
              {hasMoreData && (
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={handleShowMore}
                    disabled={isLoadingMore}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoadingMore ? (
                      <>
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Đang tải...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        Hiển thị thêm {pageSize} tài liệu
                      </>
                    )}
                  </button>
                </div>
              )}
        </div>
          )}
        </PrimaryContent>
        
        {/* Table Settings Modal */}
        <TableSettings
          columns={tableColumns}
          onColumnsChange={handleTableColumnsChange}
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
          isOpen={showTableSettings}
          onClose={() => setShowTableSettings(false)}
        />
      </div>
    </DashboardLayout>
  )
}