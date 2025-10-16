export interface Organization {
  id: string
  name: string
  description?: string
  ownerUserId: string
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  memberCount?: number
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

export interface OrganizationMember {
  id: string
  organizationId: string
  userId: string
  email: string
  roleIds: string[]
  status: 'ACTIVE' | 'PENDING' | 'INACTIVE'
  joinedAt: string
}

export interface OrganizationRole {
  id: string
  organizationId: string
  name: string
  displayName: string
  description?: string
  permissionIds: string[]
  level?: number
  createdAt: string
}

export interface OrganizationPermission {
  id: string
  organizationId: string
  code: string
  name: string
  description?: string
  category?: string
  createdAt: string
}

// Request DTOs
export interface OrganizationCreateRequest {
  name: string
  description?: string
  ownerUserId: string
}

export interface OrganizationUpdateRequest {
  name?: string
  description?: string
  ownerUserId?: string
}

export interface OrganizationMemberInviteRequest {
  email: string
  message?: string
  roleIds?: string[]
}

export interface OrganizationMemberUpdateRequest {
  roleIds?: string[]
  status?: 'ACTIVE' | 'PENDING' | 'INACTIVE'
}

export interface OrganizationRoleCreateRequest {
  name: string
  displayName: string
  description?: string
  permissionIds?: string[]
  level?: number
}

export interface OrganizationRoleUpdateRequest {
  name?: string
  displayName?: string
  description?: string
  permissionIds?: string[]
  level?: number
}

export interface OrganizationPermissionCreateRequest {
  code: string
  name: string
  description?: string
  category?: string
}

export interface OrganizationPermissionUpdateRequest {
  code?: string
  name?: string
  description?: string
  category?: string
}

