'use client'

// Contract tab components
import { ContractOverviewTab } from './contract/ContractOverviewTab'
import { PartiesTab } from './contract/PartiesTab'
import { PaymentTab } from './contract/PaymentTab'
import { ClausesTab } from './contract/ClausesTab'
import { RiskTab } from './contract/RiskTab'
import { RemindersTab } from './contract/RemindersTab'
import { ComplianceTab } from './contract/ComplianceTab'

// Approval tab components
import { ApprovalTab } from './approval/ApprovalTab'

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
import { CommentsMainTab } from './comments/CommentsMainTab'


interface FileDetailTabsProps {
  fileData: any
  isEditing?: boolean
  onDataChange?: (newData: any) => void
  workflow?: any
  userRole?: string
  userPermissions?: string[]
  onApprove?: () => void
  onReject?: () => void
}

// mainTabs - File focused
export const mainTabs = [
  {
    id: 'overview',
    name: 'Tổng quan',
    icon: 'folder',
    description: 'Chi tiết file và metadata'
  },
  {
    id: 'contracts',
    name: 'Hợp đồng',
    icon: 'file',
    description: 'Quản lý hợp đồng và thông tin nếu file là hợp đồng'
  },
  {
    id: 'comments',
    name: 'Bình luận',
    icon: 'message',
    description: 'Thảo luận và hoạt động'
  }
];

// contractSubTabs - for files that are contracts
export const contractSubTabs = [
  { id: 'contract-overview', name: 'Tổng quan HĐ', icon: 'info', description: 'Thông tin cơ bản hợp đồng' },
  { id: 'parties', name: 'Các bên', icon: 'building', description: 'Thông tin các bên' },
  { id: 'payment', name: 'Thanh toán', icon: 'dollar-sign', description: 'Lịch thanh toán' },
  { id: 'clauses', name: 'Điều khoản', icon: 'file-text', description: 'Điều khoản chính và bất lợi' },
  { id: 'risk', name: 'Rủi ro', icon: 'alert-circle', description: 'Phân tích rủi ro' },
  { id: 'reminders', name: 'Nhắc nhở', icon: 'bell', description: 'Nhắc nhở và mốc quan trọng' },
  { id: 'compliance', name: 'Tuân thủ', icon: 'tag', description: 'Trạng thái tuân thủ' },
];

// fileDetailSubTabs - for file overview tabs
export const fileDetailSubTabs = [
  { id: 'details', name: 'Chi tiết', icon: 'info', description: 'Thông tin chi tiết file' },
  { id: 'content', name: 'Nội dung', icon: 'file-text', description: 'Nội dung file' },
  { id: 'ocr', name: 'Nội dung OCR', icon: 'file-text', description: 'Văn bản OCR' },
  { id: 'metadata', name: 'Siêu dữ liệu', icon: 'tag', description: 'Metadata file' },
  { id: 'audit', name: 'Kiểm toán', icon: 'check', description: 'Lịch sử kiểm toán' },
  { id: 'security', name: 'Bảo mật', icon: 'shield', description: 'Bảo mật file' },
  { id: 'storage', name: 'Lưu trữ', icon: 'folder', description: 'Thông tin lưu trữ' },
  { id: 'versioning', name: 'Phiên bản', icon: 'file', description: 'Quản lý versions' },
  { id: 'notes', name: 'Ghi chú', icon: 'message', description: 'Ghi chú' },
  { id: 'history', name: 'Lịch sử', icon: 'clock', description: 'Lịch sử thay đổi' },
  { id: 'permissions', name: 'Quyền hạn', icon: 'lock', description: 'Quyền truy cập' },
];

// commentsSubTabs same
export const commentsSubTabs = [
  { id: 'comments-list', name: 'Bình luận', icon: 'message', description: 'Danh sách bình luận' }
];

export function getSubTabsFor(mainTabId: string) {
  if (mainTabId === 'contracts') return contractSubTabs;
  if (mainTabId === 'overview') return fileDetailSubTabs;
  if (mainTabId === 'approval') return []; // Approval tab has no subtabs
  return commentsSubTabs;
}

export function FileDetailTabs({ 
  fileData, 
  activeMainTab = 'overview', 
  activeSubTab = 'details',
  workflow,
  userRole = 'MEMBER',
  userPermissions = [],
  onApprove,
  onReject
}: FileDetailTabsProps & { activeMainTab?: string; activeSubTab?: string }) {
  if (!fileData) return null;

  const renderSubTabContent = () => {
    // Approval tab doesn't need subtabs check
    if (activeMainTab === 'approval') {
      return (
        <ApprovalTab 
          workflow={workflow || null}
          userRole={userRole}
          userPermissions={userPermissions}
          onApprove={onApprove}
          onReject={onReject}
        />
      )
    }

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
      return <CommentsMainTab fileId={fileData?.id || (fileData as any)?.fileId} />
    }
    
    return null
  }

  return (
    <div className="rounded-lg border" style={{ borderColor: '#e5e7eb', backgroundColor: '#ffffff', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }} >
      <div className="p-6">
        {renderSubTabContent()}
      </div>
    </div>
  )
}
