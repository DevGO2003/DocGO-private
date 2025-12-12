// Organization types matching backend

export interface Organization {
  id: string;
  name: string;
  description?: string;
  ownerUserId?: string; // Backend field name
  owner?: string; // Alias for backward compatibility
  ownerName?: string;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
  settings?: OrganizationSettings;
  userRole?: MemberRole; // Current user's role in this organization
  userPermissions?: ManagerPermission[]; // Current user's permissions if Manager
}

export interface OrganizationSettings {
  isPublic: boolean;
  allowInvitations: boolean;
  requireApproval: boolean;
  defaultRole: string;
}

export interface OrganizationCreateData {
  name: string;
  code?: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  ownerUserId: string; // Required by backend
}

export interface OrganizationUpdateData {
  name?: string;
  description?: string;
  settings?: Partial<OrganizationSettings>;
}

// Member types
export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: MemberRole;
  permissions?: ManagerPermission[]; // Permissions list for MANAGER role
  status: MemberStatus;
  joinedAt: string;
}

export enum MemberRole {
  OWNER = 'OWNER',
  MANAGER = 'MANAGER',
  MEMBER = 'MEMBER'
}

// Permissions for Manager role
export type ManagerPermission = 
  | 'approve:legal'
  | 'approve:finance'
  | 'approve:executive'
  | 'member:invite'
  | 'org:settings';

export interface OrganizationMembership {
  id: string;
  userId: string;
  organizationId: string;
  role: MemberRole;
  permissions: ManagerPermission[];
  status: MemberStatus;
  joinedAt: string;
}

export enum MemberStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  SUSPENDED = 'SUSPENDED'
}

export interface InviteMemberData {
  email: string;
  role: MemberRole;
  permissions?: ManagerPermission[]; // Only used if role is MANAGER
}

export interface Invitation {
  id: string;
  organizationId: string;
  organizationName?: string;
  email: string;
  role: MemberRole;
  permissions?: ManagerPermission[];
  token: string;
  status: InvitationStatus;
  invitedBy: string;
  invitedByName?: string; // Tên người mời (từ backend)
  expiresAt: string;
  createdAt: string;
}

export enum InvitationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  EXPIRED = 'EXPIRED'
}

export interface AcceptInvitationData {
  token: string;
}

export interface AcceptInvitationResponse {
  organizationId: string;
  userId: string;
  role: MemberRole;
}

export interface UpdateMemberData {
  role?: MemberRole;
  permissions?: ManagerPermission[]; // Update permissions for Manager
  status?: MemberStatus;
}

// Organization state
export interface OrganizationState {
  organizations: Organization[];
  currentOrganization: Organization | null;
  members: OrganizationMember[];
  isLoading: boolean;
  error: string | null;
}
