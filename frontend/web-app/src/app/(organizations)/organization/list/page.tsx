'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import OrganizationListUpdated from '@/components/organization/OrganizationListUpdated'

export default function OrganizationListPage() {
  const router = useRouter()
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string | null>(null)

  const handleOrganizationSelect = async (organizationId: string | null) => {
    if (!organizationId) {
      setSelectedOrganizationId(null)
      return
    }

    setSelectedOrganizationId(organizationId)
    router.push(`/organization/${organizationId}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Tổ chức</h1>
          <p className="mt-2 text-gray-600">Chọn tổ chức để bắt đầu quản lý</p>
        </div>

        <div className="bg-white rounded-lg shadow">
          <OrganizationListUpdated 
            onOrganizationSelect={handleOrganizationSelect}
            selectedOrganizationId={selectedOrganizationId}
          />
        </div>
      </div>
    </div>
  )
}
