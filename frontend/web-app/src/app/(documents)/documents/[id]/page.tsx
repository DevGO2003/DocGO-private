'use client'

import React from 'react'
import { DashboardLayout } from '@/components/layout'
import dynamic from 'next/dynamic'
import { useParams } from 'next/navigation'
import { translateContractType, translateContractStatus } from '@/utils/tagTranslations'
import { useTranslation } from '@/hooks/useTranslation'
import SkeletonDetails from '../_components/SkeletonDetails'
const DocumentDetailTabs = dynamic(() => import('@/components/DocumentDetail/DocumentDetailTabs').then(m => m.DocumentDetailTabs), {
  ssr: false,
  loading: () => <SkeletonDetails />
})
import { useDocumentQuery } from '../_hooks/useDocumentQuery'
import { HeaderPanel } from '@/components/ui'

export default function DocumentDetailPage() {
	const params = useParams() as { id: string }
  const { t } = useTranslation()
	const { data, loading, error } = useDocumentQuery(params?.id)
	const contractSummary = null

	if (loading) {
		return (
			<DashboardLayout>
				<div className="min-h-[40vh] flex items-center justify-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
				</div>
			</DashboardLayout>
		)
	}

	if (error) {
		return (
			<DashboardLayout>
				<div className="p-6 text-red-600">{error}</div>
			</DashboardLayout>
		)
	}

	if (!data) {
		return (
			<DashboardLayout>
				<div className="p-6">Không tìm thấy tài liệu.</div>
			</DashboardLayout>
		)
	}

	return (
    <DashboardLayout>
      <div className="space-y-4">
        <HeaderPanel
          title={data.title}
          breadcrumbs={[{ label: 'Docs', href: '/documents' }, { label: `HD-${data.id}`, current: true }]}
          density="compact"
          right={
            <div className="inline-flex items-center gap-2">
              <span className={`px-2 py-0.5 text-xs rounded-full border ${badgeClass(data.status)}`}>{translateContractStatus(data.status, t)}</span>
              <span className="px-2 py-0.5 text-xs rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">{translateContractType(data.contractType, t)}</span>
            </div>
          }
        />

        <div className="mt-2">
          <DocumentDetailTabs documentData={data as any} contractSummary={contractSummary} />
        </div>
      </div>
    </DashboardLayout>
	)
}

function badgeClass(status: string) {
	switch (status) {
		case 'DRAFT':
			return 'bg-gray-50 text-gray-700 border-gray-200'
		case 'PENDING_REVIEW':
			return 'bg-amber-50 text-amber-700 border-amber-200'
		case 'APPROVED':
			return 'bg-blue-50 text-blue-700 border-blue-200'
		case 'ACTIVE':
			return 'bg-green-50 text-green-700 border-green-200'
		case 'EXPIRED':
			return 'bg-rose-50 text-rose-700 border-rose-200'
		case 'TERMINATED':
			return 'bg-red-50 text-red-700 border-red-200'
		case 'ARCHIVED':
			return 'bg-slate-50 text-slate-700 border-slate-200'
		default:
			return 'bg-gray-50 text-gray-700 border-gray-200'
	}
}