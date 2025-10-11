'use client'

import React, { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout'
import { useParams, useRouter } from 'next/navigation'
import { fetchDocument } from '../_services/documentsApi'
import { useTranslation } from '@/hooks/useTranslation'
import { translateContractType, translateContractStatus, translateContractTag } from '@/utils/tagTranslations'
import { DocumentDetailTabs, MainTabsNav, SubTabsNav } from '@/components/DocumentDetail/DocumentDetailTabs'
import { HeaderPanel } from '@/components/ui'
import { PencilSquareIcon, ArrowUpTrayIcon, DocumentDuplicateIcon, PencilIcon, DocumentArrowDownIcon, ChatBubbleLeftRightIcon, TrashIcon } from '@heroicons/react/24/outline'

export default function DocumentDetailPage() {
  const params = useParams() as { id: string }
  const router = useRouter()
  const { t } = useTranslation()
  const [data, setData] = useState<any>(null)
  const [contractSummary, setContractSummary] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')
  const [activeMainTab, setActiveMainTab] = useState<string>('contracts')
  const [activeSubTab, setActiveSubTab] = useState<string>('basic-info')

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true)
      try {
        setError('')
        
        // Fetch document from backend API
        console.log('Fetching document with ID:', params.id)
        const document = await fetchDocument(params.id)
        console.log('Document result:', document)
        
        if (!document) {
          // Document not found, redirect to 404
          console.log('Document not found, redirecting to /not-found')
          router.replace('/not-found')
          return
        }
        
        // Map document data to UI format
        const mappedData = {
          id: document.id,
          title: document.title,
          description: document.description,
          status: document.status,
          contractType: document.contractType,
          tags: document.tags,
          parties: document.parties,
          effectiveDate: document.effectiveDate,
          expiryDate: document.expiryDate,
          paymentDetails: {
            totalValue: document.totalValue,
            currency: document.currency,
            schedule: '',
            paymentMethod: '',
          },
          keyClauses: [],
          unfavorableClauses: [],
          reminders: [],
          riskAssessment: { riskLevel: document.riskLevel || 'LOW', riskFactors: [], mitigationMeasures: [] },
          complianceStatus: { status: 'COMPLIANT', issues: [], recommendations: [] },
          content: document.description || '',
          authorNotes: [],
          fileSystemMetadata: {
            dateModified: document.updatedAt,
            dateAdded: document.createdAt,
            mediaFilename: `${document.title}.pdf`,
            originalFilename: `${document.title}.docx`,
            originalMD5: '',
            originalFileSize: 0,
            originalMimeType: 'application/pdf',
            archiveMD5: '',
            archiveFileSize: 0
          },
          originalDocumentMetadata: {
            dcFormat: 'application/pdf',
            dcTitle: document.title,
            dcCreator: 'System',
            dcDescription: document.description,
            dcSubject: (document.tags || []).join(', '),
            xmpCreateDate: document.createdAt,
            xmpCreatorTool: 'DocGO System',
            xmpModifyDate: document.updatedAt,
            xmpMetadataDate: document.updatedAt,
            pdfKeywords: (document.tags || []).join(', '),
            pdfProducer: 'DocGO System',
            xmpDocumentID: `uuid:${document.id}`,
            xmpInstanceID: `uuid:${document.id}`,
            pdfaExtensionSchemas: ['PDF/A-1b']
          },
          archivedDocumentMetadata: {
            archivedPdfProducer: 'DocGO Archiver',
            archivedMetadataDate: document.updatedAt,
            archivedModifyDate: document.updatedAt,
            archivedCreateDate: document.createdAt,
            archivedCreatorTool: 'DocGO System',
            archivedDocumentID: `uuid:archived-${document.id}`,
            archivedDcFormat: 'application/pdf',
            archivedDcTitle: `${document.title} (Archived)`,
            archivedDcCreator: 'DocGO System'
          }
        }
        
        setData(mappedData)
        
        // TODO: Fetch ContractSummary from backend API if available
        // For now, set null to indicate no summary available
        setContractSummary(null)

      } catch (e: any) {
        console.error('Error fetching document detail:', e)
        
        // Check if it's a 404 error
        if (e.message && e.message.includes('404')) {
          router.replace('/not-found')
          return
        }
        
        setError(`Lỗi kết nối máy chủ: ${e.message || 'Unknown error'}`)
        setData(null)
        setContractSummary(null)
      } finally {
        setLoading(false)
      }
    }
    fetchDetail()
  }, [params.id, router])

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
      <div className="space-y-6">
        <HeaderPanel
          title={data.title}
          subtitle={`Mã: HD-${data.id} · Loại: ${translateContractType(data.contractType, t)} · Trạng thái: ${translateContractStatus(data.status, t)}`}
          breadcrumbs={[
            { label: 'Tài liệu', href: '/documents' },
            { label: 'Danh sách', href: '/documents' },
            { label: 'Chi tiết', current: true },
          ]}
          right={
            <div className="w-full">
              <div className="flex flex-wrap gap-[5px] items-center justify-end mb-[5px]">
                <button className="inline-flex items-center gap-1 px-2 h-[28px] rounded-lg border border-indigo-300 text-xs text-indigo-700 hover:bg-indigo-50">
                  <PencilSquareIcon className="w-3 h-3" />
                  Chỉnh sửa
                </button>
                <button className="inline-flex items-center gap-1 px-2 h-[28px] rounded-lg border border-indigo-300 text-xs text-indigo-700 hover:bg-indigo-50">
                  <ArrowUpTrayIcon className="w-3 h-3" />
                  Gửi duyệt
                </button>
                <button className="inline-flex items-center gap-1 px-2 h-[28px] rounded-lg border border-indigo-300 text-xs text-indigo-700 hover:bg-indigo-50">
                  <DocumentDuplicateIcon className="w-3 h-3" />
                  Tạo phiên bản
                </button>
                <button className="inline-flex items-center gap-1 px-2 h-[28px] rounded-lg border border-indigo-300 text-xs text-indigo-700 hover:bg-indigo-50">
                  <PencilIcon className="w-3 h-3" />
                  Gửi ký
                </button>
                <button className="inline-flex items-center gap-1 px-2 h-[28px] rounded-lg border border-indigo-300 text-xs text-indigo-700 hover:bg-indigo-50">
                  <DocumentArrowDownIcon className="w-3 h-3" />
                  Tải PDF
                </button>
                <button className="inline-flex items-center gap-1 px-2 h-[28px] rounded-lg border border-indigo-300 text-xs text-indigo-700 hover:bg-indigo-50">
                  <ChatBubbleLeftRightIcon className="w-3 h-3" />
                  Bình luận
                </button>
                <button className="inline-flex items-center gap-1 px-2 h-[28px] rounded-lg border border-rose-300 text-xs text-rose-700 hover:bg-rose-50">
                  <TrashIcon className="w-3 h-3" />
                  Xóa
                </button>
              </div>
            </div>
          }
        >
          <div className="mt-2">
            <MainTabsNav
              activeMainTab={activeMainTab}
              onChange={(tabId) => {
                setActiveMainTab(tabId)
                if (tabId === 'contracts') setActiveSubTab('basic-info')
                else if (tabId === 'overview') setActiveSubTab('details')
                else if (tabId === 'comments') setActiveSubTab('comments-list')
              }}
            />
            <SubTabsNav
              activeMainTab={activeMainTab}
              activeSubTab={activeSubTab}
              onChange={(tabId) => setActiveSubTab(tabId)}
            />
          </div>
        </HeaderPanel>

        <DocumentDetailTabs
          documentData={data}
          contractSummary={contractSummary}
          activeMainTab={activeMainTab}
          activeSubTab={activeSubTab}
        />
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