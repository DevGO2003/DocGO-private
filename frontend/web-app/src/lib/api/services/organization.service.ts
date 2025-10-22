import { 
  Organization, 
  OrganizationCreateRequest, 
  OrganizationUpdateRequest,
  OrganizationMember,
  OrganizationMemberInviteRequest,
  OrganizationMemberUpdateRequest,
  OrganizationRole,
  OrganizationRoleCreateRequest,
  OrganizationRoleUpdateRequest,
  OrganizationPermission,
  OrganizationPermissionCreateRequest,
  OrganizationPermissionUpdateRequest
} from '@/types/organization'
import { apiClient } from '@/lib/http/api-client'

export const organizationAPI = {
  // Organization CRUD
  async getAll(): Promise<Organization[]> {
    const response = await apiClient.get('/api/v1/organizations')
    return response.data?.data || []
  },

  async getById(id: string): Promise<Organization> {
    const response = await apiClient.get(`/api/v1/organizations/${id}`)
    return response.data?.data || response.data
  },

  async create(data: OrganizationCreateRequest): Promise<Organization> {
    const response = await apiClient.post('/api/v1/organizations', data)
    return response.data?.data || response.data
  },

  async update(id: string, data: OrganizationUpdateRequest): Promise<Organization> {
    const response = await apiClient.put(`/api/v1/organizations/${id}`, data)
    return response.data?.data || response.data
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/organizations/${id}`)
  },

  // Members
  async getMembers(organizationId: string): Promise<OrganizationMember[]> {
    const response = await apiClient.get(`/api/v1/organizations/${organizationId}/members`)
    return response.data?.data || []
  },

  async inviteMember(organizationId: string, data: OrganizationMemberInviteRequest): Promise<OrganizationMember> {
    const response = await apiClient.post(`/api/v1/organizations/${organizationId}/members/invite`, data)
    return response.data?.data || response.data
  },

  async updateMember(organizationId: string, memberId: string, data: OrganizationMemberUpdateRequest): Promise<OrganizationMember> {
    const response = await apiClient.put(`/api/v1/organizations/${organizationId}/members/${memberId}`, data)
    return response.data?.data || response.data
  },

  async removeMember(organizationId: string, memberId: string): Promise<void> {
    await apiClient.delete(`/api/v1/organizations/${organizationId}/members/${memberId}`)
  },

  // Roles
  async getRoles(organizationId: string): Promise<OrganizationRole[]> {
    const response = await apiClient.get(`/api/v1/organizations/${organizationId}/roles`)
    return response.data?.data || []
  },

  async createRole(organizationId: string, data: OrganizationRoleCreateRequest): Promise<OrganizationRole> {
    const response = await apiClient.post(`/api/v1/organizations/${organizationId}/roles`, data)
    return response.data?.data || response.data
  },

  async updateRole(organizationId: string, roleId: string, data: OrganizationRoleUpdateRequest): Promise<OrganizationRole> {
    const response = await apiClient.put(`/api/v1/organizations/${organizationId}/roles/${roleId}`, data)
    return response.data?.data || response.data
  },

  async deleteRole(organizationId: string, roleId: string): Promise<void> {
    await apiClient.delete(`/api/v1/organizations/${organizationId}/roles/${roleId}`)
  },

  // Permissions
  async getPermissions(organizationId: string): Promise<OrganizationPermission[]> {
    const response = await apiClient.get(`/api/v1/organizations/${organizationId}/permissions`)
    return response.data?.data || []
  },

  async createPermission(organizationId: string, data: OrganizationPermissionCreateRequest): Promise<OrganizationPermission> {
    const response = await apiClient.post(`/api/v1/organizations/${organizationId}/permissions`, data)
    return response.data?.data || response.data
  },

  async updatePermission(organizationId: string, permissionId: string, data: OrganizationPermissionUpdateRequest): Promise<OrganizationPermission> {
    const response = await apiClient.put(`/api/v1/organizations/${organizationId}/permissions/${permissionId}`, data)
    return response.data?.data || response.data
  },

  async deletePermission(organizationId: string, permissionId: string): Promise<void> {
    await apiClient.delete(`/api/v1/organizations/${organizationId}/permissions/${permissionId}`)
  }
}
