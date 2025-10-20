'use client'

import React from 'react'
import { DashboardLayout } from '@/components/layout'
import { HeaderPanel } from '@/components/ui'

export default function RepositoriesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <HeaderPanel
          title="Kho tài liệu"
          breadcrumbs={[
            { label: 'Tài liệu', href: '/documents' },
            { label: 'Kho tài liệu', current: true }
          ]}
          right={
            <div className="flex items-center gap-2">
              <a
                href="/documents"
                className="btn-primary"
              >
                Quản lý tài liệu
              </a>
            </div>
          }
        />
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Danh sách kho tài liệu</h2>
          <p className="text-gray-600">
            Chọn kho tài liệu để xem chi tiết:
          </p>
          <div className="mt-4 space-y-2">
            <a
              href="/repositories/1"
              className="block p-4 border rounded-lg hover:bg-gray-50"
            >
              <h3 className="font-medium">Kho tài liệu 1</h3>
              <p className="text-sm text-gray-500">ID: 1</p>
            </a>
            <a
              href="/repositories/2"
              className="block p-4 border rounded-lg hover:bg-gray-50"
            >
              <h3 className="font-medium">Kho tài liệu 2</h3>
              <p className="text-sm text-gray-500">ID: 2</p>
            </a>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
