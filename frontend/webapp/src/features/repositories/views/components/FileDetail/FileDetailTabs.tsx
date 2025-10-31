'use client'

import { FileText, Info, Building2, Tag, DollarSign, Bell, AlertTriangle, Folder, File, MessageCircle, Shield, Database, GitBranch, FileCheck } from 'lucide-react'

// Contract tab components
import { ContractOverviewTab } from './contract/ContractOverviewTab'
import { PartiesTab } from './contract/PartiesTab'
import { PaymentTab } from './contract/PaymentTab'
import { ClausesTab } from './contract/ClausesTab'
import { RiskTab } from './contract/RiskTab'
import { RemindersTab } from './contract/RemindersTab'
import { ComplianceTab } from './contract/ComplianceTab'

// Overview tab components
import { DetailsTab } from './overview/DetailsTab'
import { ContentTab } from './overview/ContentTab'
import { OCRTab } from './overview/OCRTab'
import { MetadataTab } from './overview/MetadataTab'
import { NotesTab } from './overview/NotesTab'
import { HistoryTab } from './overview/HistoryTab'
import { PermissionsTab } from './overview/PermissionsTab'
import { AuditTab } from './overview/AuditTab'
import { SecurityTab } from './overview/SecurityTab'
import { StorageTab } from './overview/StorageTab'
import { VersioningTab } from './overview/VersioningTab'

// Placeholder for comments
const CommentsMainTab = () => <div className="p-4 text-gray-500">Chức năng bình luận đang được phát triển</div>

interface FileDetailTabsProps {
  fileData: any
  isEditing?: boolean
  onDataChange?: (newData: any) => void
}

// mainTabs - File focused
export const mainTabs = [
  {
    id: 'overview',
    name: 'Tổng quan',
    icon: Folder,
    description: 'Chi tiết file và metadata'
  },
  {
    id: 'contracts',
    name: 'Hợp đồng',
    icon: File,
    description: 'Quản lý hợp đồng và thông tin nếu file là hợp đồng'
  },
  {
    id: 'comments',
    name: 'Bình luận',
    icon: MessageCircle,
    description: 'Thảo luận và hoạt động'
  }
];

// contractSubTabs - for files that are contracts
export const contractSubTabs = [
  { id: 'contract-overview', name: 'Tổng quan HĐ', icon: Info, description: 'Thông tin cơ bản hợp đồng' },
  { id: 'parties', name: 'Các bên', icon: Building2, description: 'Thông tin các bên' },
  { id: 'payment', name: 'Thanh toán', icon: DollarSign, description: 'Lịch thanh toán' },
  { id: 'clauses', name: 'Điều khoản', icon: FileText, description: 'Điều khoản chính và bất lợi' },
  { id: 'risk', name: 'Rủi ro', icon: AlertTriangle, description: 'Phân tích rủi ro' },
  { id: 'reminders', name: 'Nhắc nhở', icon: Bell, description: 'Nhắc nhở và mốc quan trọng' },
  { id: 'compliance', name: 'Tuân thủ', icon: Tag, description: 'Trạng thái tuân thủ' },
];

// fileDetailSubTabs - for file overview tabs
export const fileDetailSubTabs = [
  { id: 'details', name: 'Chi tiết', icon: Info, description: 'Thông tin chi tiết file' },
  { id: 'content', name: 'Nội dung', icon: FileText, description: 'Nội dung file' },
  { id: 'ocr', name: 'Nội dung OCR', icon: FileText, description: 'Văn bản OCR' },
  { id: 'metadata', name: 'Siêu dữ liệu', icon: Tag, description: 'Metadata file' },
  { id: 'audit', name: 'Kiểm toán', icon: FileCheck, description: 'Lịch sử kiểm toán' },
  { id: 'security', name: 'Bảo mật', icon: Shield, description: 'Bảo mật file' },
  { id: 'storage', name: 'Lưu trữ', icon: Database, description: 'Thông tin lưu trữ' },
  { id: 'versioning', name: 'Phiên bản', icon: GitBranch, description: 'Quản lý versions' },
  { id: 'notes', name: 'Ghi chú', icon: MessageCircle, description: 'Ghi chú' },
  { id: 'history', name: 'Lịch sử', icon: Info, description: 'Lịch sử thay đổi' },
  { id: 'permissions', name: 'Quyền hạn', icon: Tag, description: 'Quyền truy cập' },
];

// commentsSubTabs same
export const commentsSubTabs = [
  { id: 'comments-list', name: 'Bình luận', icon: MessageCircle, description: 'Danh sách bình luận' }
];

export function getSubTabsFor(mainTabId: string) {
  if (mainTabId === 'contracts') return contractSubTabs;
  if (mainTabId === 'overview') return fileDetailSubTabs;
  return commentsSubTabs;
}

export function FileDetailTabs({ fileData, activeMainTab = 'overview', activeSubTab = 'details' }: FileDetailTabsProps & { activeMainTab?: string; activeSubTab?: string }) {
  if (!fileData) return null;

  const renderSubTabContent = () => {
    const subTabs = getSubTabsFor(activeMainTab)
    const currentSubTab = subTabs.find(tab => tab.id === activeSubTab)
    
    if (!currentSubTab) return null

    // Overview sub tabs
    if (activeMainTab === 'overview') {
      switch (activeSubTab) {
        case 'details':
          return <DetailsTab fileData={fileData} />
        case 'content':
          return <ContentTab fileData={fileData} />
        case 'ocr':
          return <OCRTab fileData={fileData} />
        case 'metadata':
          return <MetadataTab fileData={fileData} />
        case 'audit':
          return <AuditTab fileData={fileData} />
        case 'security':
          return <SecurityTab fileData={fileData} />
        case 'storage':
          return <StorageTab fileData={fileData} />
        case 'versioning':
          return <VersioningTab fileData={fileData} />
        case 'notes':
          return <NotesTab fileData={fileData} />
        case 'history':
          return <HistoryTab fileData={fileData} />
        case 'permissions':
          return <PermissionsTab fileData={fileData} />
        default:
          return null
      }
    }
    
    // Contracts sub tabs
    if (activeMainTab === 'contracts') {
      switch (activeSubTab) {
        case 'contract-overview':
          return <ContractOverviewTab data={fileData} />
        case 'parties':
          return <PartiesTab data={fileData} />
        case 'payment':
          return <PaymentTab data={fileData} />
        case 'clauses':
          return <ClausesTab data={fileData} />
        case 'risk':
          return <RiskTab data={fileData} />
        case 'reminders':
          return <RemindersTab data={fileData} />
        case 'compliance':
          return <ComplianceTab data={fileData} />
        default:
          return null
      }
    }

    // Comments
    if (activeMainTab === 'comments') {
      return <CommentsMainTab />
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
