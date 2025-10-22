/**
 * Mock data cho Organization khi authentication bị tắt
 */

export const MOCK_USER_ID = 'mock-user-123'
export const MOCK_USER_EMAIL = 'demo@docgo.com'
export const MOCK_USER_NAME = 'Demo User'

// Current role state (can be changed via RoleSelector)
let currentMockRole = 'Nhân viên kiểm tra'

export const setMockUserRole = (role: string) => {
  currentMockRole = role
  if (typeof window !== 'undefined') {
    localStorage.setItem('mock_user_role', role)
  }
}

export const getMockUserRole = () => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('mock_user_role')
    if (stored) return stored
  }
  return currentMockRole
}

export const MOCK_ORGANIZATIONS = [
  {
    id: 'org-1',
    name: 'Công ty TNHH ABC',
    description: 'Công ty chuyên về phát triển phần mềm',
    createdAt: new Date('2024-01-01').toISOString(),
    ownerId: MOCK_USER_ID,
    userRole: 'owner',
    isOwner: true,
    isAdmin: true,
    stats: {
      totalMembers: 15,
      totalChatGroups: 5,
      totalChatChannels: 12,
      unreadMessages: 3,
      recentActivity: 24
    },
    userPermissions: [
      'organization.manage',
      'members.manage',
      'roles.manage',
      'permissions.manage',
      'workflow.manage',
      'repositories.manage'
    ]
  },
  {
    id: 'org-2',
    name: 'Startup XYZ',
    description: 'Startup công nghệ',
    createdAt: new Date('2024-02-15').toISOString(),
    ownerId: 'other-user',
    userRole: 'admin',
    isOwner: false,
    isAdmin: true,
    stats: {
      totalMembers: 8,
      totalChatGroups: 3,
      totalChatChannels: 6,
      unreadMessages: 1,
      recentActivity: 12
    },
    userPermissions: [
      'members.manage',
      'workflow.view',
      'repositories.manage'
    ]
  }
]

export const MOCK_WORKFLOW = {
  id: 'workflow-1',
  name: 'Quy trình phê duyệt hợp đồng',
  description: 'Quy trình phê duyệt tuần tự qua các cấp, tự động điều chỉnh theo giá trị hợp đồng',
  organization_id: 'org-1',
  is_default: true,
  is_active: true,
  steps: [
    {
      order: 1,
      name: 'Bước 1: Kiểm tra hồ sơ',
      description: 'Nhân viên kiểm tra tính hợp lệ và đầy đủ của hồ sơ hợp đồng',
      enabled_condition: {
        type: 'always'
      },
      type: 'sequential',
      approvers: {
        roles: ['Nhân viên kiểm tra'],
        specific_users: [],
        min_approvals: 1
      },
      timeout_hours: 24,
      actions: ['approve', 'reject', 'request_changes']
    },
    {
      order: 2,
      name: 'Bước 2: Trưởng phòng phê duyệt',
      description: 'Trưởng phòng kinh doanh xem xét và phê duyệt (hợp đồng ≥ 50 triệu)',
      enabled_condition: {
        type: 'value_threshold',
        field: 'totalValue',
        operator: '>=',
        value: 50000000
      },
      type: 'sequential',
      approvers: {
        roles: ['Trưởng phòng'],
        specific_users: [],
        min_approvals: 1
      },
      timeout_hours: 48,
      actions: ['approve', 'reject', 'request_changes']
    },
    {
      order: 3,
      name: 'Bước 3: Giám đốc phê duyệt',
      description: 'Giám đốc công ty phê duyệt cuối cùng (hợp đồng ≥ 500 triệu)',
      enabled_condition: {
        type: 'value_threshold',
        field: 'totalValue',
        operator: '>=',
        value: 500000000
      },
      type: 'sequential',
      approvers: {
        roles: ['Giám đốc'],
        specific_users: [],
        min_approvals: 1
      },
      timeout_hours: 72,
      actions: ['approve', 'reject', 'request_changes']
    },
    {
      order: 4,
      name: 'Bước 4: Hội đồng quản trị',
      description: 'Hội đồng quản trị họp và quyết định (hợp đồng ≥ 2 tỷ)',
      enabled_condition: {
        type: 'value_threshold',
        field: 'totalValue',
        operator: '>=',
        value: 2000000000
      },
      type: 'parallel',
      approvers: {
        roles: ['Thành viên HĐQT'],
        specific_users: [],
        min_approvals: 3
      },
      timeout_hours: 168,
      actions: ['approve', 'reject']
    }
  ]
}

export const MOCK_REPOSITORIES = [
  {
    id: 'repo-1',
    name: 'Hợp đồng mua bán',
    description: 'Các hợp đồng mua bán hàng hóa',
    type: 'contracts',
    visibility: 'private',
    contract_count: 45,
    total_value: 15000000000,
    currency: 'VND',
    last_activity_at: new Date().toISOString()
  },
  {
    id: 'repo-2',
    name: 'Hợp đồng dịch vụ',
    description: 'Hợp đồng cung cấp dịch vụ',
    type: 'contracts',
    visibility: 'private',
    contract_count: 28,
    total_value: 8500000000,
    currency: 'VND',
    last_activity_at: new Date().toISOString()
  },
  {
    id: 'repo-3',
    name: 'Hợp đồng lao động',
    description: 'Hợp đồng lao động nhân viên',
    type: 'hr',
    visibility: 'private',
    contract_count: 15,
    total_value: 0,
    currency: 'VND',
    last_activity_at: new Date().toISOString()
  }
]

export const MOCK_WORKFLOW_INSTANCE = {
  id: 'wf-instance-1',
  contract_id: 'contract-1',
  workflow_id: 'workflow-1',
  current_step: 1,
  status: 'in_progress',
  created_at: new Date('2024-03-01T09:00:00').toISOString(),
  updated_at: new Date('2024-03-01T10:30:00').toISOString(),
  steps: [
    {
      order: 1,
      name: 'Bước 1: Kiểm tra hồ sơ',
      status: 'completed',
      assigned_role: 'Nhân viên kiểm tra',
      assigned_users: ['Nguyễn Văn A'],
      approvals: [
        {
          userId: 'user-reviewer-1',
          userName: 'Nguyễn Văn A',
          userRole: 'Nhân viên kiểm tra',
          action: 'approve',
          comment: 'Hồ sơ đầy đủ, hợp lệ. Đã kiểm tra tất cả tài liệu.',
          timestamp: new Date('2024-03-01T10:30:00').toISOString()
        }
      ],
      started_at: new Date('2024-03-01T09:00:00').toISOString(),
      completed_at: new Date('2024-03-01T10:30:00').toISOString()
    },
    {
      order: 2,
      name: 'Bước 2: Trưởng phòng phê duyệt',
      status: 'in_progress',
      assigned_role: 'Trưởng phòng',
      assigned_users: ['Trần Thị B', 'Lê Văn C'],
      approvals: [],
      started_at: new Date('2024-03-01T10:30:00').toISOString(),
      completed_at: null
    },
    {
      order: 3,
      name: 'Bước 3: Giám đốc phê duyệt',
      status: 'pending',
      assigned_role: 'Giám đốc',
      assigned_users: ['Phạm Văn D'],
      approvals: [],
      started_at: null,
      completed_at: null
    }
  ]
}

// Mock API responses
export const mockOrganizationAPI = {
  getUserOrganizations: async () => {
    await new Promise(resolve => setTimeout(resolve, 500)) // Simulate network delay
    return MOCK_ORGANIZATIONS
  },

  selectOrganization: async (orgId: string) => {
    await new Promise(resolve => setTimeout(resolve, 300))
    const org = MOCK_ORGANIZATIONS.find(o => o.id === orgId)
    if (!org) throw new Error('Organization not found')
    return org
  },

  getWorkflow: async (orgId: string) => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return MOCK_WORKFLOW
  },

  testWorkflow: async (orgId: string, data: any) => {
    await new Promise(resolve => setTimeout(resolve, 500))
    const value = data.totalValue
    
    let enabledSteps = ['Kiểm tra ban đầu']
    let estimatedDays = 1
    
    if (value >= 50000000) {
      enabledSteps.push('Phê duyệt cấp trưởng phòng')
      estimatedDays += 2
    }
    if (value >= 500000000) {
      enabledSteps.push('Phê duyệt giám đốc')
      estimatedDays += 3
    }
    if (value >= 2000000000) {
      enabledSteps.push('Phê duyệt hội đồng quản trị')
      estimatedDays += 7
    }
    
    return {
      totalSteps: 4,
      enabledSteps,
      estimatedDays
    }
  },

  getRepositories: async (orgId: string) => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return MOCK_REPOSITORIES
  },

  getRepository: async (orgId: string, repoId: string) => {
    await new Promise(resolve => setTimeout(resolve, 300))
    const repo = MOCK_REPOSITORIES.find(r => r.id === repoId)
    if (!repo) throw new Error('Repository not found')
    return repo
  },

  getRepositoryContracts: async (orgId: string, repoId: string) => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return MOCK_CONTRACTS.filter(c => c.repositoryId === repoId)
  },

  createRepository: async (orgId: string, data: any) => {
    await new Promise(resolve => setTimeout(resolve, 500))
    return {
      id: `repo-${Date.now()}`,
      ...data,
      contract_count: 0,
      total_value: 0,
      currency: 'VND',
      last_activity_at: new Date().toISOString()
    }
  },

  deleteRepository: async (orgId: string, repoId: string) => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return { success: true }
  },

  getWorkflowStatus: async (contractId: string) => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return MOCK_WORKFLOW_INSTANCE
  },

  approveWorkflow: async (instanceId: string, data: any) => {
    await new Promise(resolve => setTimeout(resolve, 500))
    return { success: true, message: 'Approved successfully' }
  },

  rejectWorkflow: async (instanceId: string, data: any) => {
    await new Promise(resolve => setTimeout(resolve, 500))
    return { success: true, message: 'Rejected successfully' }
  },

  requestChanges: async (instanceId: string, data: any) => {
    await new Promise(resolve => setTimeout(resolve, 500))
    return { success: true, message: 'Changes requested successfully' }
  }
}

/**
 * Mock Contracts Data
 */
export const MOCK_CONTRACTS = [
  {
    id: 'contract-1',
    fileName: 'HD-MB-2024-001.pdf',
    contractType: 'purchase',
    totalValue: 150000000,
    currency: 'VND',
    description: 'Hợp đồng mua bán thiết bị văn phòng',
    repositoryId: 'repo-1',
    partnerName: 'Công ty TNHH Thiết bị ABC',
    startDate: '2024-03-01',
    endDate: '2024-12-31',
    createdBy: 'Nguyễn Văn A',
    createdAt: new Date('2024-03-01T09:00:00').toISOString(),
    approvalStatus: 'pending',
    workflowInstanceId: 'wf-instance-1'
  },
  {
    id: 'contract-2',
    fileName: 'HD-DV-2024-002.pdf',
    contractType: 'service',
    totalValue: 750000000,
    currency: 'VND',
    description: 'Hợp đồng dịch vụ bảo trì hệ thống',
    repositoryId: 'repo-2',
    partnerName: 'Công ty CP Dịch vụ XYZ',
    startDate: '2024-02-15',
    endDate: '2025-02-14',
    createdBy: 'Trần Thị B',
    createdAt: new Date('2024-02-15T10:30:00').toISOString(),
    approvalStatus: 'approved',
    workflowInstanceId: 'wf-instance-2'
  },
  {
    id: 'contract-3',
    fileName: 'HD-LD-2024-003.pdf',
    contractType: 'labor',
    totalValue: 25000000,
    currency: 'VND',
    description: 'Hợp đồng lao động nhân viên mới',
    repositoryId: 'repo-3',
    partnerName: 'Lê Văn C',
    startDate: '2024-03-15',
    endDate: '2025-03-14',
    createdBy: 'Phạm Văn D',
    createdAt: new Date('2024-03-15T14:00:00').toISOString(),
    approvalStatus: 'rejected',
    workflowInstanceId: 'wf-instance-3'
  }
]
