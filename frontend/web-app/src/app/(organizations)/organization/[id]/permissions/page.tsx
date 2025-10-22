'use client'

import { useParams, useRouter } from 'next/navigation'
import PermissionsManagement from '@/components/organization/PermissionsManagement'
import Link from 'next/link'

export default function OrganizationPermissionsPage() {
  const params = useParams()
  const router = useRouter()
  const organizationId = params.id as string

  const handleOrganizationSelect = (orgId: string | null) => {
    if (orgId) {
      router.push(`/organization/${orgId}/permissions`)
    } else {
      router.push('/organization/list')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link 
            href={`/organization/${organizationId}`}
            className="text-gray-500 hover:text-gray-700 transition-colors inline-flex items-center"
          >
            ← Quay lại tổng quan
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">🔐 Quản lý Quyền hạn</h1>
        </div>

        <div className="bg-white rounded-lg shadow">
          <PermissionsManagement 
            organizationId={organizationId}
            onOrganizationSelect={handleOrganizationSelect}
          />
        </div>
      </div>
    </div>
  )
}
