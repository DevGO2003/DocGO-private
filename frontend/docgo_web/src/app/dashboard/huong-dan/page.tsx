'use client'

import React from 'react'
import { DashboardLayout } from '@/components/layout'

export default function HuongDanPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-4xl mx-auto px-2 sm:px-4">
        <div className="relative overflow-hidden rounded-2xl border bg-white shadow-sm ring-1 ring-gray-100">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-50 via-gray-50 to-zinc-50 opacity-50" />
          <div className="relative px-6 py-6">
            <h1 className="text-2xl font-bold text-gray-900">Hướng dẫn sử dụng</h1>
            <p className="mt-1 text-gray-600">Các bước cơ bản để làm việc với hệ thống DocGO.</p>
          </div>
          <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-slate-400 via-gray-400 to-zinc-400" />
        </div>

        <ol className="relative border-l pl-6 space-y-6">
          {[
            { title: 'Đăng nhập', desc: 'Sử dụng tài khoản được cấp để đăng nhập hệ thống.' },
            { title: 'Tải lên', desc: 'Đi tới trang Tải lên để đăng tài liệu cần xử lý.' },
            { title: 'Tạo hợp đồng', desc: 'Vào Tạo hợp đồng, nhập thông tin và gửi tạo mới.' },
            { title: 'Theo dõi', desc: 'Xem trạng thái tại Hợp đồng và Đã duyệt/Chờ duyệt.' },
          ].map((s, i) => (
            <li key={i} className="ml-2">
              <div className="absolute -left-1.5 mt-1 h-3 w-3 rounded-full bg-gray-300 border" />
              <h3 className="font-semibold text-gray-900">{i + 1}. {s.title}</h3>
              <p className="text-sm text-gray-600">{s.desc}</p>
            </li>
          ))}
        </ol>
      </div>
    </DashboardLayout>
  )
}

