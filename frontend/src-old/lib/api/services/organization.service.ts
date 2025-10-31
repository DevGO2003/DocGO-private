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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

export const organizationAPI = {
  // Organization CRUD
  async getAll(): Promise<Organization[]> {
    const response = await fetch(`${API_BASE_URL}/api/v1/organizations`)
    if (!response.ok) {
      throw new Error('Failed to fetch organizations')
    }
    return response.json()
  },

  async getById(id: string): Promise<Organization> {
    const response = await fetch(`${API_BASE_URL}/api/v1/organizations/${id}`)
    if (!response.ok) {
      throw new Error('Failed to fetch organization')
    }
    return response.json()
  },

  async create(data: OrganizationCreateRequest): Promise<Organization> {
    const response = await fetch(`${API_BASE_URL}/api/v1/organizations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error('Failed to create organization')
    }
    return response.json()
  },

  async update(id: string, data: OrganizationUpdateRequest): Promise<Organization> {
    const response = await fetch(`${API_BASE_URL}/api/v1/organizations/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error('Failed to update organization')
    }
    return response.json()
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/v1/organizations/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      throw new Error('Failed to delete organization')
    }
  },

  // Members
  async getMembers(organizationId: string): Promise<OrganizationMember[]> {
    const response = await fetch(`${API_BASE_URL}/api/v1/organizations/${organizationId}/members`)
    if (!response.ok) {
      throw new Error('Failed to fetch organization members')
    }
    return response.json()
  },

  async inviteMember(organizationId: string, data: OrganizationMemberInviteRequest): Promise<OrganizationMember> {
    const response = await fetch(`${API_BASE_URL}/api/v1/organizations/${organizationId}/members/invite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error('Failed to invite member')
    }
    return response.json()
  },

  async updateMember(organizationId: string, memberId: string, data: OrganizationMemberUpdateRequest): Promise<OrganizationMember> {
    const response = await fetch(`${API_BASE_URL}/api/v1/organizations/${organizationId}/members/${memberId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error('Failed to update member')
    }
    return response.json()
  },

  async removeMember(organizationId: string, memberId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/v1/organizations/${organizationId}/members/${memberId}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      throw new Error('Failed to remove member')
    }
  },

  // Roles
  async getRoles(organizationId: string): Promise<OrganizationRole[]> {
    const response = await fetch(`${API_BASE_URL}/api/v1/organizations/${organizationId}/roles`)
    if (!response.ok) {
      throw new Error('Failed to fetch organization roles')
    }
    return response.json()
  },

  async createRole(organizationId: string, data: OrganizationRoleCreateRequest): Promise<OrganizationRole> {
    const response = await fetch(`${API_BASE_URL}/api/v1/organizations/${organizationId}/roles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error('Failed to create role')
    }
    return response.json()
  },

  async updateRole(organizationId: string, roleId: string, data: OrganizationRoleUpdateRequest): Promise<OrganizationRole> {
    const response = await fetch(`${API_BASE_URL}/api/v1/organizations/${organizationId}/roles/${roleId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error('Failed to update role')
    }
    return response.json()
  },

  async deleteRole(organizationId: string, roleId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/v1/organizations/${organizationId}/roles/${roleId}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      throw new Error('Failed to delete role')
    }
  },

  // Permissions
  async getPermissions(organizationId: string): Promise<OrganizationPermission[]> {
    const response = await fetch(`${API_BASE_URL}/api/v1/organizations/${organizationId}/permissions`)
    if (!response.ok) {
      throw new Error('Failed to fetch organization permissions')
    }
    return response.json()
  },

  async createPermission(organizationId: string, data: OrganizationPermissionCreateRequest): Promise<OrganizationPermission> {
    const response = await fetch(`${API_BASE_URL}/api/v1/organizations/${organizationId}/permissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error('Failed to create permission')
    }
    return response.json()
  },

  async updatePermission(organizationId: string, permissionId: string, data: OrganizationPermissionUpdateRequest): Promise<OrganizationPermission> {
    const response = await fetch(`${API_BASE_URL}/api/v1/organizations/${organizationId}/permissions/${permissionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error('Failed to update permission')
    }
    return response.json()
  },

  async deletePermission(organizationId: string, permissionId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/v1/organizations/${organizationId}/permissions/${permissionId}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      throw new Error('Failed to delete permission')
    }
  }
}






















































































