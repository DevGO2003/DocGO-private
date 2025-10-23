// Organization types matching backend

export interface Organization {
  id: string;
  name: string;
  description?: string;
  owner: string; // userId
  ownerName?: string;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
  settings?: OrganizationSettings;
}

export interface OrganizationSettings {
  isPublic: boolean;
  allowInvitations: boolean;
  requireApproval: boolean;
  defaultRole: string;
}

export interface OrganizationCreateData {
  name: string;
  description?: string;
  settings?: Partial<OrganizationSettings>;
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
  role: MemberRole;
  status: MemberStatus;
  joinedAt: string;
}

export enum MemberRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
  VIEWER = 'VIEWER'
}

export enum MemberStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  SUSPENDED = 'SUSPENDED'
}

export interface InviteMemberData {
  email: string;
  role?: MemberRole;
}

export interface UpdateMemberData {
  role?: MemberRole;
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
