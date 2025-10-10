'use client'

import React from 'react'
import { DocumentTextIcon, InformationCircleIcon, BuildingOfficeIcon, TagIcon, CpuChipIcon, ArrowPathIcon, ChatBubbleLeftRightIcon, Cog6ToothIcon, DocumentIcon, FolderIcon, ClockIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'

// Import all components
import { CommentsMainTab } from './CommentsMainTab'
import { BasicInfoTab } from './contract/BasicInfoTab'
import { BusinessInfoTab } from './contract/BusinessInfoTab'
import { ClassificationTab } from './contract/ClassificationTab'
import { AIAnalysisTab } from './contract/AIAnalysisTab'
import { WorkflowTab } from './contract/WorkflowTab'
import { DetailsTab } from './overview/DetailsTab'
import { ContentTab } from './overview/ContentTab'
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

// Tab con cho Contracts
export const contractSubTabs = [
  {
    id: 'basic-info',
    name: 'Thông tin cơ bản',
    icon: InformationCircleIcon,
    description: 'Thông tin chung về tài liệu'
  },
  {
    id: 'business',
    name: 'Thông tin doanh nghiệp',
    icon: BuildingOfficeIcon,
    description: 'Thông tin các bên tham gia'
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
  },
  {
    id: 'workflow',
    name: 'Quy trình',
    icon: ArrowPathIcon,
    description: 'Workflow và trạng thái'
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

export function MainTabsNav({ activeMainTab, onChange }: { activeMainTab: string; onChange: (tabId: string) => void }) {
  return (
    <div className="bg-gray-50 px-6">
      <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
        {mainTabs.map((tab, index) => {
          const Icon = tab.icon
          const isActive = activeMainTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`${
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } ${index > 0 ? 'border-l border-gray-200' : ''} px-3 py-2 text-sm font-medium flex items-center`}
              aria-current={isActive ? 'page' : undefined}
              title={tab.name}
            >
              <Icon className={`w-4 h-4 mr-2 ${isActive ? 'text-white' : 'text-gray-400'}`} />
              <span className="hidden md:inline">{tab.name}</span>
              <span className="md:hidden">{tab.name.split(' ')[0]}</span>
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
    <div className="px-6 mt-2">
      <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
        {subTabs.map((tab, index) => {
          const Icon = tab.icon
          const isActive = activeSubTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`${
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } ${index > 0 ? 'border-l border-gray-200' : ''} px-3 py-2 text-sm font-medium flex items-center`}
              aria-current={isActive ? 'page' : undefined}
              title={tab.name}
            >
              <Icon className={`w-4 h-4 mr-2 ${isActive ? 'text-white' : 'text-gray-400'}`} />
              <span className="hidden md:inline">{tab.name}</span>
              <span className="md:hidden">{tab.name.split(' ')[0]}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function DocumentDetailTabs({ documentData, onTabChange, contractSummary, activeMainTab = 'contracts', activeSubTab = 'basic-info' }: DocumentDetailTabsProps & { activeMainTab?: string; activeSubTab?: string }) {
  const renderSubTabContent = () => {
    const subTabs = getSubTabsFor(activeMainTab)
    const currentSubTab = subTabs.find(tab => tab.id === activeSubTab)
    
    if (!currentSubTab) return null

    // Contracts sub tabs
    if (activeMainTab === 'contracts') {
      switch (activeSubTab) {
        case 'basic-info':
          return <BasicInfoTab documentData={documentData} />
        case 'business':
          return <BusinessInfoTab documentData={documentData} />
        case 'classification':
          return <ClassificationTab documentData={documentData} />
        case 'ai-analysis':
          return <AIAnalysisTab documentData={documentData} />
        case 'workflow':
          return <WorkflowTab documentData={documentData} />
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