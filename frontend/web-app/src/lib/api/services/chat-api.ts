/**
 * Chat Management API
 * Quản lý chat groups, channels và messages trong tổ chức
 */

import { apiClient } from '@/lib/http/api-client'

// Types cho Chat System
export interface ChatGroup {
  id: string
  name: string
  description?: string
  organizationId: string
  createdBy: string
  memberCount: number
  isPrivate: boolean
  createdAt: string
  updatedAt: string
}

export interface ChatChannel {
  id: string
  name: string
  description?: string
  groupId: string
  organizationId: string
  type: 'general' | 'project' | 'private' | 'announcement'
  memberCount: number
  isJoined: boolean
  createdBy: string
  lastMessageAt?: string
  createdAt: string
  updatedAt: string
}

export interface ChatMessage {
  id: string
  channelId: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  type: 'text' | 'file' | 'image' | 'video' | 'audio' | 'system'
  fileUrl?: string
  fileName?: string
  fileSize?: number
  replyToId?: string
  isEdited: boolean
  isPinned: boolean
  createdAt: string
  updatedAt: string
}

export interface ChatMember {
  id: string
  userId: string
  userName: string
  userEmail: string
  userAvatar?: string
  channelId?: string
  groupId?: string
  organizationId: string
  role: 'admin' | 'moderator' | 'member'
  joinedAt: string
  lastSeenAt?: string
}

// Request DTOs
export interface ChatGroupCreateRequest {
  name: string
  description?: string
  isPrivate?: boolean
}

export interface ChatGroupUpdateRequest {
  name?: string
  description?: string
  isPrivate?: boolean
}

export interface ChatChannelCreateRequest {
  name: string
  description?: string
  groupId: string
  type?: 'general' | 'project' | 'private' | 'announcement'
}

export interface ChatChannelUpdateRequest {
  name?: string
  description?: string
  type?: 'general' | 'project' | 'private' | 'announcement'
}

export interface ChatMessageCreateRequest {
  content: string
  type?: 'text' | 'file' | 'image' | 'video' | 'audio'
  fileUrl?: string
  fileName?: string
  fileSize?: number
  replyToId?: string
}

export interface ChatMessageUpdateRequest {
  content: string
}

export interface ChatMemberInviteRequest {
  userIds: string[]
  role?: 'admin' | 'moderator' | 'member'
}

export const chatAPI = {
  // Chat Groups Management
  async getGroups(organizationId: string): Promise<ChatGroup[]> {
    const response = await apiClient.get(`/api/v1/organizations/${organizationId}/chat/groups`)
    return response.data?.data || []
  },

  async createGroup(organizationId: string, data: ChatGroupCreateRequest): Promise<ChatGroup> {
    const response = await apiClient.post(`/api/v1/organizations/${organizationId}/chat/groups`, data)
    return response.data?.data || response.data
  },

  async updateGroup(organizationId: string, groupId: string, data: ChatGroupUpdateRequest): Promise<ChatGroup> {
    const response = await apiClient.put(`/api/v1/organizations/${organizationId}/chat/groups/${groupId}`, data)
    return response.data?.data || response.data
  },

  async deleteGroup(organizationId: string, groupId: string): Promise<void> {
    await apiClient.delete(`/api/v1/organizations/${organizationId}/chat/groups/${groupId}`)
  },

  // Chat Channels Management
  async getChannels(organizationId: string, groupId: string): Promise<ChatChannel[]> {
    const response = await apiClient.get(`/api/v1/organizations/${organizationId}/chat/groups/${groupId}/channels`)
    return response.data?.data || []
  },

  async createChannel(organizationId: string, data: ChatChannelCreateRequest): Promise<ChatChannel> {
    const response = await apiClient.post(`/api/v1/organizations/${organizationId}/chat/channels`, data)
    return response.data?.data || response.data
  },

  async updateChannel(organizationId: string, channelId: string, data: ChatChannelUpdateRequest): Promise<ChatChannel> {
    const response = await apiClient.put(`/api/v1/organizations/${organizationId}/chat/channels/${channelId}`, data)
    return response.data?.data || response.data
  },

  async deleteChannel(organizationId: string, channelId: string): Promise<void> {
    await apiClient.delete(`/api/v1/organizations/${organizationId}/chat/channels/${channelId}`)
  },

  async joinChannel(organizationId: string, channelId: string): Promise<void> {
    await apiClient.post(`/api/v1/organizations/${organizationId}/chat/channels/${channelId}/join`)
  },

  async leaveChannel(organizationId: string, channelId: string): Promise<void> {
    await apiClient.post(`/api/v1/organizations/${organizationId}/chat/channels/${channelId}/leave`)
  },

  // Messages Management
  async getMessages(organizationId: string, channelId: string, page: number = 0, size: number = 50): Promise<{
    messages: ChatMessage[]
    totalPages: number
    totalElements: number
    hasNext: boolean
  }> {
    const response = await apiClient.get(`/api/v1/organizations/${organizationId}/chat/channels/${channelId}/messages`, {
      params: { page, size, sortBy: 'createdAt', sortDirection: 'DESC' }
    })
    return response.data?.data || { messages: [], totalPages: 0, totalElements: 0, hasNext: false }
  },

  async sendMessage(organizationId: string, channelId: string, data: ChatMessageCreateRequest): Promise<ChatMessage> {
    const response = await apiClient.post(`/api/v1/organizations/${organizationId}/chat/channels/${channelId}/messages`, data)
    return response.data?.data || response.data
  },

  async updateMessage(organizationId: string, channelId: string, messageId: string, data: ChatMessageUpdateRequest): Promise<ChatMessage> {
    const response = await apiClient.put(`/api/v1/organizations/${organizationId}/chat/channels/${channelId}/messages/${messageId}`, data)
    return response.data?.data || response.data
  },

  async deleteMessage(organizationId: string, channelId: string, messageId: string): Promise<void> {
    await apiClient.delete(`/api/v1/organizations/${organizationId}/chat/channels/${channelId}/messages/${messageId}`)
  },

  async pinMessage(organizationId: string, channelId: string, messageId: string): Promise<void> {
    await apiClient.post(`/api/v1/organizations/${organizationId}/chat/channels/${channelId}/messages/${messageId}/pin`)
  },

  async unpinMessage(organizationId: string, channelId: string, messageId: string): Promise<void> {
    await apiClient.delete(`/api/v1/organizations/${organizationId}/chat/channels/${channelId}/messages/${messageId}/pin`)
  },

  async getPinnedMessages(organizationId: string, channelId: string): Promise<ChatMessage[]> {
    const response = await apiClient.get(`/api/v1/organizations/${organizationId}/chat/channels/${channelId}/messages/pinned`)
    return response.data?.data || []
  },

  // Chat Members Management
  async getChannelMembers(organizationId: string, channelId: string): Promise<ChatMember[]> {
    const response = await apiClient.get(`/api/v1/organizations/${organizationId}/chat/channels/${channelId}/members`)
    return response.data?.data || []
  },

  async inviteMembers(organizationId: string, channelId: string, data: ChatMemberInviteRequest): Promise<ChatMember[]> {
    const response = await apiClient.post(`/api/v1/organizations/${organizationId}/chat/channels/${channelId}/members/invite`, data)
    return response.data?.data || []
  },

  async removeMember(organizationId: string, channelId: string, userId: string): Promise<void> {
    await apiClient.delete(`/api/v1/organizations/${organizationId}/chat/channels/${channelId}/members/${userId}`)
  },

  async updateMemberRole(organizationId: string, channelId: string, userId: string, role: 'admin' | 'moderator' | 'member'): Promise<ChatMember> {
    const response = await apiClient.put(`/api/v1/organizations/${organizationId}/chat/channels/${channelId}/members/${userId}/role`, { role })
    return response.data?.data || response.data
  },

  // File Upload for Chat
  async uploadChatFile(organizationId: string, channelId: string, file: File): Promise<{
    fileUrl: string
    fileName: string
    fileSize: number
    fileType: string
  }> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('channelId', channelId)
    
    const response = await apiClient.post(`/api/v1/organizations/${organizationId}/chat/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data?.data || response.data
  },

  // Real-time Events (WebSocket endpoints)
  getWebSocketUrl(organizationId: string, channelId: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_WS_BASE_URL || 'ws://localhost:8000'
    return `${baseUrl}/ws/organizations/${organizationId}/chat/channels/${channelId}`
  }
}
