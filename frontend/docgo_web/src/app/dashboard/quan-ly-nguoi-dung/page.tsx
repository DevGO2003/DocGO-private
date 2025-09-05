'use client'

import React, { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout'

export default function QuanLyNguoiDungPage() {
  const [users, setUsers] = useState<Array<{ id: string; name: string; email: string; role: string; status: string }>>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch('/api/mock/users')
        const json = await res.json()
        setUsers(json?.items || [])
      } catch (e: any) {
        setError(e?.message || 'Lỗi tải người dùng')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = users.filter(u =>
    (!query || (u.name?.toLowerCase().includes(query.toLowerCase()) || u.email?.toLowerCase().includes(query.toLowerCase()))) &&
    (!role || u.role === role) &&
    (!status || u.status === status)
  )

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-6xl mx-auto px-2 sm:px-4">
        <div className="relative overflow-hidden rounded-2xl border bg-white shadow-sm ring-1 ring-gray-100">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-50 via-fuchsia-50 to-pink-50 opacity-50" />
          <div className="relative px-6 py-6">
            <h1 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h1>
            <p className="mt-1 text-gray-600">Tạo, chỉnh sửa, khóa và phân quyền người dùng.</p>
          </div>
          <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500" />
        </div>

        <div className="rounded-2xl border bg-white shadow-sm ring-1 ring-gray-100">
          <div className="border-b px-5 py-4 flex items-center justify-between bg-gray-50/60">
            <h2 className="text-base font-semibold text-gray-900">Tìm kiếm</h2>
            <button className="px-3 py-2 text-sm rounded-md bg-violet-600 text-white hover:bg-violet-700">+ Thêm người dùng</button>
          </div>
          <div className="p-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <input value={query} onChange={e=>setQuery(e.target.value)} className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" placeholder="Tên / Email" />
            <select value={role} onChange={e=>setRole(e.target.value)} className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500">
              <option value="">Tất cả vai trò</option>
              <option value="Admin">Admin</option>
              <option value="Reviewer">Reviewer</option>
              <option value="User">User</option>
            </select>
            <select value={status} onChange={e=>setStatus(e.target.value)} className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500">
              <option value="">Tất cả trạng thái</option>
              <option value="Active">Active</option>
              <option value="Locked">Locked</option>
            </select>
            <button className="px-4 py-2 rounded-md bg-gray-800 text-white hover:bg-black">Tìm</button>
          </div>
        </div>

        {error && <div className="rounded-xl border p-4 text-sm text-rose-700 bg-rose-50">{error}</div>}
        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm ring-1 ring-gray-100">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Tên</th>
                <th className="px-4 py-3 text-left font-medium">Email</th>
                <th className="px-4 py-3 text-left font-medium">Vai trò</th>
                <th className="px-4 py-3 text-left font-medium">Trạng thái</th>
                <th className="px-4 py-3 text-right font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading && Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-4 py-3"><div className="h-4 w-32 bg-gray-200 rounded" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-40 bg-gray-200 rounded" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-20 bg-gray-200 rounded" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-16 bg-gray-200 rounded" /></td>
                  <td className="px-4 py-3 text-right"><div className="h-4 w-24 bg-gray-200 rounded ml-auto" /></td>
                </tr>
              ))}
              {!loading && filtered.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{u.name}</td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">{u.role}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full border ${u.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>{u.status}</span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button className="px-2 py-1 text-xs rounded border hover:bg-gray-50">Sửa</button>
                    <button className="px-2 py-1 text-xs rounded border hover:bg-gray-50">Khoá</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  )
}

