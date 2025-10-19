'use client'

import React, { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout'
import { useTranslation } from '@/hooks/useTranslation'
import { translateContractType, translateContractStatus, translateContractTag } from '@/utils/tagTranslations'
import DocumentsFilters from '../_components/DocumentsFilters'
import DocumentsTable from '../_components/DocumentsTable'
import SkeletonTable from '../_components/SkeletonTable'
import { useDocumentsQuery } from '../_hooks/useDocumentsQuery'
import { Document } from '../_types'
import { HeaderPanel } from '@/components/ui'
import { PlusIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

export default function RepositoriesPage() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [type, setType] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [tagsLoading, setTagsLoading] = useState(false)
  const [tagsError, setTagsError] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [reloadTick, setReloadTick] = useState(0)

  const { data, loading, error, refetch } = useDocumentsQuery({
    pageNumber: 0,
    pageSize: 9,
    sortBy,
    sortDirection: sortDirection.toUpperCase() as 'ASC' | 'DESC',
    searchTerm: search,
    status,
    type,
    tags: selectedTags,
  })

  const items: Document[] = data?.content || []
  const totalElements = data?.totalElements || 0
  const totalPages = data?.totalPages || 0

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

  const refreshData = async () => { 
    setRefreshing(true)
    try { 
      setReloadTick(x => x + 1) 
    } finally { 
      setRefreshing(false) 
    } 
  }

  // Load available tags once - Disabled tags API
  useEffect(() => {
    const loadTags = async () => {
      setTagsLoading(true)
      setTagsError(false)
      try {
        // Mock tags for now
        const mockTags = [
          'Hợp đồng dịch vụ',
          'Hợp đồng mua bán',
          'Hợp đồng lao động',
          'Hợp đồng thuê',
          'Hợp đồng bảo hiểm',
          'Hợp đồng tín dụng',
          'Hợp đồng đầu tư',
          'Hợp đồng liên doanh',
          'Hợp đồng chuyển nhượng',
          'Hợp đồng ủy quyền'
        ]
        setAvailableTags(mockTags)
      } catch (error) {
        console.error('Error loading tags:', error)
        setTagsError(true)
      } finally {
        setTagsLoading(false)
      }
    }
    loadTags()
  }, [])

  const load = async () => {
    try {
      await refetch()
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  useEffect(() => {
    load()
  }, [search, status, type, selectedTags, sortBy, sortDirection, reloadTick])

  const toggleTag = (t: string) => {
    setSelectedTags(prev => 
      prev.includes(t) 
        ? prev.filter(tag => tag !== t)
        : [...prev, t]
    )
  }

  const toggleSelectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  const selectAll = () => {
    setSelectedItems(items.map(item => item.id))
  }

  const clearSelection = () => {
    setSelectedItems([])
  }

  const handleTableColumnsChange = (newColumns: any[]) => {
    // Handle table columns change
  }

  const handlePageSizeChange = (newPageSize: number) => {
    // Handle page size change
  }

  const handleShowMore = () => {}

  // Retry loading tags - Disabled tags API
  const handleRetryTags = () => {
    const loadTags = async () => {
      setTagsLoading(true)
      setTagsError(false)
      try {
        const mockTags = [
          'Hợp đồng dịch vụ',
          'Hợp đồng mua bán',
          'Hợp đồng lao động',
          'Hợp đồng thuê',
          'Hợp đồng bảo hiểm',
          'Hợp đồng tín dụng',
          'Hợp đồng đầu tư',
          'Hợp đồng liên doanh',
          'Hợp đồng chuyển nhượng',
          'Hợp đồng ủy quyền'
        ]
        setAvailableTags(mockTags)
      } catch (error) {
        console.error('Error loading tags:', error)
        setTagsError(true)
      } finally {
        setTagsLoading(false)
      }
    }
    loadTags()
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <HeaderPanel
            title="Kho tài liệu"
            subtitle="Quản lý và theo dõi tài liệu"
            right={
              <div className="flex items-center gap-2">
                <button className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                  <PlusIcon className="w-4 h-4" />
                  Tạo mới
                </button>
                <button 
                  onClick={refreshData}
                  disabled={refreshing}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  <ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  Làm mới
                </button>
              </div>
            }
          />
          <SkeletonTable />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <HeaderPanel
          title="Kho tài liệu"
          subtitle="Quản lý và theo dõi tài liệu"
          right={
            <div className="flex items-center gap-2">
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                <PlusIcon className="w-4 h-4" />
                Tạo mới
              </button>
              <button 
                onClick={refreshData}
                disabled={refreshing}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Làm mới
              </button>
            </div>
          }
        />

        <DocumentsFilters
          search={search}
          onSearchChange={setSearch}
          status={status}
          onStatusChange={setStatus}
          type={type}
          onTypeChange={setType}
          availableTags={availableTags}
          tagsLoading={tagsLoading}
          tagsError={tagsError}
          selectedTags={selectedTags}
          onToggleTag={toggleTag}
          onRetryTags={handleRetryTags}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          sortDirection={sortDirection}
          onToggleSortDirection={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
          showAdvanced={showAdvanced}
          onToggleAdvanced={() => setShowAdvanced(!showAdvanced)}
          onRefresh={refreshData}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        <DocumentsTable
          items={items}
          selectedItems={selectedItems}
          onToggleSelect={toggleSelectItem}
          onSelectAll={selectAll}
          onClearSelection={clearSelection}
          viewMode={viewMode}
          badgeClass={getBadgeClass}
          t={t}
        />
      </div>
    </DashboardLayout>
  )
}
