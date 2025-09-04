'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout'

export default function PheDuyetTaiKhoanPage() {
  const [items, setItems] = useState<Array<{ id: string; email: string; requestedAt: string }>>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/mock/approvals')
      const json = await res.json()
      setItems(json?.items || [])
    } catch (e: any) {
      setError(e?.message || 'Lỗi tải yêu cầu')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const act = async (id: string, action: 'approve' | 'reject') => {
    try {
      setBusyId(id)
      const res = await fetch('/api/mock/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action })
      })
      if (!res.ok) throw new Error('Yêu cầu không thành công')
      setItems(prev => prev.filter(x => x.id !== id))
    } catch (e: any) {
      setError(e?.message || 'Lỗi xử lý')
    } finally {
      setBusyId(null)
    }
  }
  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-6xl mx-auto px-2 sm:px-4">
        <div className="relative overflow-hidden rounded-2xl border bg-white shadow-sm ring-1 ring-gray-100">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-50 via-yellow-50 to-lime-50 opacity-50" />
          <div className="relative px-6 py-6">
            <h1 className="text-2xl font-bold text-gray-900">Phê duyệt tài khoản</h1>
            <p className="mt-1 text-gray-600">Xem và xử lý yêu cầu phê duyệt đăng ký.</p>
          </div>
          <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-500 to-lime-500" />
        </div>

        <div className="rounded-2xl border bg-white shadow-sm ring-1 ring-gray-100">
          <div className="border-b px-5 py-4 flex items-center justify-between bg-gray-50/60">
            <h2 className="text-base font-semibold text-gray-900">Yêu cầu chờ duyệt</h2>
            <button onClick={load} className="px-3 py-2 text-sm rounded-md bg-amber-600 text-white hover:bg-amber-700">Làm mới</button>
          </div>
          {error && <div className="m-4 rounded border p-3 text-sm text-rose-700 bg-rose-50">{error}</div>}
          <div className="divide-y">
            {loading && Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-4 flex items-center justify-between">
                <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
                <div className="h-8 w-40 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
            {!loading && items.map(it => (
              <div key={it.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <p className="font-medium text-gray-900">{it.email}</p>
                  <p className="text-xs text-gray-500">Đăng ký lúc {it.requestedAt}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 text-xs rounded-md border hover:bg-gray-50">Xem</button>
                  <button onClick={() => act(it.id, 'approve')} disabled={busyId===it.id} className="px-3 py-1.5 text-xs rounded-md bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50">{busyId===it.id?'Đang duyệt...':'Duyệt'}</button>
                  <button onClick={() => act(it.id, 'reject')} disabled={busyId===it.id} className="px-3 py-1.5 text-xs rounded-md bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50">{busyId===it.id?'Đang từ chối...':'Từ chối'}</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

