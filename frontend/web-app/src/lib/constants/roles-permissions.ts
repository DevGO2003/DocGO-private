/**
 * Role-based Permissions System
 * Định nghĩa các role và permissions tương ứng
 */

export const ROLES = {
  // Organization Roles
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
  
  // Workflow Roles
  CONTRACT_REVIEWER: 'Nhân viên kiểm tra',
  DEPARTMENT_HEAD: 'Trưởng phòng',
  DIRECTOR: 'Giám đốc',
  BOARD_MEMBER: 'Thành viên HĐQT',
  
  // Other Roles
  ACCOUNTANT: 'Kế toán',
  LEGAL: 'Pháp chế',
  HR: 'Nhân sự'
} as const

export const PERMISSIONS = {
  // Organization Management
  ORG_MANAGE: 'organization.manage',
  ORG_VIEW: 'organization.view',
  ORG_DELETE: 'organization.delete',
  
  // Member Management
  MEMBER_INVITE: 'members.invite',
  MEMBER_REMOVE: 'members.remove',
  MEMBER_VIEW: 'members.view',
  MEMBER_MANAGE: 'members.manage',
  
  // Role Management
  ROLE_CREATE: 'roles.create',
  ROLE_EDIT: 'roles.edit',
  ROLE_DELETE: 'roles.delete',
  ROLE_ASSIGN: 'roles.assign',
  ROLE_VIEW: 'roles.view',
  
  // Permission Management
  PERMISSION_MANAGE: 'permissions.manage',
  PERMISSION_VIEW: 'permissions.view',
  
  // Workflow Management
  WORKFLOW_CREATE: 'workflow.create',
  WORKFLOW_EDIT: 'workflow.edit',
  WORKFLOW_DELETE: 'workflow.delete',
  WORKFLOW_VIEW: 'workflow.view',
  WORKFLOW_TEST: 'workflow.test',
  
  // Repository Management
  REPO_CREATE: 'repositories.create',
  REPO_EDIT: 'repositories.edit',
  REPO_DELETE: 'repositories.delete',
  REPO_VIEW: 'repositories.view',
  REPO_MANAGE: 'repositories.manage',
  
  // Contract Management
  CONTRACT_CREATE: 'contracts.create',
  CONTRACT_EDIT: 'contracts.edit',
  CONTRACT_DELETE: 'contracts.delete',
  CONTRACT_VIEW: 'contracts.view',
  CONTRACT_UPLOAD: 'contracts.upload',
  
  // Approval Actions
  APPROVAL_REVIEW: 'approval.review',
  APPROVAL_APPROVE: 'approval.approve',
  APPROVAL_REJECT: 'approval.reject',
  APPROVAL_REQUEST_CHANGES: 'approval.request_changes',
  APPROVAL_VIEW: 'approval.view'
} as const

/**
 * Role Permissions Mapping
 * Mỗi role có các permissions tương ứng
 */
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  // Organization Owner - Full access
  [ROLES.OWNER]: [
    PERMISSIONS.ORG_MANAGE,
    PERMISSIONS.ORG_VIEW,
    PERMISSIONS.ORG_DELETE,
    PERMISSIONS.MEMBER_INVITE,
    PERMISSIONS.MEMBER_REMOVE,
    PERMISSIONS.MEMBER_VIEW,
    PERMISSIONS.MEMBER_MANAGE,
    PERMISSIONS.ROLE_CREATE,
    PERMISSIONS.ROLE_EDIT,
    PERMISSIONS.ROLE_DELETE,
    PERMISSIONS.ROLE_ASSIGN,
    PERMISSIONS.ROLE_VIEW,
    PERMISSIONS.PERMISSION_MANAGE,
    PERMISSIONS.PERMISSION_VIEW,
    PERMISSIONS.WORKFLOW_CREATE,
    PERMISSIONS.WORKFLOW_EDIT,
    PERMISSIONS.WORKFLOW_DELETE,
    PERMISSIONS.WORKFLOW_VIEW,
    PERMISSIONS.WORKFLOW_TEST,
    PERMISSIONS.REPO_CREATE,
    PERMISSIONS.REPO_EDIT,
    PERMISSIONS.REPO_DELETE,
    PERMISSIONS.REPO_VIEW,
    PERMISSIONS.REPO_MANAGE,
    PERMISSIONS.CONTRACT_CREATE,
    PERMISSIONS.CONTRACT_EDIT,
    PERMISSIONS.CONTRACT_DELETE,
    PERMISSIONS.CONTRACT_VIEW,
    PERMISSIONS.CONTRACT_UPLOAD,
    PERMISSIONS.APPROVAL_REVIEW,
    PERMISSIONS.APPROVAL_APPROVE,
    PERMISSIONS.APPROVAL_REJECT,
    PERMISSIONS.APPROVAL_REQUEST_CHANGES,
    PERMISSIONS.APPROVAL_VIEW
  ],
  
  // Organization Admin - Most access except org deletion
  [ROLES.ADMIN]: [
    PERMISSIONS.ORG_VIEW,
    PERMISSIONS.MEMBER_INVITE,
    PERMISSIONS.MEMBER_REMOVE,
    PERMISSIONS.MEMBER_VIEW,
    PERMISSIONS.MEMBER_MANAGE,
    PERMISSIONS.ROLE_VIEW,
    PERMISSIONS.ROLE_ASSIGN,
    PERMISSIONS.PERMISSION_VIEW,
    PERMISSIONS.WORKFLOW_EDIT,
    PERMISSIONS.WORKFLOW_VIEW,
    PERMISSIONS.WORKFLOW_TEST,
    PERMISSIONS.REPO_CREATE,
    PERMISSIONS.REPO_EDIT,
    PERMISSIONS.REPO_DELETE,
    PERMISSIONS.REPO_VIEW,
    PERMISSIONS.REPO_MANAGE,
    PERMISSIONS.CONTRACT_CREATE,
    PERMISSIONS.CONTRACT_EDIT,
    PERMISSIONS.CONTRACT_VIEW,
    PERMISSIONS.CONTRACT_UPLOAD,
    PERMISSIONS.APPROVAL_VIEW
  ],
  
  // Regular Member - Basic access
  [ROLES.MEMBER]: [
    PERMISSIONS.ORG_VIEW,
    PERMISSIONS.MEMBER_VIEW,
    PERMISSIONS.WORKFLOW_VIEW,
    PERMISSIONS.REPO_VIEW,
    PERMISSIONS.CONTRACT_VIEW,
    PERMISSIONS.APPROVAL_VIEW
  ],
  
  // Contract Reviewer - Kiểm tra hồ sơ
  [ROLES.CONTRACT_REVIEWER]: [
    PERMISSIONS.ORG_VIEW,
    PERMISSIONS.CONTRACT_VIEW,
    PERMISSIONS.CONTRACT_EDIT,
    PERMISSIONS.APPROVAL_REVIEW,
    PERMISSIONS.APPROVAL_APPROVE,
    PERMISSIONS.APPROVAL_REJECT,
    PERMISSIONS.APPROVAL_REQUEST_CHANGES,
    PERMISSIONS.APPROVAL_VIEW,
    PERMISSIONS.WORKFLOW_VIEW,
    PERMISSIONS.REPO_VIEW
  ],
  
  // Department Head - Trưởng phòng
  [ROLES.DEPARTMENT_HEAD]: [
    PERMISSIONS.ORG_VIEW,
    PERMISSIONS.MEMBER_VIEW,
    PERMISSIONS.CONTRACT_VIEW,
    PERMISSIONS.CONTRACT_CREATE,
    PERMISSIONS.CONTRACT_UPLOAD,
    PERMISSIONS.APPROVAL_REVIEW,
    PERMISSIONS.APPROVAL_APPROVE,
    PERMISSIONS.APPROVAL_REJECT,
    PERMISSIONS.APPROVAL_REQUEST_CHANGES,
    PERMISSIONS.APPROVAL_VIEW,
    PERMISSIONS.WORKFLOW_VIEW,
    PERMISSIONS.REPO_VIEW,
    PERMISSIONS.REPO_CREATE
  ],
  
  // Director - Giám đốc
  [ROLES.DIRECTOR]: [
    PERMISSIONS.ORG_VIEW,
    PERMISSIONS.MEMBER_VIEW,
    PERMISSIONS.ROLE_VIEW,
    PERMISSIONS.PERMISSION_VIEW,
    PERMISSIONS.CONTRACT_VIEW,
    PERMISSIONS.APPROVAL_REVIEW,
    PERMISSIONS.APPROVAL_APPROVE,
    PERMISSIONS.APPROVAL_REJECT,
    PERMISSIONS.APPROVAL_REQUEST_CHANGES,
    PERMISSIONS.APPROVAL_VIEW,
    PERMISSIONS.WORKFLOW_VIEW,
    PERMISSIONS.WORKFLOW_EDIT,
    PERMISSIONS.REPO_VIEW,
    PERMISSIONS.REPO_MANAGE
  ],
  
  // Board Member - Thành viên HĐQT
  [ROLES.BOARD_MEMBER]: [
    PERMISSIONS.ORG_VIEW,
    PERMISSIONS.CONTRACT_VIEW,
    PERMISSIONS.APPROVAL_REVIEW,
    PERMISSIONS.APPROVAL_APPROVE,
    PERMISSIONS.APPROVAL_REJECT,
    PERMISSIONS.APPROVAL_VIEW,
    PERMISSIONS.WORKFLOW_VIEW,
    PERMISSIONS.REPO_VIEW
  ]
}

/**
 * Role Descriptions
 */
export const ROLE_DESCRIPTIONS: Record<string, string> = {
  [ROLES.OWNER]: 'Chủ sở hữu - Toàn quyền quản lý tổ chức',
  [ROLES.ADMIN]: 'Quản trị viên - Quản lý thành viên và hệ thống',
  [ROLES.MEMBER]: 'Thành viên - Xem thông tin cơ bản',
  [ROLES.CONTRACT_REVIEWER]: 'Nhân viên kiểm tra - Kiểm tra và phê duyệt hồ sơ ban đầu',
  [ROLES.DEPARTMENT_HEAD]: 'Trưởng phòng - Quản lý và phê duyệt hợp đồng phòng ban',
  [ROLES.DIRECTOR]: 'Giám đốc - Phê duyệt hợp đồng giá trị cao',
  [ROLES.BOARD_MEMBER]: 'Thành viên HĐQT - Phê duyệt hợp đồng đặc biệt quan trọng',
  [ROLES.ACCOUNTANT]: 'Kế toán - Quản lý tài chính và thanh toán',
  [ROLES.LEGAL]: 'Pháp chế - Kiểm tra tính hợp pháp',
  [ROLES.HR]: 'Nhân sự - Quản lý hợp đồng lao động'
}

/**
 * Role Colors for UI
 */
export const ROLE_COLORS: Record<string, string> = {
  [ROLES.OWNER]: 'bg-purple-100 text-purple-800 border-purple-300',
  [ROLES.ADMIN]: 'bg-blue-100 text-blue-800 border-blue-300',
  [ROLES.MEMBER]: 'bg-gray-100 text-gray-800 border-gray-300',
  [ROLES.CONTRACT_REVIEWER]: 'bg-green-100 text-green-800 border-green-300',
  [ROLES.DEPARTMENT_HEAD]: 'bg-orange-100 text-orange-800 border-orange-300',
  [ROLES.DIRECTOR]: 'bg-red-100 text-red-800 border-red-300',
  [ROLES.BOARD_MEMBER]: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  [ROLES.ACCOUNTANT]: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  [ROLES.LEGAL]: 'bg-teal-100 text-teal-800 border-teal-300',
  [ROLES.HR]: 'bg-pink-100 text-pink-800 border-pink-300'
}

/**
 * Role Icons
 */
export const ROLE_ICONS: Record<string, string> = {
  [ROLES.OWNER]: '👑',
  [ROLES.ADMIN]: '🛡️',
  [ROLES.MEMBER]: '👤',
  [ROLES.CONTRACT_REVIEWER]: '📋',
  [ROLES.DEPARTMENT_HEAD]: '👔',
  [ROLES.DIRECTOR]: '💼',
  [ROLES.BOARD_MEMBER]: '🎯',
  [ROLES.ACCOUNTANT]: '💰',
  [ROLES.LEGAL]: '⚖️',
  [ROLES.HR]: '👥'
}
