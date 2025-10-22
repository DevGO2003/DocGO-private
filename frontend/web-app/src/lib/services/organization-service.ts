/**
 * Organization Service
 * Service tổng hợp quản lý tất cả tính năng organization
 */

import { organizationMembershipAPI } from '@/lib/apis/organization-membership-api'
import { chatAPI } from '@/lib/apis/chat-api'
import { 
  UserOrganizationContext, 
  OrganizationMemberDetailed,
  ChatGroup,
  ChatChannel,
  ChatMessage,
  OrganizationActivity,
  OrganizationInvitation
} from '@/types/organization-extended'

class OrganizationService {
  private currentOrganizationId: string | null = null
  private currentUserPermissions: string[] = []
  private wsConnections: Map<string, WebSocket> = new Map()

  // Organization Management
  async getUserOrganizations(): Promise<UserOrganizationContext[]> {
    try {
      const organizations = await organizationMembershipAPI.getUserOrganizations()
      
      // Enhance với stats và permissions
      const enhancedOrgs = await Promise.all(
        organizations.map(async (org) => {
          const [stats, permissions] = await Promise.all([
            this.getOrganizationStats(org.id).catch(() => null),
            this.getUserPermissions(org.id).catch(() => [])
          ])
          
          return {
            ...org,
            stats,
            userPermissions: permissions,
            userRoleLevel: org.userRole === 'owner' ? 0 : org.userRole === 'admin' ? 1 : 3,
            isAdmin: this.checkIsAdmin(org.userRole, permissions),
          } as UserOrganizationContext
        })
      )
      
      return enhancedOrgs
    } catch (error) {
      console.error('Error loading user organizations:', error)
      // Throw error để component có thể handle fallback
      throw new Error('Backend API not available')
    }
  }

  async createOrganization(data: { name: string; description?: string }): Promise<UserOrganizationContext> {
    try {
      const organization = await organizationMembershipAPI.createOrganization(data)
      
      // Tạo default chat group và channel
      await this.createDefaultChatStructure(organization.id)
      
      // Reload để lấy thông tin đầy đủ
      const userOrgs = await this.getUserOrganizations()
      const newOrg = userOrgs.find(org => org.id === organization.id)
      
      if (!newOrg) {
        throw new Error('Failed to load created organization')
      }
      
      return newOrg
    } catch (error) {
      console.error('Error creating organization:', error)
      throw error
    }
  }

  async updateOrganization(organizationId: string, data: { name: string; description?: string }): Promise<void> {
    try {
      await organizationMembershipAPI.updateOrganization(organizationId, data)
    } catch (error) {
      console.error('Error updating organization:', error)
      throw error
    }
  }

  async deleteOrganization(organizationId: string): Promise<void> {
    try {
      await organizationMembershipAPI.deleteOrganization(organizationId)
    } catch (error) {
      console.error('Error deleting organization:', error)
      throw error
    }
  }

  async selectOrganization(organizationId: string): Promise<UserOrganizationContext> {
    try {
      this.currentOrganizationId = organizationId
      
      // Get organization details from backend
      const response = await organizationMembershipAPI.getOrganizationDetails(organizationId)
      
      this.currentUserPermissions = response.userPermissions || []
      
      // Convert to UserOrganizationContext
      return {
        ...response,
        userRoleLevel: response.userRole === 'owner' ? 0 : response.userRole === 'admin' ? 1 : 3,
        isAdmin: response.isOwner || response.userRole === 'admin'
      } as UserOrganizationContext
      
    } catch (error) {
      console.error('Error selecting organization:', error)
      throw error
    }
  }

  // Chat Management
  async getChatGroups(organizationId: string): Promise<ChatGroup[]> {
    try {
      return await chatAPI.getGroups(organizationId)
    } catch (error) {
      console.error('Error loading chat groups:', error)
      return []
    }
  }

  async getChatChannels(organizationId: string, groupId: string): Promise<ChatChannel[]> {
    try {
      return await chatAPI.getChannels(organizationId, groupId)
    } catch (error) {
      console.error('Error loading chat channels:', error)
      return []
    }
  }

  async getChannelMessages(organizationId: string, channelId: string, page: number = 0): Promise<{
    messages: ChatMessage[]
    hasMore: boolean
  }> {
    try {
      const result = await chatAPI.getMessages(organizationId, channelId, page, 50)
      return {
        messages: result.messages,
        hasMore: result.hasNext
      }
    } catch (error) {
      console.error('Error loading messages:', error)
      return { messages: [], hasMore: false }
    }
  }

  async sendMessage(organizationId: string, channelId: string, content: string, type: 'text' | 'file' = 'text'): Promise<ChatMessage> {
    try {
      return await chatAPI.sendMessage(organizationId, channelId, {
        content,
        type
      })
    } catch (error) {
      console.error('Error sending message:', error)
      throw error
    }
  }

  async uploadAndSendFile(organizationId: string, channelId: string, file: File): Promise<ChatMessage> {
    try {
      // Upload file first
      const uploadResult = await chatAPI.uploadChatFile(organizationId, channelId, file)
      
      // Send message with file info
      return await chatAPI.sendMessage(organizationId, channelId, {
        content: `Đã gửi file: ${uploadResult.fileName}`,
        type: 'file',
        fileUrl: uploadResult.fileUrl,
        fileName: uploadResult.fileName,
        fileSize: uploadResult.fileSize
      })
    } catch (error) {
      console.error('Error uploading and sending file:', error)
      throw error
    }
  }

  // Member Management
  async getOrganizationMembers(organizationId: string): Promise<OrganizationMemberDetailed[]> {
    try {
      return await organizationMembershipAPI.getOrganizationMembers(organizationId)
    } catch (error) {
      console.error('Error loading organization members:', error)
      return []
    }
  }

  async inviteMember(organizationId: string, emailOrUsername: string, roleIds: string[] = []): Promise<void> {
    try {
      const isEmail = emailOrUsername.includes('@')
      
      if (isEmail) {
        await organizationMembershipAPI.inviteMemberByEmail(organizationId, {
          email: emailOrUsername,
          roleIds
        })
      } else {
        await organizationMembershipAPI.inviteMemberByUsername(organizationId, {
          username: emailOrUsername,
          roleIds
        })
      }
    } catch (error) {
      console.error('Error inviting member:', error)
      throw error
    }
  }

  async updateMemberRoles(organizationId: string, memberId: string, roleIds: string[]): Promise<void> {
    try {
      await organizationMembershipAPI.updateMemberRoles(organizationId, memberId, {
        roleIds,
        action: 'replace'
      })
    } catch (error) {
      console.error('Error updating member roles:', error)
      throw error
    }
  }

  async removeMember(organizationId: string, memberId: string): Promise<void> {
    try {
      await organizationMembershipAPI.removeMember(organizationId, memberId)
    } catch (error) {
      console.error('Error removing member:', error)
      throw error
    }
  }

  // Permission Management
  async checkPermission(organizationId: string, permissionCode: string): Promise<boolean> {
    try {
      if (this.currentOrganizationId === organizationId && this.currentUserPermissions.length > 0) {
        return this.currentUserPermissions.includes(permissionCode)
      }
      
      return await organizationMembershipAPI.checkUserPermission(organizationId, permissionCode)
    } catch (error) {
      console.error('Error checking permission:', error)
      return false
    }
  }

  async getUserPermissions(organizationId: string): Promise<string[]> {
    try {
      return await organizationMembershipAPI.getUserPermissions(organizationId)
    } catch (error) {
      console.error('Error getting user permissions:', error)
      return []
    }
  }

  // Real-time Chat
  connectToChannel(organizationId: string, channelId: string, onMessage: (message: ChatMessage) => void): void {
    try {
      const wsKey = `${organizationId}-${channelId}`
      
      // Disconnect existing connection
      this.disconnectFromChannel(organizationId, channelId)
      
      const wsUrl = chatAPI.getWebSocketUrl(organizationId, channelId)
      const ws = new WebSocket(wsUrl)
      
      ws.onopen = () => {
        console.log(`Connected to channel ${channelId}`)
      }
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === 'message' && data.message) {
            onMessage(data.message)
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }
      
      ws.onclose = () => {
        console.log(`Disconnected from channel ${channelId}`)
        this.wsConnections.delete(wsKey)
      }
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
      }
      
      this.wsConnections.set(wsKey, ws)
    } catch (error) {
      console.error('Error connecting to channel:', error)
    }
  }

  disconnectFromChannel(organizationId: string, channelId: string): void {
    const wsKey = `${organizationId}-${channelId}`
    const ws = this.wsConnections.get(wsKey)
    
    if (ws) {
      ws.close()
      this.wsConnections.delete(wsKey)
    }
  }

  disconnectAll(): void {
    this.wsConnections.forEach((ws) => {
      ws.close()
    })
    this.wsConnections.clear()
  }

  // Helper Methods
  private async createDefaultChatStructure(organizationId: string): Promise<void> {
    try {
      // Tạo default group
      const defaultGroup = await chatAPI.createGroup(organizationId, {
        name: 'Chung',
        description: 'Nhóm chat chung của tổ chức',
        isPrivate: false
      })
      
      // Tạo default channels
      await Promise.all([
        chatAPI.createChannel(organizationId, {
          name: 'general',
          description: 'Kênh thảo luận chung',
          groupId: defaultGroup.id,
          type: 'general'
        }),
        chatAPI.createChannel(organizationId, {
          name: 'announcements',
          description: 'Kênh thông báo chính thức',
          groupId: defaultGroup.id,
          type: 'announcement'
        })
      ])
    } catch (error) {
      console.error('Error creating default chat structure:', error)
      // Không throw error vì đây không phải critical
    }
  }

  private checkIsAdmin(userRole: string, permissions: string[]): boolean {
    return userRole === 'admin' || 
           userRole === 'owner' || 
           permissions.includes('ADMIN_ALL') ||
           permissions.includes('MANAGE_ORGANIZATION')
  }

  private async getOrganizationStats(organizationId: string) {
    try {
      return await organizationMembershipAPI.getOrganizationStats(organizationId)
    } catch (error) {
      return null
    }
  }

  // Getters
  get currentOrganization(): string | null {
    return this.currentOrganizationId
  }

  get currentPermissions(): string[] {
    return this.currentUserPermissions
  }
}

// Export singleton instance
export const organizationService = new OrganizationService()
export default organizationService
