/**
 * Extended Organization Types
 * Hỗ trợ membership, chat và permission system
 */

import { Organization, OrganizationMember, OrganizationRole, OrganizationPermission } from './organization'

// Extended Organization với user context
export interface UserOrganizationContext extends Organization {
  // User's role trong organization này
  userRole: string
  userRoleLevel: number
  userPermissions: string[]
  isOwner: boolean
  isAdmin: boolean
  joinedAt: string
  lastActivityAt?: string
  
  // Organization stats
  stats?: {
    totalMembers: number
    totalChatGroups: number
    totalChatChannels: number
    unreadMessages: number
    recentActivity: number
  }
}

// Member với thông tin chi tiết
export interface OrganizationMemberDetailed extends OrganizationMember {
  user: {
    id: string
    username: string
    email: string
    firstName?: string
    lastName?: string
    avatar?: string
    status: 'ONLINE' | 'OFFLINE' | 'AWAY' | 'BUSY'
    lastSeenAt?: string
  }
  roles: OrganizationRole[]
  permissions: string[]
  isOwner: boolean
  isAdmin: boolean
  canManageMembers: boolean
  canManageRoles: boolean
  canManageChat: boolean
  invitedBy?: string
  invitedAt?: string
}

// Chat System Types
export interface ChatGroup {
  id: string
  name: string
  description?: string
  organizationId: string
  createdBy: string
  createdByUser?: {
    id: string
    username: string
    avatar?: string
  }
  memberCount: number
  channelCount: number
  isPrivate: boolean
  isDefault: boolean
  settings: {
    allowMemberInvite: boolean
    allowFileUpload: boolean
    allowVoiceCall: boolean
    allowVideoCall: boolean
    messageRetentionDays?: number
  }
  createdAt: string
  updatedAt: string
}

export interface ChatChannel {
  id: string
  name: string
  description?: string
  groupId: string
  organizationId: string
  type: 'general' | 'project' | 'private' | 'announcement' | 'support'
  memberCount: number
  unreadCount: number
  isJoined: boolean
  isMuted: boolean
  isPinned: boolean
  createdBy: string
  createdByUser?: {
    id: string
    username: string
    avatar?: string
  }
  lastMessage?: {
    id: string
    content: string
    userName: string
    timestamp: string
    type: 'text' | 'file' | 'image' | 'system'
  }
  settings: {
    isReadOnly: boolean
    allowThreads: boolean
    allowReactions: boolean
    allowFileUpload: boolean
    maxFileSize: number
    allowedFileTypes: string[]
  }
  createdAt: string
  updatedAt: string
}

export interface ChatMessage {
  id: string
  channelId: string
  userId: string
  user: {
    id: string
    username: string
    avatar?: string
    role?: string
  }
  content: string
  type: 'text' | 'file' | 'image' | 'video' | 'audio' | 'system' | 'announcement'
  
  // File attachments
  attachments?: Array<{
    id: string
    fileName: string
    fileUrl: string
    fileSize: number
    fileType: string
    thumbnailUrl?: string
  }>
  
  // Message features
  replyTo?: {
    id: string
    content: string
    userName: string
  }
  reactions?: Array<{
    emoji: string
    count: number
    users: string[]
    hasUserReacted: boolean
  }>
  mentions?: Array<{
    userId: string
    username: string
    type: 'user' | 'channel' | 'everyone'
  }>
  
  // Message status
  isEdited: boolean
  editedAt?: string
  isPinned: boolean
  pinnedBy?: string
  pinnedAt?: string
  isDeleted: boolean
  deletedAt?: string
  
  // Threading
  threadCount?: number
  lastReplyAt?: string
  
  createdAt: string
  updatedAt: string
}

export interface ChatMember {
  id: string
  userId: string
  user: {
    id: string
    username: string
    email: string
    avatar?: string
    status: 'ONLINE' | 'OFFLINE' | 'AWAY' | 'BUSY'
  }
  channelId?: string
  groupId?: string
  organizationId: string
  role: 'owner' | 'admin' | 'moderator' | 'member'
  permissions: string[]
  joinedAt: string
  lastSeenAt?: string
  isTyping: boolean
  isMuted: boolean
  notificationSettings: {
    mentions: boolean
    allMessages: boolean
    directMessages: boolean
    keywords: string[]
  }
}

// Permission System
export interface OrganizationPermissionCategory {
  id: string
  name: string
  description?: string
  permissions: OrganizationPermission[]
  order: number
}

export interface OrganizationRoleWithPermissions extends OrganizationRole {
  permissions: OrganizationPermission[]
  memberCount: number
  isDefault: boolean
  isSystemRole: boolean
  canBeDeleted: boolean
}

// Activity & Audit
export interface OrganizationActivity {
  id: string
  organizationId: string
  userId: string
  user: {
    username: string
    avatar?: string
  }
  type: 'member_joined' | 'member_left' | 'role_assigned' | 'role_removed' | 
        'channel_created' | 'channel_deleted' | 'message_sent' | 'file_uploaded' |
        'permission_granted' | 'permission_revoked' | 'organization_updated'
  description: string
  metadata?: Record<string, any>
  createdAt: string
}

// Invitation System
export interface OrganizationInvitation {
  id: string
  organizationId: string
  invitedBy: string
  invitedByUser: {
    username: string
    avatar?: string
  }
  email?: string
  username?: string
  roleIds: string[]
  roles: OrganizationRole[]
  message?: string
  token: string
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED'
  expiresAt: string
  acceptedAt?: string
  rejectedAt?: string
  createdAt: string
}

// Search & Filter Types
export interface OrganizationSearchFilters {
  query?: string
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  memberCountMin?: number
  memberCountMax?: number
  createdAfter?: string
  createdBefore?: string
  hasChat?: boolean
  userRole?: string[]
}

export interface ChatSearchFilters {
  query?: string
  type?: ChatChannel['type'][]
  groupId?: string
  hasUnread?: boolean
  isJoined?: boolean
  createdAfter?: string
  createdBefore?: string
}

export interface MessageSearchFilters {
  query?: string
  userId?: string
  type?: ChatMessage['type'][]
  hasAttachments?: boolean
  isPinned?: boolean
  createdAfter?: string
  createdBefore?: string
}

// Real-time Event Types
export interface ChatEvent {
  type: 'message_sent' | 'message_updated' | 'message_deleted' | 
        'user_joined' | 'user_left' | 'user_typing' | 'user_stopped_typing' |
        'channel_updated' | 'member_role_changed'
  channelId: string
  userId: string
  data: any
  timestamp: string
}

// Notification Types
export interface OrganizationNotification {
  id: string
  organizationId: string
  userId: string
  type: 'mention' | 'direct_message' | 'channel_message' | 'member_joined' |
        'role_assigned' | 'invitation_received' | 'announcement'
  title: string
  message: string
  data?: Record<string, any>
  isRead: boolean
  readAt?: string
  createdAt: string
}

// Settings Types
export interface OrganizationSettings {
  general: {
    allowMemberInvite: boolean
    requireInviteApproval: boolean
    allowMemberLeave: boolean
    allowPublicChannels: boolean
    allowPrivateChannels: boolean
    defaultMemberRole: string
  }
  chat: {
    allowFileUpload: boolean
    maxFileSize: number
    allowedFileTypes: string[]
    messageRetentionDays?: number
    allowVoiceCall: boolean
    allowVideoCall: boolean
    allowScreenShare: boolean
  }
  notifications: {
    emailNotifications: boolean
    pushNotifications: boolean
    mentionNotifications: boolean
    directMessageNotifications: boolean
  }
  security: {
    requireTwoFactor: boolean
    allowGuestAccess: boolean
    sessionTimeoutMinutes: number
    allowExternalIntegrations: boolean
  }
}
