'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { DashboardLayout } from '@/components/layout'
import { TitlePanel } from '@/components/ui'
import { MagnifyingGlassIcon, TagIcon } from '@heroicons/react/24/outline'
import { contractAPI } from '@/lib/api'
import { InlineLoading } from '@/components/ui/LoadingSpinner'
import { CardSkeleton, TableSkeleton, ListSkeleton } from '@/components/ui/LoadingSkeleton'
import { tagAPI } from '@/lib/api'
import { useTranslation } from '@/hooks/useTranslation'
import { translateContractType, translateContractStatus, translateContractTag, getContractTypes, getContractStatuses } from '@/utils/tagTranslations'
import { CONTRACT_TAGS, getTagDisplayName } from '@/constants/contractTags'
import ContractControlPanel from '@/components/contracts/ContractControlPanel'
import CustomTable from '@/components/contracts/CustomTable'
import TableSettings, { TableColumn } from '@/components/contracts/TableSettings'
import TokenRefreshHelper from '@/utils/token-refresh-helper'

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

// STATUS_OPTIONS will be generated dynamically using getContractStatuses
const TYPES = ['ALL','SERVICE_AGREEMENT','PURCHASE_AGREEMENT','PARTNERSHIP_AGREEMENT','EMPLOYMENT_CONTRACT','CONFIDENTIALITY_AGREEMENT','OTHER'] as const
// Sử dụng CONTRACT_TAGS từ constants thay vì hardcode array
const TAGS = CONTRACT_TAGS

export default function ContractsPage() {
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
  const [pageSize, setPageSize] = useState<number>(9)
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
  const [activeTab, setActiveTab] = useState<'all' | 'contracts'>('contracts')
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [previewContent, setPreviewContent] = useState<string>('')
  const abortRef = useRef<AbortController | null>(null)

  // Table columns configuration
  const [tableColumns, setTableColumns] = useState<TableColumn[]>([
    { key: 'checkbox', label: '', visible: true, order: 0 },
    { key: 'title', label: 'Hợp đồng', visible: true, order: 1 },
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

  const fetchData = async (isLoadMore = false) => {
    console.log('[Contracts] Starting fetchData...', { isLoadMore })
    
    if (isLoadMore) {
      setIsLoadingMore(true)
    } else {
    setLoading(true)
      setPage(0) // Reset to first page when not loading more
    }
    
    try {
      // Abort previous in-flight request
      if (abortRef.current) {
        console.log('[Contracts] Aborting previous request')
        try { 
          abortRef.current.abort() 
        } catch (e) {
          console.warn('[Contracts] Error aborting previous request:', e)
        }
      }
      const controller = new AbortController()
      abortRef.current = controller

      const currentPage = isLoadMore ? Math.floor(displayedItems.length / pageSize) : 0
      const params: any = {
        pageNumber: currentPage,
        pageSize,
        includeDeleted: false,
      }
      const trimmed = debouncedSearch.trim()
      if (trimmed.length >= 2) params.searchTerm = trimmed
      if (sortBy) params.sortBy = sortBy
      if (sortDirection) params.sortDirection = sortDirection.toUpperCase()
      if (status && status !== 'ALL') params.status = status
      if (type && type !== 'ALL') params.type = type
      if (selectedTags.length > 0) params.tags = selectedTags.join(',')

      console.log('[Contracts] Request params:', params)

      // Ensure valid token before making request
      const tokenValid = await TokenRefreshHelper.ensureValidToken()
      
      if (!tokenValid) {
        console.warn('[Contracts] Token validation failed, request may fail')
      }

      console.log('[Contracts] Making API request...')
      const res = await contractAPI.getContracts(params, { signal: controller.signal })
      const payload: any = res.data?.data || {}
      const content = Array.isArray(payload.content) ? payload.content : []

      const computeExpiryDate = (effectiveDate: string, term: string | undefined): string => {
        if (!effectiveDate || !term) return ''
        // Try to parse term as number of months (e.g., "12", "12M", "12 months")
        const match = String(term).match(/(\d{1,3})\s*(m|mo|mon|month|months)?/i)
        if (match) {
          const months = parseInt(match[1], 10)
          if (!isNaN(months)) {
            const d = new Date(effectiveDate)
            if (!isNaN(d.getTime())) {
              d.setMonth(d.getMonth() + months)
              return d.toISOString().slice(0, 10)
            }
          }
        }
        return ''
      }

      const mapped: ContractItem[] = content.map((c: any) => ({
        id: String(c.id),
        title: c.title || c.contractNumber || `Contract ${c.id}`,
        description: c.object || c.description || '',
        status: c.status || 'DRAFT',
        contractType: c.contractType || 'Other',
        tags: c.tags || [],
        contractNumber: c.contractNumber,
        createdAt: c.createdAt || '',
        updatedAt: c.updatedAt || '',
        creatorId: 0,
        parties: (c.parties || []).map((p: any) => ({ name: p.name || '', role: p.role || '' })),
        totalValue: Number(c.paymentDetails?.totalValue || 0),
        currency: c.paymentDetails?.currency || 'VND',
        effectiveDate: c.effectiveDate || '',
        expiryDate: c.expiryDate || computeExpiryDate(c.effectiveDate, c.term),
        riskLevel: c.riskAssessment?.riskLevel,
        reminders: Array.isArray(c.reminders) ? c.reminders : [],
      }))

      if (isLoadMore) {
        // Append new items to existing ones
        const newItems = [...displayedItems, ...mapped]
        setDisplayedItems(newItems)
        setItems(newItems)
        setAllItems(newItems)
      } else {
        // Replace all items
      setItems(mapped)
        setDisplayedItems(mapped)
        setAllItems(mapped)
      }

      const totalPagesFromApi = payload?.result?.totalPages ?? payload?.totalPages ?? 1
      setTotalPages(Number(totalPagesFromApi) || 1)
      
      // Check if there's more data to load
      const currentTotalItems = isLoadMore ? displayedItems.length + mapped.length : mapped.length
      setHasMoreData(currentTotalItems < (payload?.result?.totalElements ?? payload?.totalElements ?? 0))
      
      console.log('[Contracts] Successfully fetched data:', {
        itemsCount: mapped.length,
        totalItems: currentTotalItems,
        totalPages: totalPagesFromApi,
        hasMoreData: currentTotalItems < (payload?.result?.totalElements ?? payload?.totalElements ?? 0),
        response: res.data
      })
    } catch (e: any) {
      console.error('[Contracts] Error fetching data:', {
        error: e,
        message: e?.message,
        response: e?.response?.data,
        status: e?.response?.status,
        params: {
          page,
          pageSize,
          status,
          type,
          selectedTags,
          sortBy,
          sortDirection,
          search: debouncedSearch
        }
      })
      if (!isLoadMore) {
      setItems([])
        setDisplayedItems([])
        setAllItems([])
      setTotalPages(1)
      }
    } finally {
      setLoading(false)
      setIsLoadingMore(false)
      console.log('[Contracts] Fetch completed')
    }
  }

  // Hàm refresh riêng với loading state và toast notification
  const refreshData = async () => {
    console.log('[Contracts] Starting refresh...')
    setRefreshing(true)
    
    try {
      // Abort previous in-flight request
      if (abortRef.current) {
        console.log('[Contracts] Aborting previous request')
        try { 
          abortRef.current.abort() 
        } catch (e) {
          console.warn('[Contracts] Error aborting previous request:', e)
        }
      }
      const controller = new AbortController()
      abortRef.current = controller

      const params: any = {
        pageNumber: 0,
        pageSize,
        includeDeleted: false,
      }
      const trimmed = debouncedSearch.trim()
      if (trimmed.length >= 2) params.searchTerm = trimmed
      if (sortBy) params.sortBy = sortBy
      if (sortDirection) params.sortDirection = sortDirection.toUpperCase()
      if (status && status !== 'ALL') params.status = status
      if (type && type !== 'ALL') params.type = type
      if (selectedTags.length > 0) params.tags = selectedTags.join(',')

      console.log('[Contracts] Refresh params:', params)

      // Ensure valid token before making request
      const tokenValid = await TokenRefreshHelper.ensureValidToken()
      
      if (!tokenValid) {
        console.warn('[Contracts] Token validation failed, request may fail')
      }

      console.log('[Contracts] Making refresh API request...')
      const res = await contractAPI.refreshContracts(params, { signal: controller.signal })
      const payload: any = res.data?.data || {}
      
      console.log('[Contracts] Refresh response:', { 
        status: res.status, 
        data: payload,
        totalElements: payload?.result?.totalElements ?? payload?.totalElements ?? 0
      })

      const newItems = payload?.result?.content ?? payload?.content ?? []
      const currentTotalItems = payload?.result?.totalElements ?? payload?.totalElements ?? 0
      const totalPagesFromApi = payload?.result?.totalPages ?? payload?.totalPages ?? 1

      // Reset to first page and update data
      setPage(0)
      setItems(newItems)
      setDisplayedItems(newItems)
      setAllItems(newItems)
      setTotalPages(totalPagesFromApi)
      
      // Show success toast
      console.log('[Contracts] Refresh completed successfully')
      
    } catch (e: any) {
      console.error('[Contracts] Error refreshing data:', {
        error: e,
        message: e?.message,
        response: e?.response?.data,
        status: e?.response?.status
      })
    } finally {
      setRefreshing(false)
      console.log('[Contracts] Refresh completed')
    }
  }

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
          console.warn('[Contracts] No tags returned from API')
        } else {
        setAvailableTags(tagsFromApi)
          setTagsError(false)
        console.log('[Contracts] Loaded tags from API:', tagsFromApi)
        }
      } catch (error) {
        console.error('[Contracts] Error loading tags:', error)
        setTagsError(true)
        setAvailableTags([])
      } finally {
        setTagsLoading(false)
      }
    }
    loadTags()
  }, [])

  // Unified data fetching with debounce for all filters
  useEffect(() => {
    const handler = setTimeout(() => {
      console.log('[Contracts] Fetching data with params:', {
        page,
        pageSize,
        status,
        type,
        selectedTags,
        sortBy,
        sortDirection,
        search: debouncedSearch
      })
      fetchData()
    }, 300) // Reduced debounce time for better UX
    
    return () => clearTimeout(handler)
  }, [page, pageSize, status, type, selectedTags, sortBy, sortDirection, debouncedSearch])

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

  // Control Panel Handlers
  const handleCreateContract = () => {
    // Navigate to create document page
    window.location.href = '/create-document'
  }

  const handleEditSelected = () => {
    if (selectedItems.length === 0) return
    
    if (selectedItems.length === 1) {
      // Edit single contract
      window.location.href = `/documents/${selectedItems[0]}`
    } else {
      // Bulk edit - show modal or navigate to bulk edit page
      alert(`Chức năng chỉnh sửa hàng loạt cho ${selectedItems.length} hợp đồng đang được phát triển`)
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedItems.length === 0) return
    
    const confirmed = confirm(`Bạn có chắc chắn muốn xóa ${selectedItems.length} hợp đồng đã chọn?`)
    if (confirmed) {
      try {
        setLoading(true)
        
        // Gọi API bulk delete
        const response = await fetch('/api/documents/bulk', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ids: selectedItems
          })
        })
        
        if (!response.ok) {
          throw new Error('Không thể xóa hợp đồng')
        }
        
        const result = await response.json()
        
        if (result.statusCode === 200) {
          // Hiển thị kết quả
          if (result.data.failedCount > 0) {
            alert(`Xóa thành công ${result.data.successCount} hợp đồng. ${result.data.failedCount} hợp đồng không thể xóa.`)
          } else {
            alert(`Đã xóa thành công ${result.data.successCount} hợp đồng.`)
          }
          
          // Refresh danh sách
          setPage(0)
          setSelectedItems([])
          // Trigger refresh data
          window.location.reload()
        } else {
          throw new Error(result.description || 'Có lỗi xảy ra khi xóa hợp đồng')
        }
      } catch (e: any) {
        console.error('Error deleting contracts:', e)
        alert(`Lỗi khi xóa hợp đồng: ${e?.message || 'Không rõ lỗi'}`)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleSendForApproval = () => {
    if (selectedItems.length === 0) return
    
    const confirmed = confirm(`Gửi ${selectedItems.length} hợp đồng để duyệt?`)
    if (confirmed) {
      // TODO: Implement send for approval
      alert(`Chức năng gửi duyệt hàng loạt cho ${selectedItems.length} hợp đồng đang được phát triển`)
    }
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

  const handleShowMore = () => {
    if (hasMoreData && !isLoadingMore) {
      fetchData(true)
    }
  }

  // Preview functionality
  const handlePreview = (item: ContractItem) => {
    // Mock preview content - in real implementation, this would fetch from API
    const mockContent = `
      <div class="p-4">
        <h3 class="font-bold text-lg mb-2">${item.title}</h3>
        <p class="text-sm text-gray-600 mb-2">${item.description || 'Không có mô tả'}</p>
        <div class="space-y-1 text-xs">
          <p><strong>Trạng thái:</strong> ${item.status}</p>
          <p><strong>Loại:</strong> ${item.contractType}</p>
          <p><strong>Giá trị:</strong> ${item.totalValue.toLocaleString('vi-VN')} ${item.currency}</p>
          <p><strong>Hiệu lực:</strong> ${item.effectiveDate}</p>
          <p><strong>Hết hạn:</strong> ${item.expiryDate}</p>
        </div>
      </div>
    `
    setPreviewContent(mockContent)
  }

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
        console.error('[Contracts] Error loading tags on retry:', error)
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
        <TitlePanel
          title={
            <span className="whitespace-nowrap overflow-hidden text-ellipsis">📁QUẢN LÝ TÀI LIỆU Tìm kiếm, lọc trạng thái/loại và gắn thẻ nhanh</span>
          }
          variant="primary"
        />

        {/* Tab Navigation (compact) */}
        <div className="bg-white/80 backdrop-blur rounded-2xl border border-gray-200 p-2 shadow-sm">
          <div className="flex space-x-1 bg-gray-100 p-0.5 rounded-md">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-1.5 px-3 rounded text-xs font-medium transition-all duration-200 ${
                activeTab === 'all'
                  ? 'bg-white text-indigo-700 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Tất cả tài liệu
            </button>
            <button
              onClick={() => setActiveTab('contracts')}
              className={`flex-1 py-1.5 px-3 rounded text-xs font-medium transition-all duration-200 ${
                activeTab === 'contracts'
                  ? 'bg-white text-indigo-700 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Hợp đồng
            </button>
          </div>
        </div>

        {/* Control Panel */}
        <ContractControlPanel
          selectedItems={selectedItems}
          onRefresh={fetchData}
          onCreateContract={handleCreateContract}
          onEditSelected={handleEditSelected}
          onDeleteSelected={handleDeleteSelected}
          onSendForApproval={handleSendForApproval}
          onClearSelection={clearSelection}
        />

        {/* Filters (compact inline) */}
        <div className="bg-white/80 backdrop-blur rounded-2xl border border-gray-200 p-3 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm tiêu đề hoặc mô tả"
                className="w-64 rounded-md border-gray-300 pl-7 pr-2 py-1.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(0) }}
              className="rounded-md border-gray-300 py-1.5 px-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {getContractStatuses(t).map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <select
              value={type}
              onChange={(e) => { setType(e.target.value); setPage(0) }}
              className="rounded-md border-gray-300 py-1.5 px-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {getContractTypes(t).map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="ml-auto flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700"
            >
              <span>{showAdvanced ? 'Ẩn' : 'Nâng cao'}</span>
              <span className={`transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`}>▼</span>
            </button>
          </div>
          {showAdvanced && (
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-600">Sắp xếp:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-md border-gray-300 py-1 px-2 text-xs focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="createdAt">Ngày tạo</option>
                  <option value="title">Tên hợp đồng</option>
                  <option value="status">Trạng thái</option>
                  <option value="totalValue">Giá trị</option>
                  <option value="effectiveDate">Ngày hiệu lực</option>
                </select>
              </div>
              <button
                onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                className="flex items-center gap-1 px-2 py-1 rounded-md border border-gray-300 hover:bg-gray-50 text-xs"
              >
                {sortDirection === 'asc' ? '↑ Tăng dần' : '↓ Giảm dần'}
              </button>
            </div>
          )}
        </div>

        {/* Content Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition ${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition ${viewMode === 'list' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <span className="text-sm text-gray-600">
              {displayedItems.length} hợp đồng
              {selectedItems.length > 0 && ` · ${selectedItems.length} đã chọn`}
            </span>
          </div>
          
            <div className="flex items-center gap-2">
              {/* Refresh Button */}
              <button
                onClick={() => refreshData()}
                disabled={refreshing}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Làm mới dữ liệu"
              >
                {refreshing ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )}
              </button>
              
            {viewMode === 'list' && (
              <button
                onClick={() => setShowTableSettings(true)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                title="Cài đặt bảng"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
          )}
          </div>
        </div>

        {/* Content */}
        <div>
          {loading ? (
            <div className="space-y-4">
              <CardSkeleton className="h-10" />
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <CardSkeleton key={i} className="h-48" />
                ))}
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="mb-4">
                  <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-600 mb-6">Không tìm thấy hợp đồng phù hợp.</p>
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
            <div>
              {/* Grid Header with Select All */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === items.length && items.length > 0}
                    onChange={selectedItems.length === items.length ? clearSelection : selectAll}
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
                      onChange={() => toggleSelectItem(c.id)}
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
                        {c.reminders && c.reminders.length > 0 && (
                          <span title="Có nhắc nhở" className="text-amber-600">🔔</span>
                        )}
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
                      {c.parties && c.parties.length > 0 && (
                        <div className="flex justify-between"><span>Đối tác</span><span className="truncate max-w-[60%]">{c.parties.map(p => p.name).filter(Boolean).slice(0,2).join(' · ')}</span></div>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="mt-4 flex gap-2 ml-6">
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          // TODO: Implement open file functionality
                          alert('Chức năng mở tệp đang được phát triển')
                        }}
                        className="flex-1 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
                      >
                        📁 Mở tệp
                      </button>
                      <div className="relative flex-1">
                        <button
                          onMouseEnter={() => {
                            setHoveredItem(c.id)
                            handlePreview(c)
                          }}
                          onMouseLeave={() => setHoveredItem(null)}
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            // TODO: Implement full preview functionality
                            alert('Chức năng xem preview đang được phát triển')
                          }}
                          className="w-full px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                        >
                          👁️ Xem preview
                        </button>
                        
                        {/* Preview Popup */}
                        {hoveredItem === c.id && (
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                            <div className="p-3">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-sm text-gray-900">Preview</h4>
                                <button
                                  onClick={() => setHoveredItem(null)}
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                              <div 
                                className="text-xs text-gray-600 max-h-40 overflow-y-auto"
                                dangerouslySetInnerHTML={{ __html: previewContent }}
                              />
                            </div>
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-200"></div>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          // TODO: Implement download functionality
                          alert('Chức năng tải xuống đang được phát triển')
                        }}
                        className="flex-1 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        ⬇️ Tải xuống
                      </button>
                    </div>
                  </Link>
                </div>
              ))}
              </div>
            </div>
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
                badgeClass={badgeClass}
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
                        Hiển thị thêm {pageSize} hợp đồng
                      </>
                    )}
                  </button>
                </div>
              )}
        </div>
          )}

        </div>

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

function badgeClass(status: string) {
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

