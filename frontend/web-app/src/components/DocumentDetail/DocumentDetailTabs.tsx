'use client'

import React, { useState } from 'react'
import { DocumentTextIcon, InformationCircleIcon, BuildingOfficeIcon, TagIcon, CpuChipIcon, ArrowPathIcon, ChatBubbleLeftRightIcon, Cog6ToothIcon, DocumentIcon, FolderIcon, ClockIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'
import { AIAnalysisCard } from './AIAnalysisCard'
import { WorkflowCard } from './WorkflowCard'

interface Recommendation {
  type: 'warning' | 'error' | 'info' | 'success'
  title: string
  description: string
  action?: string
}

interface DocumentDetailTabsProps {
  documentData: any
  onTabChange?: (tabId: string) => void
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
    description: 'Ghi chú và bình luận'
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

export function DocumentDetailTabs({ documentData, onTabChange }: DocumentDetailTabsProps & { contractSummary?: any }) {
  const [activeMainTab, setActiveMainTab] = useState('contracts')
  const [activeSubTab, setActiveSubTab] = useState('basic-info')

  const handleMainTabClick = (tabId: string) => {
    setActiveMainTab(tabId)
    // Reset sub tab when switching main tab
    if (tabId === 'contracts') {
      setActiveSubTab('basic-info')
    } else if (tabId === 'overview') {
      setActiveSubTab('details')
    }
    onTabChange?.(`${tabId}-${activeSubTab}`)
  }

  const handleSubTabClick = (tabId: string) => {
    setActiveSubTab(tabId)
    onTabChange?.(`${activeMainTab}-${tabId}`)
  }

  const getCurrentSubTabs = () => {
    return activeMainTab === 'contracts' ? contractSubTabs : documentDetailSubTabs
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

// Tab Components
function BasicInfoTab({ documentData }: { documentData: any }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu đề tài liệu</label>
          <input 
            type="text" 
            value={documentData?.title || ''} 
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            readOnly
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Loại tài liệu</label>
          <select 
            value={documentData?.contractType || ''} 
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            disabled
          >
            <option value="SERVICE_AGREEMENT">Hợp đồng dịch vụ</option>
            <option value="LEASE_AGREEMENT">Hợp đồng thuê</option>
            <option value="SUPPLY_AGREEMENT">Hợp đồng cung cấp</option>
            <option value="INSURANCE_AGREEMENT">Hợp đồng bảo hiểm</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(documentData?.status)}`}>
            {documentData?.status || 'DRAFT'}
          </span>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Ngày tạo</label>
          <input 
            type="text" 
            value={new Date().toLocaleDateString('vi-VN')} 
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
            readOnly
          />
        </div>
      </div>
    </div>
  )
}

function ContentTab({ documentData }: { documentData: any }) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung tài liệu</label>
        <textarea 
          value={documentData?.content || ''} 
          rows={10}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Nội dung tài liệu sẽ được hiển thị ở đây..."
        />
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">File đính kèm</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 bg-white rounded border">
            <span className="text-sm text-gray-600">document.pdf</span>
            <button className="text-indigo-600 hover:text-indigo-800 text-sm">Tải xuống</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function BusinessInfoTab({ documentData }: { documentData: any }) {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">Các bên tham gia</h4>
        <div className="space-y-4">
          {documentData?.parties?.map((party: any, index: number) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên công ty</label>
                  <input 
                    type="text" 
                    value={party.name || ''} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
                  <input 
                    type="text" 
                    value={party.role || ''} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mã số thuế</label>
                  <input 
                    type="text" 
                    value={party.taxCode || ''} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Liên hệ</label>
                  <input 
                    type="text" 
                    value={party.contact || ''} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    readOnly
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ClassificationTab({ documentData }: { documentData: any }) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
        <div className="flex flex-wrap gap-2">
          {documentData?.tags?.map((tag: string, index: number) => (
            <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              {tag}
            </span>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Mức độ ưu tiên</label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
            <option value="LOW">Thấp</option>
            <option value="MEDIUM">Trung bình</option>
            <option value="HIGH">Cao</option>
            <option value="CRITICAL">Quan trọng</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Mức độ bảo mật</label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
            <option value="PUBLIC">Công khai</option>
            <option value="INTERNAL">Nội bộ</option>
            <option value="CONFIDENTIAL">Bí mật</option>
            <option value="RESTRICTED">Hạn chế</option>
          </select>
        </div>
      </div>
    </div>
  )
}

function AIAnalysisTab({ documentData }: { documentData: any }) {
  const aiAnalysisData = {
    riskLevel: documentData?.riskAssessment?.riskLevel || 'LOW',
    confidence: 85,
    warnings: 3,
    recommendations: [
      {
        type: 'warning',
        title: 'Điều khoản thanh toán cần xem xét',
        description: 'Điều khoản thanh toán có thể gây rủi ro cho doanh nghiệp',
        action: 'Xem xét lại điều khoản thanh toán với pháp lý'
      },
      {
        type: 'success',
        title: 'Điều khoản bảo hiểm đầy đủ',
        description: 'Các điều khoản bảo hiểm đã được thiết lập đầy đủ',
        action: 'Tiếp tục duy trì'
      }
    ] as Recommendation[],
    keyClauses: documentData?.keyClauses || []
  }

  return <AIAnalysisCard {...aiAnalysisData} />
}

function WorkflowTab({ documentData }: { documentData: any }) {
  const workflowData = {
    currentStage: documentData?.status === 'PENDING_REVIEW' ? 'review' : 'draft',
    progress: documentData?.status === 'PENDING_REVIEW' ? 60 : 30,
    nextActions: [
      'Phê duyệt từ pháp lý',
      'Ký số điện tử',
      'Lưu trữ tài liệu'
    ],
    deadlines: [
      {
        title: 'Phê duyệt',
        description: 'Cần phê duyệt từ pháp lý',
        date: '15/01/2024',
        urgent: false
      },
      {
        title: 'Ký số',
        description: 'Ký số điện tử',
        date: '20/01/2024',
        urgent: false
      },
      {
        title: 'Hiệu lực',
        description: 'Tài liệu có hiệu lực',
        date: '01/02/2024',
        urgent: true
      }
    ],
    assignments: [
      {
        task: 'Phê duyệt tài liệu',
        assignee: 'Legal Team',
        status: 'in-progress'
      },
      {
        task: 'Ký số điện tử',
        assignee: 'Admin',
        status: 'pending'
      }
    ]
  }

  return <WorkflowCard {...workflowData} />
}

function NotesTab({ documentData }: { documentData: any }) {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">Bình luận</h4>
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                A
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm font-medium text-gray-900">Admin</span>
                  <span className="text-xs text-gray-500">2 giờ trước</span>
                </div>
                <p className="text-sm text-gray-700">Cần xem xét lại điều khoản thanh toán trước khi ký.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">Lịch sử hoạt động</h4>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Tài liệu được tạo bởi Admin</span>
            <span className="text-gray-400">•</span>
            <span>2 giờ trước</span>
          </div>
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Trạng thái thay đổi thành PENDING_REVIEW</span>
            <span className="text-gray-400">•</span>
            <span>1 giờ trước</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function SettingsTab({ documentData }: { documentData: any }) {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">Quyền truy cập</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-900">Admin</div>
              <div className="text-sm text-gray-500">Quyền đầy đủ</div>
            </div>
            <span className="text-sm text-green-600">Chủ sở hữu</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-900">Legal Team</div>
              <div className="text-sm text-gray-500">Xem và chỉnh sửa</div>
            </div>
            <span className="text-sm text-blue-600">Thành viên</span>
          </div>
        </div>
      </div>
      
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">Chia sẻ</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-900">Link chia sẻ</div>
              <div className="text-sm text-gray-500">Chỉ người có quyền truy cập</div>
            </div>
            <button className="text-indigo-600 hover:text-indigo-800 text-sm">Tạo link</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Document Details Tab Components
function DetailsTab({ documentData }: { documentData: any }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu đề</label>
          <input 
            type="text" 
            value={documentData?.title || ''} 
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Mã số lưu trữ</label>
          <div className="flex">
            <input 
              type="text" 
              value="HD-001" 
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md text-sm font-medium text-gray-700 hover:bg-gray-200">
              +1
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date Created</label>
          <div className="flex">
            <input 
              type="text" 
              value="10/09/2025" 
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md">
              📅
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Correspondent</label>
          <div className="flex">
            <input 
              type="text" 
              placeholder="Select correspondent..." 
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 text-gray-400 hover:text-gray-600">
              ▼
            </button>
            <button className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 text-gray-400 hover:text-gray-600">
              +
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Document Type</label>
          <div className="flex">
            <input 
              type="text" 
              placeholder="Select document type..." 
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 text-gray-400 hover:text-gray-600">
              ▼
            </button>
            <button className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 text-gray-400 hover:text-gray-600">
              +
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Storage Path</label>
          <div className="flex">
            <input 
              type="text" 
              value="Default" 
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 text-gray-400 hover:text-gray-600">
              ▼
            </button>
            <button className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 text-gray-400 hover:text-gray-600">
              +
            </button>
          </div>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
        <div className="flex">
          <input 
            type="text" 
            placeholder="Select tags..." 
            className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 text-gray-400 hover:text-gray-600">
            ▼
          </button>
          <button className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 text-gray-400 hover:text-gray-600">
            +
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {documentData?.tags?.map((tag: string, index: number) => (
            <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function MetadataTab({ documentData }: { documentData: any }) {
  return (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Technical Metadata</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">File Size:</span>
              <span className="font-medium">2.5 MB</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">File Type:</span>
              <span className="font-medium">PDF</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Pages:</span>
              <span className="font-medium">15</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Created:</span>
              <span className="font-medium">2024-01-10 14:30:25</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Modified:</span>
              <span className="font-medium">2024-01-15 09:15:42</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Version:</span>
              <span className="font-medium">1.2</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Checksum:</span>
              <span className="font-medium text-xs">a1b2c3d4...</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">OCR Status:</span>
              <span className="font-medium text-green-600">Completed</span>
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">Custom Fields</h4>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Number</label>
              <input 
                type="text" 
                placeholder="Enter invoice number..." 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
              <input 
                type="text" 
                placeholder="0.00" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Paid</label>
              <input 
                type="date" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                <option value="">Select priority...</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function HistoryTab({ documentData }: { documentData: any }) {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">Document History</h4>
        <div className="space-y-4">
          <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
              ✓
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h5 className="text-sm font-medium text-gray-900">Document created</h5>
                <span className="text-xs text-gray-500">2 hours ago</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">Document was created by Admin</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
              E
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h5 className="text-sm font-medium text-gray-900">Document edited</h5>
                <span className="text-xs text-gray-500">1 hour ago</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">Title and description were updated</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
              T
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h5 className="text-sm font-medium text-gray-900">Tags updated</h5>
                <span className="text-xs text-gray-500">45 minutes ago</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">Added tags: IT, Dịch vụ, Phần mềm</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
              S
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h5 className="text-sm font-medium text-gray-900">Status changed</h5>
                <span className="text-xs text-gray-500">30 minutes ago</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">Status changed from DRAFT to PENDING_REVIEW</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PermissionsTab({ documentData }: { documentData: any }) {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">Access Control</h4>
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h5 className="text-sm font-medium text-gray-900">User Permissions</h5>
              <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">+ Add User</button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white rounded border">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    A
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Admin</div>
                    <div className="text-xs text-gray-500">admin@docgo.com</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Owner
                  </span>
                  <button className="text-gray-400 hover:text-gray-600">
                    ⋯
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white rounded border">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    L
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Legal Team</div>
                    <div className="text-xs text-gray-500">legal@docgo.com</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Editor
                  </span>
                  <button className="text-gray-400 hover:text-gray-600">
                    ⋯
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h5 className="text-sm font-medium text-gray-900 mb-3">Document Security</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">Encryption</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Enabled
                  </span>
                </div>
                <p className="text-xs text-gray-500">Document is encrypted at rest</p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">Digital Signature</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Pending
                  </span>
                </div>
                <p className="text-xs text-gray-500">Waiting for digital signature</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function getStatusBadgeClass(status: string) {
  switch (status) {
    case 'DRAFT':
      return 'bg-gray-100 text-gray-800'
    case 'PENDING_REVIEW':
      return 'bg-yellow-100 text-yellow-800'
    case 'APPROVED':
      return 'bg-blue-100 text-blue-800'
    case 'ACTIVE':
      return 'bg-green-100 text-green-800'
    case 'EXPIRED':
      return 'bg-red-100 text-red-800'
    case 'TERMINATED':
      return 'bg-red-100 text-red-800'
    case 'ARCHIVED':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}
