'use client'

import React, { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout'

export default function ThongKePage() {
  const [stats, setStats] = useState<{ totalContracts: number; approved: number; pending: number; rejected: number; byMonth: Array<{month:number; value:number}> } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch('/api/mock/stats')
        const json = await res.json()
        setStats(json)
      } catch (e: any) {
        setError(e?.message || 'Lỗi tải thống kê')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])
  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-6xl mx-auto px-2 sm:px-4">
        <div className="relative overflow-hidden rounded-2xl border bg-white shadow-sm ring-1 ring-gray-100">
          <div className="absolute inset-0 bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 opacity-50" />
          <div className="relative px-6 py-6">
            <h1 className="text-2xl font-bold text-gray-900">Thống kê</h1>
            <p className="mt-1 text-gray-600">Tổng quan hoạt động và số liệu chính.</p>
          </div>
          <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500" />
        </div>

        {error && <div className="rounded-xl border p-4 text-sm text-rose-700 bg-rose-50">{error}</div>}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {loading && Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border bg-white shadow-sm p-5 ring-1 ring-gray-100 animate-pulse">
              <div className="h-3 w-24 bg-gray-200 rounded" />
              <div className="mt-3 h-6 w-16 bg-gray-200 rounded" />
              <div className="mt-4 h-1 w-full bg-gray-100 rounded" />
            </div>
          ))}
          {!loading && stats && ([
            { label: 'Tổng hợp đồng', value: stats.totalContracts },
            { label: 'Đã duyệt', value: stats.approved },
            { label: 'Chờ duyệt', value: stats.pending },
            { label: 'Bị từ chối', value: stats.rejected },
          ] as const).map((k, i) => (
            <div key={i} className="rounded-2xl border bg-white shadow-sm p-5 ring-1 ring-gray-100">
              <p className="text-sm text-gray-500">{k.label}</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">{k.value}</p>
              <div className="mt-3 h-1 w-full rounded bg-gray-100">
                <div className="h-1 rounded bg-gradient-to-r from-sky-500 to-blue-600" style={{ width: `${(Number(k.value) % 100) + 10}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border bg-white shadow-sm ring-1 ring-gray-100 p-5">
            <h2 className="text-base font-semibold text-gray-900">Biểu đồ trạng thái</h2>
            <p className="text-sm text-gray-500">Placeholder cho biểu đồ tròn.</p>
            <div className="mt-4 h-64 rounded bg-gradient-to-br from-gray-50 to-gray-100 border" />
          </div>
          <div className="rounded-2xl border bg-white shadow-sm ring-1 ring-gray-100 p-5">
            <h2 className="text-base font-semibold text-gray-900">Xu hướng theo thời gian</h2>
            <p className="text-sm text-gray-500">Placeholder cho biểu đồ đường.</p>
            <div className="mt-4 h-64 rounded bg-gradient-to-br from-gray-50 to-gray-100 border" />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

