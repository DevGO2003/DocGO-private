'use client'

import React, { useState } from 'react'
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
const mainTabs = [
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
const contractSubTabs = [
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
const documentDetailSubTabs = [
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
const commentsSubTabs = [
  {
    id: 'comments-list',
    name: 'Bình luận',
    icon: ChatBubbleLeftRightIcon,
    description: 'Danh sách bình luận'
  }
]

export function DocumentDetailTabs({ documentData, onTabChange, contractSummary }: DocumentDetailTabsProps) {
  const [activeMainTab, setActiveMainTab] = useState('contracts')
  const [activeSubTab, setActiveSubTab] = useState('basic-info')

  const handleMainTabClick = (tabId: string) => {
    setActiveMainTab(tabId)
    // Reset sub tab when switching main tab
    if (tabId === 'contracts') {
      setActiveSubTab('basic-info')
    } else if (tabId === 'overview') {
      setActiveSubTab('details')
    } else if (tabId === 'comments') {
      setActiveSubTab('comments-list')
    }
    onTabChange?.(`${tabId}-${activeSubTab}`)
  }

  const handleSubTabClick = (tabId: string) => {
    setActiveSubTab(tabId)
    onTabChange?.(`${activeMainTab}-${tabId}`)
  }

  const getCurrentSubTabs = () => {
    if (activeMainTab === 'contracts') return contractSubTabs
    if (activeMainTab === 'overview') return documentDetailSubTabs
    return commentsSubTabs
  }

  const renderSubTabContent = () => {
    const subTabs = getCurrentSubTabs()
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
      {/* Main Tab Navigation */}
      <div className="border-b border-gray-200 bg-gray-50">
        <nav className="flex space-x-8 px-6" aria-label="Main Tabs">
          {mainTabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeMainTab === tab.id
            
            return (
              <button
                key={tab.id}
                onClick={() => handleMainTabClick(tab.id)}
                className={`
                  group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${isActive 
                    ? 'border-indigo-500 text-indigo-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon 
                  className={`
                    -ml-0.5 mr-2 h-5 w-5 transition-colors
                    ${isActive ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'}
                  `} 
                />
                <span className="hidden sm:block">{tab.name}</span>
                <span className="sm:hidden">{tab.name.split(' ')[0]}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Sub Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-6 px-6" aria-label="Sub Tabs">
          {getCurrentSubTabs().map((tab) => {
            const Icon = tab.icon
            const isActive = activeSubTab === tab.id
            
            return (
              <button
                key={tab.id}
                onClick={() => handleSubTabClick(tab.id)}
                className={`
                  group inline-flex items-center py-3 px-1 border-b-2 font-medium text-sm transition-colors
                  ${isActive 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon 
                  className={`
                    -ml-0.5 mr-2 h-4 w-4 transition-colors
                    ${isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}
                  `} 
                />
                <span className="hidden sm:block">{tab.name}</span>
                <span className="sm:hidden">{tab.name.split(' ')[0]}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {renderSubTabContent()}
      </div>
    </div>
  )
}