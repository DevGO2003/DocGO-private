'use client'

import React from 'react'
import { DocumentTextIcon, InformationCircleIcon, BuildingOfficeIcon, TagIcon, CpuChipIcon, ArrowPathIcon, ChatBubbleLeftRightIcon, Cog6ToothIcon, DocumentIcon, FolderIcon, ClockIcon, ShieldCheckIcon, CurrencyDollarIcon, BellIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

// Import all components
import { CommentsMainTab } from './CommentsMainTab'
// New Contract Tabs
import { ContractOverviewTab } from './contract/ContractOverviewTab'
import { PartiesTab } from './contract/PartiesTab'
import { PaymentTab } from './contract/PaymentTab'
import { ClausesTab } from './contract/ClausesTab'
import { RiskTab } from './contract/RiskTab'
import { RemindersTab } from './contract/RemindersTab'
import { ComplianceTab } from './contract/ComplianceTab'
// Old Contract Tabs (keeping for reference)
import { ClassificationTab } from './contract/ClassificationTab'
import { AIAnalysisTab } from './contract/AIAnalysisTab'
import { WorkflowTab } from './contract/WorkflowTab'
// Overview Tabs
import { DetailsTab } from './overview/DetailsTab'
import { ContentTab } from './overview/ContentTab'
import { OCRTab } from './overview/OCRTab'
import { MetadataTab } from './overview/MetadataTab'
import { NotesTab } from './overview/NotesTab'
import { HistoryTab } from './overview/HistoryTab'
import { PermissionsTab } from './overview/PermissionsTab'

interface DocumentDetailTabsProps {
  documentData: any
  onTabChange?: (tabId: string) => void
  contractSummary?: any
}

// Tab chính (Main Tabs)
export const mainTabs = [
  {
    id: 'overview',
    name: 'Tổng quan',
    icon: FolderIcon,
    description: 'Chi tiết tài liệu và metadata'
  },
  {
    id: 'contracts',
    name: 'Hợp đồng',
    icon: DocumentIcon,
    description: 'Quản lý hợp đồng và thông tin doanh nghiệp'
  },
  {
    id: 'comments',
    name: 'Bình luận',
    icon: ChatBubbleLeftRightIcon,
    description: 'Thảo luận và hoạt động'
  }
]

// Tab con cho Contracts (10 tabs)
export const contractSubTabs = [
  {
    id: 'contract-overview',
    name: 'Tổng quan HĐ',
    icon: InformationCircleIcon,
    description: 'Thông tin cơ bản: ngày hiệu lực, giá trị, dự án'
  },
  {
    id: 'parties',
    name: 'Các bên',
    icon: BuildingOfficeIcon,
    description: 'Thông tin các bên tham gia hợp đồng'
  },
  {
    id: 'payment',
    name: 'Thanh toán',
    icon: CurrencyDollarIcon,
    description: 'Lịch thanh toán và phương thức'
  },
  {
    id: 'clauses',
    name: 'Điều khoản',
    icon: DocumentTextIcon,
    description: 'Điều khoản chính và bất lợi'
  },
  {
    id: 'risk',
    name: 'Rủi ro',
    icon: ShieldCheckIcon,
    description: 'Phân tích rủi ro và giảm thiểu'
  },
  {
    id: 'reminders',
    name: 'Nhắc nhở',
    icon: ClockIcon,
    description: 'Nhắc nhở thanh toán và mốc quan trọng'
  },
  {
    id: 'workflow',
    name: 'Quy trình',
    icon: ArrowPathIcon,
    description: 'Workflow và trạng thái phê duyệt'
  },
  {
    id: 'compliance',
    name: 'Tuân thủ',
    icon: ShieldCheckIcon,
    description: 'Trạng thái tuân thủ và khuyến nghị'
  },
  {
    id: 'classification',
    name: 'Phân loại',
    icon: TagIcon,
    description: 'Tags, categories và metadata'
  },
  {
    id: 'ai-analysis',
    name: 'Phân tích AI',
    icon: CpuChipIcon,
    description: 'Kết quả phân tích từ AI'
  }
]

// Tab con cho Document Details
export const documentDetailSubTabs = [
  {
    id: 'details',
    name: 'Chi tiết',
    icon: InformationCircleIcon,
    description: 'Thông tin chi tiết tài liệu'
  },
  {
    id: 'content',
    name: 'Nội dung',
    icon: DocumentTextIcon,
    description: 'Nội dung tài liệu'
  },
  {
    id: 'ocr',
    name: 'Nội dung OCR',
    icon: CpuChipIcon,
    description: 'Văn bản được trích xuất từ OCR'
  },
  {
    id: 'metadata',
    name: 'Siêu dữ liệu',
    icon: TagIcon,
    description: 'Metadata và thông tin kỹ thuật'
  },
  {
    id: 'notes',
    name: 'Ghi chú',
    icon: ChatBubbleLeftRightIcon,
    description: 'Ghi chú của tác giả'
  },
  {
    id: 'history',
    name: 'Lịch sử',
    icon: ClockIcon,
    description: 'Lịch sử thay đổi'
  },
  {
    id: 'permissions',
    name: 'Quyền hạn',
    icon: ShieldCheckIcon,
    description: 'Quyền truy cập và bảo mật'
  }
]

// Tab con cho Bình luận (tối thiểu 1 tab để tương thích layout)
export const commentsSubTabs = [
  {
    id: 'comments-list',
    name: 'Bình luận',
    icon: ChatBubbleLeftRightIcon,
    description: 'Danh sách bình luận'
  }
]

export function getSubTabsFor(mainTabId: string) {
  if (mainTabId === 'contracts') return contractSubTabs
  if (mainTabId === 'overview') return documentDetailSubTabs
  return commentsSubTabs
}

export function MainTabsNav({ activeMainTab, onChange, documentData }: { activeMainTab: string; onChange: (tabId: string) => void; documentData?: any }) {
  const isContract = documentData?.overview?.documentType === 'CONTRACT'
  
  return (
    <div>
      <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
        {mainTabs.map((tab, index) => {
          const Icon = tab.icon
          const isActive = activeMainTab === tab.id
          const isDisabled = tab.id === 'contracts' && !isContract
          const tooltipText = isDisabled ? 'Đây không phải là file hợp đồng' : tab.name
          
          return (
            <button
              key={tab.id}
              onClick={() => !isDisabled && onChange(tab.id)}
              disabled={isDisabled}
              className={`px-2 py-1.5 text-[10px] md:px-2.5 md:py-1.5 md:text-xs ${
                isDisabled 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : isActive 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
              } ${index > 0 ? 'border-l border-gray-200' : ''}`}
              aria-current={isActive ? 'page' : undefined}
              title={tooltipText}
            >
              <span className="md:hidden">
                <Icon className="w-3.5 h-3.5" />
              </span>
              <span className="hidden md:inline">{tab.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function SubTabsNav({ activeMainTab, activeSubTab, onChange }: { activeMainTab: string; activeSubTab: string; onChange: (tabId: string) => void }) {
  const subTabs = getSubTabsFor(activeMainTab)
  return (
    <div className="mt-2">
      <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
        {subTabs.map((tab, index) => {
          const Icon = tab.icon
          const isActive = activeSubTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`px-2 py-1.5 text-[10px] md:px-2.5 md:py-1.5 md:text-xs ${isActive ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} ${index > 0 ? 'border-l border-gray-200' : ''}`}
              aria-current={isActive ? 'page' : undefined}
              title={tab.name}
            >
              <span className="md:hidden">
                <Icon className="w-3.5 h-3.5" />
              </span>
              <span className="hidden md:inline">{tab.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function DocumentDetailTabs({ documentData, onTabChange, contractSummary, activeMainTab = 'contracts', activeSubTab = 'contract-overview' }: DocumentDetailTabsProps & { activeMainTab?: string; activeSubTab?: string }) {
  const renderSubTabContent = () => {
    const subTabs = getSubTabsFor(activeMainTab)
    const currentSubTab = subTabs.find(tab => tab.id === activeSubTab)
    
    if (!currentSubTab) return null

    // Contracts sub tabs (10 tabs)
    if (activeMainTab === 'contracts') {
      switch (activeSubTab) {
        case 'contract-overview':
          return <ContractOverviewTab data={documentData} />
        case 'parties':
          return <PartiesTab data={documentData} />
        case 'payment':
          return <PaymentTab data={documentData} />
        case 'clauses':
          return <ClausesTab data={documentData} />
        case 'risk':
          return <RiskTab data={documentData} />
        case 'reminders':
          return <RemindersTab data={documentData} />
        case 'workflow':
          return <WorkflowTab documentData={documentData} />
        case 'compliance':
          return <ComplianceTab data={documentData} />
        case 'classification':
          return <ClassificationTab documentData={documentData} />
        case 'ai-analysis':
          return <AIAnalysisTab documentData={documentData} />
        default:
          return null
      }
    }
    
    // Tổng quát (Overview) sub tabs
    if (activeMainTab === 'overview') {
      switch (activeSubTab) {
        case 'details':
          return <DetailsTab documentData={documentData} />
        case 'content':
          return <ContentTab documentData={documentData} />
        case 'ocr':
          return <OCRTab documentData={documentData} />
        case 'metadata':
          return <MetadataTab documentData={documentData} />
        case 'notes':
          return <NotesTab documentData={documentData} />
        case 'history':
          return <HistoryTab documentData={documentData} />
        case 'permissions':
          return <PermissionsTab documentData={documentData} />
        default:
          return null
      }
    }

    // Bình luận (Comments)
    if (activeMainTab === 'comments') {
      switch (activeSubTab) {
        case 'comments-list':
        default:
          return <CommentsMainTab />
      }
    }
    
    return null
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="p-6">
        {renderSubTabContent()}
      </div>
    </div>
  )
}