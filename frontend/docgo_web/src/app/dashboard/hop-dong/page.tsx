'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { DashboardLayout } from '@/components/layout'
import { MagnifyingGlassIcon, TagIcon } from '@heroicons/react/24/outline'

type ContractItem = {
  id: number
  title: string
  description?: string
  status: string
  contractType: string
  tags?: string[]
  createdAt: string
  updatedAt: string
  creatorId: number
  parties: { name: string; role: string }[]
  totalValue: number
  currency: string
  effectiveDate: string
  expiryDate: string
}

const STATUS = ['ALL','DRAFT','PENDING_REVIEW','APPROVED','ACTIVE','EXPIRED','TERMINATED','ARCHIVED'] as const
const TYPES = ['ALL','Dịch vụ','Mua bán','Hợp tác','Lao động','Bảo mật','Khác'] as const
const TAGS = ['ưu_tiên','gấp','gia_hạn','cao_giá','đối_tác_mới','rủi_ro']

export default function HopDongPage() {
  const [items, setItems] = useState<ContractItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [search, setSearch] = useState<string>('')
  const [status, setStatus] = useState<string>('ALL')
  const [type, setType] = useState<string>('ALL')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [page, setPage] = useState<number>(0)
  const [pageSize, setPageSize] = useState<number>(9)
  const [totalPages, setTotalPages] = useState<number>(1)

  const queryString = useMemo(() => {
    const params = new URLSearchParams()
    params.set('pageNumber', String(page))
    params.set('pageSize', String(pageSize))
    if (search.trim()) params.set('searchTerm', search.trim())
    if (status !== 'ALL') params.set('status', status)
    if (type !== 'ALL') params.set('type', type)
    if (selectedTags.length > 0) params.set('tags', selectedTags.join(','))
    return params.toString()
  }, [page, pageSize, search, status, type, selectedTags])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/mock/contracts?${queryString}`)
      const json = await res.json()
      setItems(json?.data?.content || [])
      setTotalPages(json?.data?.totalPages || 1)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryString])

  const toggleTag = (t: string) => {
    setPage(0)
    setSelectedTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Danh sách hợp đồng</h1>
            <p className="text-gray-600">Tìm kiếm, lọc theo trạng thái, loại và tags</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(0) }}
                  onKeyDown={(e) => { if (e.key === 'Enter') fetchData() }}
                  placeholder="Tìm theo tiêu đề hoặc mô tả"
                  className="w-full rounded-lg border-gray-300 pl-10 pr-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <select
                value={status}
                onChange={(e) => { setStatus(e.target.value); setPage(0) }}
                className="w-full rounded-lg border-gray-300 py-2 px-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {STATUS.map(s => (
                  <option key={s} value={s}>{s === 'ALL' ? 'Tất cả trạng thái' : s}</option>
                ))}
              </select>
            </div>

            {/* Type */}
            <div>
              <select
                value={type}
                onChange={(e) => { setType(e.target.value); setPage(0) }}
                className="w-full rounded-lg border-gray-300 py-2 px-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {TYPES.map(t => (
                  <option key={t} value={t}>{t === 'ALL' ? 'Tất cả loại' : t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div className="mt-4 flex flex-wrap gap-2">
            {TAGS.map(t => {
              const active = selectedTags.includes(t)
              return (
                <button
                  key={t}
                  onClick={() => toggleTag(t)}
                  className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm transition ${active ? 'bg-primary-50 text-primary-700 border-primary-200' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                >
                  <TagIcon className="h-4 w-4" />
                  {t}
                </button>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div>
          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
              <p className="mt-4 text-gray-600">Đang tải...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-600">Không tìm thấy hợp đồng phù hợp.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {items.map(c => (
                  <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition">
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="font-semibold text-gray-900 line-clamp-2">{c.title}</h3>
                      <div className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">{c.status}</div>
                    </div>
                    <p className="mt-2 text-sm text-gray-600 line-clamp-3">{c.description || 'Không có mô tả'}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">{c.contractType}</span>
                      {c.tags?.slice(0,3).map(t => (
                        <span key={t} className="text-xs px-2 py-1 rounded-full bg-gray-50 text-gray-700 border border-gray-200">#{t}</span>
                      ))}
                    </div>
                    <div className="mt-4 text-sm text-gray-500 space-y-1">
                      <div className="flex justify-between"><span>Hiệu lực</span><span>{c.effectiveDate}</span></div>
                      <div className="flex justify-between"><span>Hết hạn</span><span>{c.expiryDate}</span></div>
                      <div className="flex justify-between"><span>Giá trị</span><span>{c.totalValue.toLocaleString('vi-VN')} {c.currency}</span></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="px-3 py-2 text-sm rounded-md border bg-white text-gray-700 disabled:opacity-50"
                  >
                    Trước
                  </button>
                  <span className="px-3 py-2 text-sm text-gray-600">Trang {page + 1} / {totalPages}</span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                    className="px-3 py-2 text-sm rounded-md border bg-white text-gray-700 disabled:opacity-50"
                  >
                    Sau
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

