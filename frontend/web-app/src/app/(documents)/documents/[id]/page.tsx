'use client'

import React, { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout'
import { useParams, useRouter } from 'next/navigation'
import { fetchFileById } from '../_services/file-api'
import { mapFileApiToUiDocument } from '../_services/file-mapper'
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
        
        // Fetch file detail from File Management Service
        console.log('Fetching file (detail) with ID:', params.id)
        const resp = await fetchFileById(params.id)
        if (!resp?.data) {
          // Document not found, redirect to 404
          console.log('Document not found, redirecting to /not-found')
          router.replace('/not-found')
          return
        }
        
        // Map API file detail to UI structure expected by tabs
        const doc = mapFileApiToUiDocument(resp.data)
        const mappedData = {
          id: doc.id,
          title: doc.title,
          description: doc.description,
          status: doc.status,
          contractType: doc.contractType,
          tags: doc.tags,
          parties: doc.parties,
          effectiveDate: doc.effectiveDate || null,
          expiryDate: doc.expiryDate || null,
          paymentDetails: {
            totalValue: doc.totalValue ?? null,
            currency: doc.currency ?? 'VND',
            schedule: resp.data.contract?.payment?.schedule || '',
            paymentMethod: resp.data.contract?.payment?.method || '',
          },
          keyClauses: (resp.data.contract?.clauses?.key || []).map((x: any) => ({
            name: x.name || '',
            description: x.description || '',
            importance: x.importance || '',
            risk: x.risk || '',
          })),
          unfavorableClauses: resp.data.contract?.clauses?.unfavorable || [],
          reminders: resp.data.contract?.reminders || [],
          riskAssessment: {
            riskLevel: doc.riskLevel || 'LOW',
            riskFactors: resp.data.contract?.risk?.factors || [],
            mitigationMeasures: resp.data.contract?.risk?.mitigations || [],
          },
          complianceStatus: {
            status: resp.data.contract?.compliance?.status || 'COMPLIANT',
            issues: resp.data.contract?.compliance?.issues || [],
            recommendations: resp.data.contract?.compliance?.recommendations || [],
          },
          content: resp.data.content?.plaintext || doc.description || '',
          authorNotes: [],
          fileSystemMetadata: {
            dateModified: (resp.data as any)?.metadata?.fileSystem?.dateModified || doc.updatedAt,
            dateAdded: (resp.data as any)?.metadata?.fileSystem?.dateAdded || doc.createdAt,
            mediaFilename: (resp.data as any)?.metadata?.fileSystem?.mediaFilename || (doc.title ? `${doc.title}.pdf` : ''),
            originalFilename: (resp.data as any)?.metadata?.fileSystem?.originalFilename || '',
            originalMD5: (resp.data as any)?.metadata?.fileSystem?.originalMD5 || '',
            originalFileSize: (resp.data as any)?.metadata?.fileSystem?.originalFileSize || 0,
            originalMimeType: (resp.data as any)?.metadata?.fileSystem?.originalMimeType || doc.fileType || 'application/pdf',
            archiveMD5: (resp.data as any)?.metadata?.fileSystem?.archiveMD5 || '',
            archiveFileSize: (resp.data as any)?.metadata?.fileSystem?.archiveFileSize || 0
          },
          originalDocumentMetadata: {
            dcFormat: (resp.data as any)?.metadata?.originalDocument?.dcFormat || doc.fileType || 'application/pdf',
            dcTitle: (resp.data as any)?.metadata?.originalDocument?.dcTitle || doc.title,
            dcCreator: (resp.data as any)?.metadata?.originalDocument?.dcCreator || 'System',
            dcDescription: (resp.data as any)?.metadata?.originalDocument?.dcDescription || doc.description,
            dcSubject: (doc.tags || []).join(', '),
            xmpCreateDate: (resp.data as any)?.metadata?.originalDocument?.xmpCreateDate || doc.createdAt,
            xmpCreatorTool: (resp.data as any)?.metadata?.originalDocument?.xmpCreatorTool || 'DocGO System',
            xmpModifyDate: (resp.data as any)?.metadata?.originalDocument?.xmpModifyDate || doc.updatedAt,
            xmpMetadataDate: (resp.data as any)?.metadata?.originalDocument?.xmpMetadataDate || doc.updatedAt,
            pdfKeywords: (doc.tags || []).join(', '),
            pdfProducer: (resp.data as any)?.metadata?.originalDocument?.pdfProducer || 'DocGO System',
            xmpDocumentID: `uuid:${doc.id}`,
            xmpInstanceID: `uuid:${doc.id}`,
            pdfaExtensionSchemas: ['PDF/A-1b']
          },
          archivedDocumentMetadata: {
            archivedPdfProducer: (resp.data as any)?.metadata?.archivedDocument?.archivedPdfProducer || 'DocGO Archiver',
            archivedMetadataDate: (resp.data as any)?.metadata?.archivedDocument?.archivedMetadataDate || doc.updatedAt,
            archivedModifyDate: (resp.data as any)?.metadata?.archivedDocument?.archivedModifyDate || doc.updatedAt,
            archivedCreateDate: (resp.data as any)?.metadata?.archivedDocument?.archivedCreateDate || doc.createdAt,
            archivedCreatorTool: (resp.data as any)?.metadata?.archivedDocument?.archivedCreatorTool || 'DocGO System',
            archivedDocumentID: (resp.data as any)?.metadata?.archivedDocument?.archivedDocumentID || `uuid:archived-${doc.id}`,
            archivedDcFormat: (resp.data as any)?.metadata?.archivedDocument?.archivedDcFormat || doc.fileType || 'application/pdf',
            archivedDcTitle: (resp.data as any)?.metadata?.archivedDocument?.archivedDcTitle || `${doc.title} (Archived)`,
            archivedDcCreator: (resp.data as any)?.metadata?.archivedDocument?.archivedDcCreator || 'DocGO System'
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