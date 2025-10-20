'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import { DashboardLayout } from '@/components/layout'
import { HeaderPanel } from '@/components/ui'

export default function RepositoryPage() {
  const params = useParams() as { repositoryId: string }
  const repositoryId = params.repositoryId

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <HeaderPanel
          title={`Kho tài liệu ${repositoryId}`}
          breadcrumbs={[
            { label: 'Tài liệu', href: '/documents' },
            { label: `Kho ${repositoryId}`, current: true }
          ]}
          right={
            <div className="flex items-center gap-2">
              <a
                href={`/repositories/${repositoryId}/files`}
                className="btn-primary"
              >
                Xem tài liệu
              </a>
            </div>
          }
        />
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Thông tin kho tài liệu</h2>
          <p className="text-gray-600">
            Kho tài liệu ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{repositoryId}</span>
          </p>
          <div className="mt-4">
            <a
              href={`/repositories/${repositoryId}/files`}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              → Xem danh sách tài liệu trong kho này
            </a>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
