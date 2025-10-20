'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { DashboardLayout } from '@/components/layout'
import { HeaderPanel } from '@/components/ui'
import DocumentsFilters from '../_components/DocumentsFilters'
import DocumentsTable from '../_components/DocumentsTable'
import { fetchFiles } from '../_services/file-list-api'
import { mapFileApiPageToPaginatedDocuments } from '../_services/file-list-mapper'
// import { tagAPI } from '@/lib/api' // Disabled for now
import { useTranslation } from '@/hooks/useTranslation'

// Mock paginated list data (fallback if API empty, based on sample.json structure)
const mockPaginatedData = {
  data: [
    {
      id: '1',
      title: 'Hợp đồng mẫu ID 1 - Dịch vụ phát triển phần mềm',
      status: 'ACTIVE',
      contractType: 'Phát triển phần mềm',
      tags: ['Phần mềm', 'Dịch vụ', 'IT'],
      createdAt: '2025-10-19T08:45:00Z',
      updatedAt: '2025-10-19T08:45:00Z',
      fileType: 'text/plain',
      fileSize: 312,
      owner: 'system',
      // Additional sample fields for table display
      totalValue: 100000,
      currency: 'USD',
      effectiveDate: '2025-11-01',
      expiryDate: '2025-12-31',
      category: 'Hợp đồng'
    },
    {
      id: '2',
      title: 'Hóa đơn thanh toán - Tháng 10/2025',
      status: 'DRAFT',
      contractType: 'Hóa đơn',
      tags: ['Thanh toán', 'Tài chính'],
      createdAt: '2025-10-20T10:00:00Z',
      updatedAt: '2025-10-20T10:00:00Z',
      fileType: 'application/pdf',
      fileSize: 1024,
      owner: 'user-001',
      totalValue: 50000,
      currency: 'VND',
      effectiveDate: null,
      expiryDate: null,
      category: 'Hóa đơn'
    },
    {
      id: '3',
      title: 'Báo cáo tiến độ dự án DocGO',
      status: 'APPROVED',
      contractType: 'Báo cáo',
      tags: ['Dự án', 'Tiến độ'],
      createdAt: '2025-10-18T15:30:00Z',
      updatedAt: '2025-10-19T09:15:00Z',
      fileType: 'application/pdf',
      fileSize: 2048,
      owner: 'user-002',
      totalValue: null,
      currency: null,
      effectiveDate: null,
      expiryDate: null,
      category: 'Báo cáo'
    }
  ],
  totalElements: 3,
  totalPages: 1,
  pageNumber: 0,
  pageSize: 10,
  sortBy: 'createdAt',
  sortDirection: 'DESC'
}

export default function DocumentsPage() {
  const params = useParams() as { id: string }
  const repositoryId = params?.id
  const { t } = useTranslation()

  const [documents, setDocuments] = useState<any>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')
  const [page, setPage] = useState<number>(0)
  const [pageSize, setPageSize] = useState<number>(10)
  const [sortBy, setSortBy] = useState<string>('createdAt')
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('DESC')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [activeTab, setActiveTab] = useState<string>('all')
  const [reloadTick, setReloadTick] = useState<number>(0)
  const searchRef = useRef<NodeJS.Timeout>()

  const debouncedSearch = useMemo(() => {
    return searchTerm.length > 0 ? searchTerm : ''
  }, [searchTerm])

  useEffect(() => {
    const loadDocuments = async () => {
      setLoading(true)
      setError('')
      let apiData = null

      try {
        // Fetch from API
        console.log('Fetching files for repository:', repositoryId, 'page:', page, 'search:', debouncedSearch)
        const resp = await fetchFiles({
          pageNumber: page,
          pageSize,
          sortBy,
          sortDirection,
          searchTerm: debouncedSearch,
          repositoryId,
          includeDeleted: false,
          type: activeTab === 'contracts' ? 'CONTRACT' : undefined
        })
        if (resp?.data) {
          apiData = mapFileApiPageToPaginatedDocuments(resp.data)
          console.log('API list success:', apiData)
        } else {
          console.log('API list empty, using mock fallback')
        }
      } catch (e: any) {
        console.error('Error fetching documents list:', e)
        console.log('API list failed, using mock fallback')
      }

      // Fallback to mock if API empty/fail
      const finalData = apiData || mockPaginatedData
      setDocuments(finalData.data)
      setLoading(false)
    }

    loadDocuments()

    return () => {
      if (searchRef.current) {
        clearTimeout(searchRef.current)
      }
    }
  }, [page, pageSize, sortBy, sortDirection, debouncedSearch, activeTab, reloadTick, repositoryId])

  // Debounce search input
  useEffect(() => {
    if (searchRef.current) {
      clearTimeout(searchRef.current)
    }
    searchRef.current = setTimeout(() => {
      setPage(0)
    }, 500)
  }, [searchTerm])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <HeaderPanel
            title={`Quản lý tài liệu${repositoryId ? ` - Kho ${repositoryId}` : ''}`}
            breadcrumbs={[
              { label: 'Tài liệu', href: '/documents' },
              { label: repositoryId ? `Kho ${repositoryId}` : 'Danh sách', current: true }
            ]}
            right={
              <div className="flex items-center gap-2">
                <button className="btn-primary">Thêm mới</button>
                <button className="btn-secondary">Upload</button>
              </div>
            }
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-200 h-32 rounded-lg" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <HeaderPanel
            title={`Quản lý tài liệu${repositoryId ? ` - Kho ${repositoryId}` : ''}`}
            breadcrumbs={[
              { label: 'Tài liệu', href: '/documents' },
              { label: repositoryId ? `Kho ${repositoryId}` : 'Danh sách', current: true }
            ]}
          />
          <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="text-red-800 font-medium">Lỗi tải tài liệu</h3>
            <p className="text-red-600">{error}</p>
            <button onClick={() => setReloadTick(prev => prev + 1)} className="btn-primary mt-2">
              Thử lại
            </button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <HeaderPanel
          title={`Quản lý tài liệu${repositoryId ? ` - Kho ${repositoryId}` : ''}`}
          breadcrumbs={[
            { label: 'Tài liệu', href: '/documents' },
            { label: repositoryId ? `Kho ${repositoryId}` : 'Danh sách', current: true }
          ]}
          right={
            <div className="flex items-center gap-2">
              <DocumentsFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                pageSize={pageSize}
                onPageSizeChange={setPageSize}
                sortBy={sortBy}
                sortDirection={sortDirection}
                onSortChange={({ sortBy: sb, sortDirection: sd }) => {
                  setSortBy(sb)
                  setSortDirection(sd)
                  setPage(0)
                }}
              />
              <button className="btn-primary">Thêm mới</button>
              <button className="btn-secondary">Upload</button>
              <button onClick={() => setReloadTick(prev => prev + 1)} className="btn-outline">
                Làm mới
              </button>
            </div>
          }
        >
          {/* Tab navigation if needed */}
          <div className="flex space-x-4 mt-4">
            <button
              className={`px-4 py-2 rounded ${activeTab === 'all' ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}
              onClick={() => setActiveTab('all')}
            >
              Tất cả ({documents.length})
            </button>
            <button
              className={`px-4 py-2 rounded ${activeTab === 'contracts' ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}
              onClick={() => setActiveTab('contracts')}
            >
              Hợp đồng
            </button>
            <button
              className={`px-4 py-2 rounded ${activeTab === 'documents' ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}
              onClick={() => setActiveTab('documents')}
            >
              Tài liệu
            </button>
          </div>
        </HeaderPanel>

        <div className="bg-white rounded-lg shadow">
          <DocumentsTable
            documents={documents}
            page={page}
            pageSize={pageSize}
            totalElements={documents.length} // From mock or API totalElements
            onPageChange={setPage}
            loading={loading}
            repositoryId={repositoryId}
            onReload={() => setReloadTick(prev => prev + 1)}
          />
        </div>

        {/* Debug section for list data */}
        <div className="p-4 bg-gray-100 rounded-lg">
          <h3 className="font-bold mb-2">Debug: List Data (API or Mock)</h3>
          <pre className="text-xs overflow-auto max-h-96">
            {JSON.stringify({ documents, total: documents.length }, null, 2)}
          </pre>
          <p className="text-sm text-gray-600 mt-2">Console log: Check for 'API list success' or 'using mock fallback'.</p>
        </div>
      </div>
    </DashboardLayout>
  )
}
