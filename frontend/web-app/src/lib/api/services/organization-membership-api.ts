/**
 * Organization Membership API
 * Quản lý membership và permissions trong tổ chức
 */

import { apiClient } from '@/lib/http/api-client'
import { Organization, OrganizationMember, OrganizationRole, OrganizationPermission } from '@/types/organization'

// Extended types cho membership system
export interface UserOrganization extends Organization {
  userRole: string
  userPermissions: string[]
  isOwner: boolean
  joinedAt: string
}

export interface OrganizationMemberWithDetails extends OrganizationMember {
  user: {
    id: string
    username: string
    email: string
    firstName?: string
    lastName?: string
    avatar?: string
  }
  roles: OrganizationRole[]
  permissions: string[]
  isOwner: boolean
}

export interface OrganizationStats {
  totalMembers: number
  totalRoles: number
  totalPermissions: number
  totalChatGroups: number
  totalChatChannels: number
  totalMessages: number
  activeMembers: number
  recentActivity: {
    newMembers: number
    newMessages: number
    period: string
  }
}

// Request DTOs
export interface OrganizationCreateRequest {
  name: string
  description?: string
  // ownerUserId sẽ được lấy từ current user
}

export interface OrganizationTransferOwnershipRequest {
  newOwnerId: string
  confirmationMessage?: string
}

export interface OrganizationMemberRoleUpdateRequest {
  roleIds: string[]
  action: 'add' | 'remove' | 'replace'
}

export const organizationMembershipAPI = {
  // User's Organizations (chỉ hiển thị tổ chức mà user là thành viên)
  async getUserOrganizations(): Promise<UserOrganization[]> {
    const response = await apiClient.get('/api/v1/organizations')
    // Backend returns Page<OrganizationResponse>, extract content
    const data = response.data.data as any
    return (data?.content || data || []) as UserOrganization[]
  },

  async getOrganizationDetails(organizationId: string): Promise<UserOrganization> {
    const response = await apiClient.get(`/api/v1/organizations/${organizationId}`)
    return response.data?.data || response.data
  },

  // Organization Management (chỉ owner/admin mới được)
  async createOrganization(data: OrganizationCreateRequest): Promise<Organization> {
    const response = await apiClient.post('/api/v1/organizations', data)
    return response.data?.data || response.data
  },

  async updateOrganization(organizationId: string, data: { name?: string; description?: string }): Promise<Organization> {
    const response = await apiClient.put(`/api/v1/organizations/${organizationId}`, data)
    return response.data?.data || response.data
  },

  async deleteOrganization(organizationId: string): Promise<void> {
    await apiClient.delete(`/api/v1/organizations/${organizationId}`)
  },

  async transferOwnership(organizationId: string, data: OrganizationTransferOwnershipRequest): Promise<void> {
    await apiClient.post(`/api/v1/organizations/${organizationId}/transfer-ownership`, data)
  },

  async getOrganizationStats(organizationId: string): Promise<OrganizationStats> {
    const response = await apiClient.get(`/api/v1/organizations/${organizationId}/stats`)
    return response.data?.data || response.data
  },

  // Members Management với detailed info
  async getOrganizationMembers(organizationId: string): Promise<OrganizationMemberWithDetails[]> {
    const response = await apiClient.get(`/api/v1/organizations/${organizationId}/members/detailed`)
    return response.data?.data || []
  },

  async inviteMemberByEmail(organizationId: string, data: {
    email: string
    roleIds?: string[]
    message?: string
  }): Promise<OrganizationMember> {
    const response = await apiClient.post(`/api/v1/organizations/${organizationId}/members/invite-email`, data)
    return response.data?.data || response.data
  },

  async inviteMemberByUsername(organizationId: string, data: {
    username: string
    roleIds?: string[]
    message?: string
  }): Promise<OrganizationMember> {
    const response = await apiClient.post(`/api/v1/organizations/${organizationId}/members/invite-username`, data)
    return response.data?.data || response.data
  },

  async acceptInvitation(organizationId: string, invitationToken: string): Promise<OrganizationMember> {
    const response = await apiClient.post(`/api/v1/organizations/${organizationId}/members/accept-invitation`, {
      token: invitationToken
    })
    return response.data?.data || response.data
  },

  async rejectInvitation(organizationId: string, invitationToken: string): Promise<void> {
    await apiClient.post(`/api/v1/organizations/${organizationId}/members/reject-invitation`, {
      token: invitationToken
    })
  },

  async updateMemberRoles(organizationId: string, memberId: string, data: OrganizationMemberRoleUpdateRequest): Promise<OrganizationMemberWithDetails> {
    const response = await apiClient.put(`/api/v1/organizations/${organizationId}/members/${memberId}/roles`, data)
    return response.data?.data || response.data
  },

  async updateMemberStatus(organizationId: string, memberId: string, status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'): Promise<OrganizationMemberWithDetails> {
    const response = await apiClient.put(`/api/v1/organizations/${organizationId}/members/${memberId}/status`, { status })
    return response.data?.data || response.data
  },

  async removeMember(organizationId: string, memberId: string): Promise<void> {
    await apiClient.delete(`/api/v1/organizations/${organizationId}/members/${memberId}`)
  },

  async leaveOrganization(organizationId: string): Promise<void> {
    await apiClient.post(`/api/v1/organizations/${organizationId}/leave`)
  },

  // Roles Management với permission checking
  async getOrganizationRoles(organizationId: string): Promise<OrganizationRole[]> {
    const response = await apiClient.get(`/api/v1/organizations/${organizationId}/roles`)
    return response.data?.data || []
  },

  async createRole(organizationId: string, data: {
    name: string
    displayName: string
    description?: string
    permissionIds?: string[]
    level?: number
  }): Promise<OrganizationRole> {
    const response = await apiClient.post(`/api/v1/organizations/${organizationId}/roles`, data)
    return response.data?.data || response.data
  },

  async updateRole(organizationId: string, roleId: string, data: {
    name?: string
    displayName?: string
    description?: string
    permissionIds?: string[]
    level?: number
  }): Promise<OrganizationRole> {
    const response = await apiClient.put(`/api/v1/organizations/${organizationId}/roles/${roleId}`, data)
    return response.data?.data || response.data
  },

  async deleteRole(organizationId: string, roleId: string): Promise<void> {
    await apiClient.delete(`/api/v1/organizations/${organizationId}/roles/${roleId}`)
  },

  async assignRoleToMember(organizationId: string, memberId: string, roleId: string): Promise<void> {
    await apiClient.post(`/api/v1/organizations/${organizationId}/members/${memberId}/roles/${roleId}`)
  },

  async removeRoleFromMember(organizationId: string, memberId: string, roleId: string): Promise<void> {
    await apiClient.delete(`/api/v1/organizations/${organizationId}/members/${memberId}/roles/${roleId}`)
  },

  // Permissions Management
  async getOrganizationPermissions(organizationId: string): Promise<OrganizationPermission[]> {
    const response = await apiClient.get(`/api/v1/organizations/${organizationId}/permissions`)
    return response.data?.data || []
  },

  async createPermission(organizationId: string, data: {
    code: string
    name: string
    description?: string
    category?: string
  }): Promise<OrganizationPermission> {
    const response = await apiClient.post(`/api/v1/organizations/${organizationId}/permissions`, data)
    return response.data?.data || response.data
  },

  async updatePermission(organizationId: string, permissionId: string, data: {
    code?: string
    name?: string
    description?: string
    category?: string
  }): Promise<OrganizationPermission> {
    const response = await apiClient.put(`/api/v1/organizations/${organizationId}/permissions/${permissionId}`, data)
    return response.data?.data || response.data
  },

  async deletePermission(organizationId: string, permissionId: string): Promise<void> {
    await apiClient.delete(`/api/v1/organizations/${organizationId}/permissions/${permissionId}`)
  },

  // Permission Checking
  async checkUserPermission(organizationId: string, permissionCode: string): Promise<boolean> {
    const response = await apiClient.get(`/api/v1/organizations/${organizationId}/check-permission/${permissionCode}`)
    return response.data?.data?.hasPermission || false
  },

  async getUserPermissions(organizationId: string): Promise<string[]> {
    const response = await apiClient.get(`/api/v1/organizations/${organizationId}/user-permissions`)
    return response.data?.data || []
  },

  // Bulk Operations
  async bulkInviteMembers(organizationId: string, data: {
    invitations: Array<{
      email?: string
      username?: string
      roleIds?: string[]
    }>
    message?: string
  }): Promise<{
    successful: OrganizationMember[]
    failed: Array<{
      identifier: string
      error: string
    }>
  }> {
    const response = await apiClient.post(`/api/v1/organizations/${organizationId}/members/bulk-invite`, data)
    return response.data?.data || { successful: [], failed: [] }
  },

  async bulkUpdateMemberRoles(organizationId: string, data: {
    updates: Array<{
      memberId: string
      roleIds: string[]
      action: 'add' | 'remove' | 'replace'
    }>
  }): Promise<{
    successful: OrganizationMemberWithDetails[]
    failed: Array<{
      memberId: string
      error: string
    }>
  }> {
    const response = await apiClient.post(`/api/v1/organizations/${organizationId}/members/bulk-update-roles`, data)
    return response.data?.data || { successful: [], failed: [] }
  }
}
