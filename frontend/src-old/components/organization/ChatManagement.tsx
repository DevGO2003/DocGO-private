'use client'

import { useState, useEffect, useRef } from 'react'
import { organizationAPI } from '@/lib/apis/organization-api'
import { Organization } from '@/types/organization'
import { toast } from 'react-hot-toast'
import { 
  PaperAirplaneIcon,
  PaperClipIcon,
  PhotoIcon,
  DocumentIcon,
  VideoCameraIcon,
  MicrophoneIcon,
  XMarkIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  PlusIcon
} from '@heroicons/react/24/outline'

interface ChatManagementProps {
  organizationId: string | null
  onOrganizationSelect: (organizationId: string | null) => void
}

interface ChatMessage {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  type: 'text' | 'file' | 'image' | 'video' | 'audio'
  fileUrl?: string
  fileName?: string
  fileSize?: number
  timestamp: string
  isEdited?: boolean
  replyTo?: string
}

interface ChatGroup {
  id: string
  name: string
  description?: string
  channels: ChatChannel[]
  organizationId: string
}

interface ChatChannel {
  id: string
  name: string
  type: 'general' | 'project' | 'private'
  description?: string
  memberCount: number
  lastMessage?: ChatMessage
  groupId: string
  organizationId: string
  isJoined: boolean
  createdBy: string
  createdAt: string
}

export default function ChatManagement({ organizationId, onOrganizationSelect }: ChatManagementProps) {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [groups, setGroups] = useState<ChatGroup[]>([])
  const [channels, setChannels] = useState<ChatChannel[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [pinnedMessages, setPinnedMessages] = useState<ChatMessage[]>([])
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null)
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [showFileUpload, setShowFileUpload] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [showPinnedMessages, setShowPinnedMessages] = useState(false)
  const [showCreateChannel, setShowCreateChannel] = useState(false)
  const [newChannelName, setNewChannelName] = useState('')
  const [newChannelDescription, setNewChannelDescription] = useState('')
  const [newChannelType, setNewChannelType] = useState<'general' | 'project' | 'private'>('project')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadOrganizations()
  }, [])

  useEffect(() => {
    if (organizationId) {
      loadGroups(organizationId)
    } else {
      setGroups([])
      setChannels([])
      setMessages([])
      setPinnedMessages([])
      setSelectedChannel(null)
      setSelectedGroup(null)
    }
  }, [organizationId])

  useEffect(() => {
    if (selectedChannel) {
      loadMessages(selectedChannel)
      loadPinnedMessages(selectedChannel)
    } else {
      setMessages([])
      setPinnedMessages([])
    }
  }, [selectedChannel])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadOrganizations = async () => {
    try {
      // Mock data tạm thời
      const mockOrganizations: Organization[] = [
        {
          id: 'org1',
          name: 'Công ty ABC',
          description: 'Công ty công nghệ hàng đầu Việt Nam',
          ownerUserId: 'user1',
          status: 'ACTIVE',
          memberCount: 25,
          createdAt: '2024-01-15T08:00:00Z',
          updatedAt: '2024-01-15T08:00:00Z'
        },
        {
          id: 'org2',
          name: 'Tập đoàn XYZ',
          description: 'Tập đoàn đa ngành với nhiều lĩnh vực hoạt động',
          ownerUserId: 'user2',
          status: 'ACTIVE',
          memberCount: 150,
          createdAt: '2024-02-20T10:30:00Z',
          updatedAt: '2024-02-20T10:30:00Z'
        },
        {
          id: 'org3',
          name: 'Startup Tech',
          description: 'Công ty khởi nghiệp công nghệ',
          ownerUserId: 'user3',
          status: 'ACTIVE',
          memberCount: 8,
          createdAt: '2024-03-10T14:15:00Z',
          updatedAt: '2024-03-10T14:15:00Z'
        },
        {
          id: 'org4',
          name: 'Công ty Mới',
          description: 'Công ty mới chưa có kênh chat',
          ownerUserId: 'user4',
          status: 'ACTIVE',
          memberCount: 3,
          createdAt: '2024-04-01T09:00:00Z',
          updatedAt: '2024-04-01T09:00:00Z'
        }
      ]
      
      setOrganizations(mockOrganizations)
    } catch (error) {
      console.error('Error loading organizations:', error)
    }
  }

  const loadGroups = async (orgId: string) => {
    try {
      // Mock data tạm thời cho groups và channels
      // Mock data cho từng tổ chức riêng biệt
      const mockGroupsByOrg: { [key: string]: ChatGroup[] } = {
        'org1': [
          {
            id: 'group1',
            name: 'Nhóm Phát triển',
            description: 'Nhóm phát triển sản phẩm',
            organizationId: 'org1',
            channels: [
              {
                id: 'channel1',
                name: 'frontend',
                type: 'project',
                description: 'Thảo luận về frontend và UI/UX',
                memberCount: 5,
                groupId: 'group1',
                organizationId: 'org1',
                isJoined: true,
                createdBy: 'user1',
                createdAt: '2024-01-10T08:00:00Z',
                lastMessage: {
                  id: 'msg1',
                  userId: 'user1',
                  userName: 'Frontend Dev',
                  content: 'Component mới đã hoàn thành',
                  type: 'text',
                  timestamp: '2024-01-15T10:30:00Z'
                }
              },
              {
                id: 'channel2',
                name: 'backend',
                type: 'project',
                description: 'Thảo luận về backend và API',
                memberCount: 4,
                groupId: 'group1',
                organizationId: 'org1',
                isJoined: false,
                createdBy: 'user2',
                createdAt: '2024-01-11T09:00:00Z',
                lastMessage: {
                  id: 'msg2',
                  userId: 'user2',
                  userName: 'Backend Dev',
                  content: 'API mới đã được deploy',
                  type: 'text',
                  timestamp: '2024-01-15T09:15:00Z'
                }
              }
            ]
          }
        ],
        'org2': [
          {
            id: 'group2',
            name: 'Nhóm Marketing',
            description: 'Nhóm marketing và truyền thông',
            organizationId: 'org2',
            channels: [
              {
                id: 'channel3',
                name: 'social-media',
                type: 'project',
                description: 'Quản lý mạng xã hội và content',
                memberCount: 3,
                groupId: 'group2',
                organizationId: 'org2',
                isJoined: true,
                createdBy: 'user3',
                createdAt: '2024-01-12T10:00:00Z',
                lastMessage: {
                  id: 'msg3',
                  userId: 'user3',
                  userName: 'Social Media Manager',
                  content: 'Post Facebook đã được đăng',
                  type: 'text',
                  timestamp: '2024-01-15T11:00:00Z'
                }
              },
              {
                id: 'channel4',
                name: 'campaigns',
                type: 'project',
                description: 'Lập kế hoạch và thực hiện chiến dịch',
                memberCount: 4,
                groupId: 'group2',
                organizationId: 'org2',
                isJoined: false,
                createdBy: 'user4',
                createdAt: '2024-01-13T11:00:00Z',
                lastMessage: {
                  id: 'msg4',
                  userId: 'user4',
                  userName: 'Campaign Manager',
                  content: 'Chiến dịch mới sắp ra mắt',
                  type: 'text',
                  timestamp: '2024-01-15T10:15:00Z'
                }
              }
            ]
          }
        ],
        'org3': [
          {
            id: 'group3',
            name: 'Nhóm Hỗ trợ',
            description: 'Nhóm hỗ trợ khách hàng',
            organizationId: 'org3',
            channels: [
              {
                id: 'channel5',
                name: 'customer-support',
                type: 'project',
                description: 'Hỗ trợ khách hàng trực tiếp',
                memberCount: 4,
                groupId: 'group3',
                organizationId: 'org3',
                isJoined: true,
                createdBy: 'user5',
                createdAt: '2024-01-14T12:00:00Z',
                lastMessage: {
                  id: 'msg5',
                  userId: 'user5',
                  userName: 'Support Agent',
                  content: 'Ticket mới cần xử lý',
                  type: 'text',
                  timestamp: '2024-01-15T09:30:00Z'
                }
              }
            ]
          }
        ],
        'org4': [ // Tổ chức không có kênh nào
          {
            id: 'group4',
            name: 'Nhóm Mới',
            description: 'Nhóm mới chưa có kênh',
            organizationId: 'org4',
            channels: []
          }
        ]
      }

      const mockGroups = mockGroupsByOrg[orgId] || []
      
      setGroups(mockGroups)
      // Flatten all channels for easy access
      const allChannels = mockGroups.flatMap(group => group.channels)
      setChannels(allChannels)
      
      if (allChannels.length > 0) {
        setSelectedChannel(allChannels[0].id)
        setSelectedGroup(allChannels[0].groupId)
      }
    } catch (error) {
      console.error('Error loading groups:', error)
    }
  }

  const loadMessages = async (channelId: string) => {
    try {
      // Mock data khác nhau cho từng kênh
      const mockMessagesByChannel: { [key: string]: ChatMessage[] } = {
        'channel1': [ // frontend
          {
            id: 'msg1',
            userId: 'user1',
            userName: 'Frontend Dev',
            userAvatar: 'FD',
            content: 'Component mới đã hoàn thành! Các bạn review giúp nhé.',
            type: 'text',
            timestamp: '2024-01-15T10:30:00Z'
          },
          {
            id: 'msg2',
            userId: 'user2',
            userName: 'UI/UX Designer',
            userAvatar: 'UX',
            content: 'Tuyệt vời! Design system đã được cập nhật.',
            type: 'text',
            timestamp: '2024-01-15T10:32:00Z'
          },
          {
            id: 'msg3',
            userId: 'user3',
            userName: 'Frontend Dev',
            userAvatar: 'FD',
            content: 'Tài liệu component mới',
            type: 'file',
            fileName: 'component-docs.pdf',
            fileSize: 1024000,
            timestamp: '2024-01-15T10:35:00Z'
          }
        ],
        'channel2': [ // backend
          {
            id: 'msg4',
            userId: 'user4',
            userName: 'Backend Dev',
            userAvatar: 'BD',
            content: 'API mới đã được deploy thành công!',
            type: 'text',
            timestamp: '2024-01-15T11:00:00Z'
          },
          {
            id: 'msg5',
            userId: 'user5',
            userName: 'DevOps Engineer',
            userAvatar: 'DO',
            content: 'Database migration hoàn thành',
            type: 'text',
            timestamp: '2024-01-15T11:15:00Z'
          },
          {
            id: 'msg6',
            userId: 'user4',
            userName: 'Backend Dev',
            userAvatar: 'BD',
            content: 'Tài liệu API mới',
            type: 'file',
            fileName: 'api-docs-v2.pdf',
            fileSize: 2048000,
            timestamp: '2024-01-15T11:30:00Z'
          }
        ],
        'channel3': [ // social-media
          {
            id: 'msg7',
            userId: 'user6',
            userName: 'Social Media Manager',
            userAvatar: 'SM',
            content: 'Post Facebook đã được đăng thành công!',
            type: 'text',
            timestamp: '2024-01-15T12:00:00Z'
          },
          {
            id: 'msg8',
            userId: 'user7',
            userName: 'Content Creator',
            userAvatar: 'CC',
            content: 'Video TikTok mới đã upload',
            type: 'text',
            timestamp: '2024-01-15T12:15:00Z'
          }
        ],
        'channel4': [ // campaigns
          {
            id: 'msg9',
            userId: 'user8',
            userName: 'Campaign Manager',
            userAvatar: 'CM',
            content: 'Chiến dịch mới sắp ra mắt tuần tới!',
            type: 'text',
            timestamp: '2024-01-15T13:00:00Z'
          },
          {
            id: 'msg10',
            userId: 'user9',
            userName: 'Marketing Analyst',
            userAvatar: 'MA',
            content: 'Báo cáo hiệu quả chiến dịch',
            type: 'file',
            fileName: 'campaign-report.pdf',
            fileSize: 1536000,
            timestamp: '2024-01-15T13:30:00Z'
          }
        ],
        'channel5': [ // customer-support
          {
            id: 'msg11',
            userId: 'user10',
            userName: 'Support Agent',
            userAvatar: 'SA',
            content: 'Ticket mới cần xử lý khẩn cấp!',
            type: 'text',
            timestamp: '2024-01-15T14:00:00Z'
          },
          {
            id: 'msg12',
            userId: 'user11',
            userName: 'Technical Support',
            userAvatar: 'TS',
            content: 'Đã giải quyết vấn đề cho khách hàng',
            type: 'text',
            timestamp: '2024-01-15T14:30:00Z'
          }
        ]
      }
      
      const mockMessages = mockMessagesByChannel[channelId] || []
      setMessages(mockMessages)
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const loadPinnedMessages = async (channelId: string) => {
    try {
      // Mock data khác nhau cho pinned messages của từng kênh
      const mockPinnedMessagesByChannel: { [key: string]: ChatMessage[] } = {
        'channel1': [ // frontend
          {
            id: 'pinned1',
            userId: 'user1',
            userName: 'Frontend Lead',
            userAvatar: 'FL',
            content: '📌 QUAN TRỌNG: Quy tắc coding style cho React - Vui lòng tuân thủ!',
            type: 'text',
            timestamp: '2024-01-14T09:00:00Z'
          },
          {
            id: 'pinned2',
            userId: 'user1',
            userName: 'Frontend Lead',
            userAvatar: 'FL',
            content: '📌 Tài liệu component library',
            type: 'file',
            fileName: 'component-guide.pdf',
            fileSize: 1536000,
            timestamp: '2024-01-13T14:30:00Z'
          }
        ],
        'channel2': [ // backend
          {
            id: 'pinned3',
            userId: 'user4',
            userName: 'Backend Lead',
            userAvatar: 'BL',
            content: '📌 QUAN TRỌNG: Quy tắc API design và documentation',
            type: 'text',
            timestamp: '2024-01-14T10:00:00Z'
          }
        ],
        'channel3': [ // social-media
          {
            id: 'pinned4',
            userId: 'user6',
            userName: 'Social Media Lead',
            userAvatar: 'SML',
            content: '📌 QUAN TRỌNG: Brand guidelines cho social media',
            type: 'text',
            timestamp: '2024-01-14T11:00:00Z'
          }
        ],
        'channel4': [ // campaigns
          {
            id: 'pinned5',
            userId: 'user8',
            userName: 'Campaign Lead',
            userAvatar: 'CL',
            content: '📌 QUAN TRỌNG: Timeline chiến dịch Q1 2024',
            type: 'file',
            fileName: 'campaign-timeline.pdf',
            fileSize: 1024000,
            timestamp: '2024-01-14T12:00:00Z'
          }
        ],
        'channel5': [ // customer-support
          {
            id: 'pinned6',
            userId: 'user10',
            userName: 'Support Lead',
            userAvatar: 'SL',
            content: '📌 QUAN TRỌNG: Quy trình xử lý ticket khẩn cấp',
            type: 'text',
            timestamp: '2024-01-14T13:00:00Z'
          }
        ]
      }
      
      const mockPinnedMessages = mockPinnedMessagesByChannel[channelId] || []
      setPinnedMessages(mockPinnedMessages)
    } catch (error) {
      console.error('Error loading pinned messages:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChannel) return

    try {
      const message: ChatMessage = {
        id: `msg_${Date.now()}`,
        userId: 'current_user',
        userName: 'Bạn',
        userAvatar: 'B',
        content: newMessage,
        type: 'text',
        timestamp: new Date().toISOString()
      }

      setMessages(prev => [...prev, message])
      setNewMessage('')
      
      // Mock: Simulate typing indicator
      setIsTyping(true)
      setTimeout(() => {
        setIsTyping(false)
        // Mock: Add auto-reply
        const autoReply: ChatMessage = {
          id: `msg_${Date.now() + 1}`,
          userId: 'bot',
          userName: 'Bot',
          userAvatar: '🤖',
          content: 'Tin nhắn đã được gửi thành công!',
          type: 'text',
          timestamp: new Date().toISOString()
        }
        setMessages(prev => [...prev, autoReply])
      }, 2000)

      toast.success('Tin nhắn đã được gửi')
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Không thể gửi tin nhắn')
    }
  }

  const handleFileUpload = async (file: File) => {
    if (!selectedChannel) return

    try {
      setUploadingFile(true)
      
      // Mock: Simulate file upload
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const message: ChatMessage = {
        id: `msg_${Date.now()}`,
        userId: 'current_user',
        userName: 'Bạn',
        userAvatar: 'B',
        content: `Đã gửi file: ${file.name}`,
        type: getFileType(file.type),
        fileName: file.name,
        fileSize: file.size,
        timestamp: new Date().toISOString()
      }

      setMessages(prev => [...prev, message])
      setSelectedFile(null)
      setShowFileUpload(false)
      
      toast.success('File đã được gửi thành công')
    } catch (error) {
      console.error('Error uploading file:', error)
      toast.error('Không thể gửi file')
    } finally {
      setUploadingFile(false)
    }
  }

  const getFileType = (mimeType: string): 'file' | 'image' | 'video' | 'audio' => {
    if (mimeType.startsWith('image/')) return 'image'
    if (mimeType.startsWith('video/')) return 'video'
    if (mimeType.startsWith('audio/')) return 'audio'
    return 'file'
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    if (diff < 60000) return 'Vừa xong'
    if (diff < 3600000) return `${Math.floor(diff / 60000)} phút trước`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} giờ trước`
    return date.toLocaleDateString('vi-VN')
  }

  const handlePinMessage = async (messageId: string) => {
    try {
      const message = messages.find(msg => msg.id === messageId)
      if (!message) return

      // Mock: Add to pinned messages
      setPinnedMessages(prev => [...prev, message])
      toast.success('Tin nhắn đã được ghim')
    } catch (error) {
      console.error('Error pinning message:', error)
      toast.error('Không thể ghim tin nhắn')
    }
  }

  const handleUnpinMessage = async (messageId: string) => {
    try {
      // Mock: Remove from pinned messages
      setPinnedMessages(prev => prev.filter(msg => msg.id !== messageId))
      toast.success('Đã bỏ ghim tin nhắn')
    } catch (error) {
      console.error('Error unpinning message:', error)
      toast.error('Không thể bỏ ghim tin nhắn')
    }
  }

  const handleCreateChannel = async () => {
    if (!newChannelName.trim() || !organizationId || !selectedGroup) return

    // Kiểm tra tổ chức có kênh nào chưa
    const hasAnyChannels = groups.some(group => group.channels.length > 0)
    if (!hasAnyChannels) {
      toast.error('Tổ chức chưa có kênh nào. Vui lòng liên hệ admin để tạo kênh đầu tiên.')
      setShowCreateChannel(false)
      return
    }

    try {
      const newChannel: ChatChannel = {
        id: `channel_${Date.now()}`,
        name: newChannelName,
        type: newChannelType,
        description: newChannelDescription,
        memberCount: 1,
        groupId: selectedGroup,
        organizationId: organizationId,
        isJoined: true,
        createdBy: 'current_user',
        createdAt: new Date().toISOString()
      }

      // Mock: Add to groups
      setGroups(prev => prev.map(group => 
        group.id === selectedGroup 
          ? { ...group, channels: [...group.channels, newChannel] }
          : group
      ))

      // Mock: Add to channels list
      setChannels(prev => [...prev, newChannel])

      // Reset form
      setNewChannelName('')
      setNewChannelDescription('')
      setNewChannelType('project')
      setShowCreateChannel(false)

      toast.success('Kênh mới đã được tạo')
    } catch (error) {
      console.error('Error creating channel:', error)
      toast.error('Không thể tạo kênh mới')
    }
  }

  const handleJoinChannel = async (channelId: string) => {
    try {
      // Mock: Update channel joined status
      setGroups(prev => prev.map(group => ({
        ...group,
        channels: group.channels.map(channel =>
          channel.id === channelId
            ? { ...channel, isJoined: true, memberCount: channel.memberCount + 1 }
            : channel
        )
      })))

      setChannels(prev => prev.map(channel =>
        channel.id === channelId
          ? { ...channel, isJoined: true, memberCount: channel.memberCount + 1 }
          : channel
      ))

      toast.success('Đã tham gia kênh')
    } catch (error) {
      console.error('Error joining channel:', error)
      toast.error('Không thể tham gia kênh')
    }
  }

  const handleLeaveChannel = async (channelId: string) => {
    try {
      // Mock: Update channel joined status
      setGroups(prev => prev.map(group => ({
        ...group,
        channels: group.channels.map(channel =>
          channel.id === channelId
            ? { ...channel, isJoined: false, memberCount: Math.max(0, channel.memberCount - 1) }
            : channel
        )
      })))

      setChannels(prev => prev.map(channel =>
        channel.id === channelId
          ? { ...channel, isJoined: false, memberCount: Math.max(0, channel.memberCount - 1) }
          : channel
      ))

      // If leaving current channel, clear messages
      if (selectedChannel === channelId) {
        setSelectedChannel(null)
        setMessages([])
        setPinnedMessages([])
      }

      toast.success('Đã rời khỏi kênh')
    } catch (error) {
      console.error('Error leaving channel:', error)
      toast.error('Không thể rời khỏi kênh')
    }
  }

  const selectedOrganization = organizations.find(org => org.id === organizationId)
  const currentChannel = channels.find(channel => channel.id === selectedChannel)

  if (!organizationId) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Chọn tổ chức</h3>
          <p className="mt-1 text-sm text-gray-500">
            Vui lòng chọn một tổ chức từ tab "Tổng quan" để bắt đầu trò chuyện.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[600px] flex">
      {/* Sidebar - Channels */}
      <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Trò chuyện</h2>
          <p className="text-sm text-gray-600">
            {selectedOrganization?.name} • {channels.length} kênh
          </p>
        </div>

        {/* Groups and Channels List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            {groups.length === 0 || !groups.some(g => g.channels.length > 0) ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">
                  <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">Chưa có kênh trò chuyện</h3>
                <p className="text-xs text-gray-500">
                  Tổ chức này chưa có kênh trò chuyện nào.<br />
                  Vui lòng liên hệ admin để tạo kênh đầu tiên.
                </p>
              </div>
            ) : (
              groups.map((group) => (
              <div key={group.id} className="mb-4">
                {/* Group Header */}
                <div className="flex items-center justify-between px-2 py-1">
                  <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    {group.name}
                  </h4>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">{group.channels.length}</span>
                    {groups.some(g => g.channels.length > 0) && (
                      <button
                        onClick={() => {
                          setSelectedGroup(group.id)
                          setShowCreateChannel(true)
                        }}
                        className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                        title="Tạo kênh mới"
                      >
                        <PlusIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Channels in Group */}
                <div className="space-y-1">
                  {group.channels.map((channel) => (
                    <div
                      key={channel.id}
                      className={`p-2 rounded-lg transition-colors ${
                        selectedChannel === channel.id
                          ? 'bg-primary-100 border border-primary-200'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div 
                          className="flex items-center space-x-2 flex-1 cursor-pointer"
                          onClick={() => {
                            if (channel.isJoined) {
                              setSelectedChannel(channel.id)
                              setSelectedGroup(channel.groupId)
                            }
                          }}
                        >
                          <span className="text-gray-400 font-bold">#</span>
                          <span className={`font-medium ${
                            channel.isJoined ? 'text-gray-900' : 'text-gray-500'
                          }`}>
                            {channel.name}
                          </span>
                          {!channel.isJoined && (
                            <span className="text-xs text-gray-400">(chưa tham gia)</span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">{channel.memberCount}</span>
                          {channel.isJoined ? (
                            <button
                              onClick={() => handleLeaveChannel(channel.id)}
                              className="text-xs text-red-600 hover:text-red-800 px-2 py-1 rounded"
                              title="Rời khỏi kênh"
                            >
                              Rời
                            </button>
                          ) : (
                            <button
                              onClick={() => handleJoinChannel(channel.id)}
                              className="text-xs text-primary-600 hover:text-primary-800 px-2 py-1 rounded"
                              title="Tham gia kênh"
                            >
                              Tham gia
                            </button>
                          )}
                        </div>
                      </div>
                      {channel.lastMessage && channel.isJoined && (
                        <p className="text-xs text-gray-600 mt-1 truncate ml-6">
                          {channel.lastMessage.userName}: {channel.lastMessage.content}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                #{currentChannel?.name}
              </h3>
              <p className="text-sm text-gray-600">
                {currentChannel?.description} • {currentChannel?.memberCount} thành viên
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowPinnedMessages(!showPinnedMessages)}
                className={`p-2 rounded-lg transition-colors ${
                  showPinnedMessages 
                    ? 'bg-primary-100 text-primary-600' 
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
                title="Tin nhắn đã ghim"
              >
                <MapPinIcon className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                <UserGroupIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Pinned Messages */}
        {showPinnedMessages && pinnedMessages.length > 0 && (
          <div className="p-4 border-b border-gray-200 bg-yellow-50">
            <div className="flex items-center space-x-2 mb-3">
              <MapPinIcon className="h-4 w-4 text-yellow-600" />
              <h4 className="text-sm font-semibold text-yellow-800">Tin nhắn đã ghim</h4>
            </div>
            <div className="space-y-3">
              {pinnedMessages.map((message) => (
                <div key={message.id} className="flex space-x-3 p-3 bg-white rounded-lg border border-yellow-200">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                      {message.userAvatar}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">{message.userName}</span>
                        <span className="text-xs text-gray-500">{formatTimestamp(message.timestamp)}</span>
                      </div>
                      <button
                        onClick={() => handleUnpinMessage(message.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                        title="Bỏ ghim"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-1">
                      {message.type === 'text' ? (
                        <p className="text-sm text-gray-800">{message.content}</p>
                      ) : (
                        <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                          {message.type === 'image' && <PhotoIcon className="h-4 w-4 text-blue-500" />}
                          {message.type === 'file' && <DocumentIcon className="h-4 w-4 text-gray-500" />}
                          {message.type === 'video' && <VideoCameraIcon className="h-4 w-4 text-red-500" />}
                          {message.type === 'audio' && <MicrophoneIcon className="h-4 w-4 text-green-500" />}
                          <div>
                            <p className="text-xs font-medium text-gray-900">{message.fileName}</p>
                            {message.fileSize && (
                              <p className="text-xs text-gray-500">{formatFileSize(message.fileSize)}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="flex space-x-3 group hover:bg-gray-50 p-2 rounded-lg transition-colors">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {message.userAvatar}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">{message.userName}</span>
                    <span className="text-xs text-gray-500">{formatTimestamp(message.timestamp)}</span>
                  </div>
                  <button
                    onClick={() => handlePinMessage(message.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-yellow-600 transition-all"
                    title="Ghim tin nhắn"
                  >
                    <MapPinIcon className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-1">
                  {message.type === 'text' ? (
                    <p className="text-gray-800">{message.content}</p>
                  ) : (
                    <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                      {message.type === 'image' && <PhotoIcon className="h-5 w-5 text-blue-500" />}
                      {message.type === 'file' && <DocumentIcon className="h-5 w-5 text-gray-500" />}
                      {message.type === 'video' && <VideoCameraIcon className="h-5 w-5 text-red-500" />}
                      {message.type === 'audio' && <MicrophoneIcon className="h-5 w-5 text-green-500" />}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{message.fileName}</p>
                        {message.fileSize && (
                          <p className="text-xs text-gray-500">{formatFileSize(message.fileSize)}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white text-sm">
                  🤖
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">Bot</span>
                  <span className="text-xs text-gray-500">đang nhập...</span>
                </div>
                <div className="mt-1 flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-200 bg-white">
          {showFileUpload && selectedFile && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <PaperClipIcon className="h-5 w-5 text-gray-500" />
                <span className="text-sm text-gray-900">{selectedFile.name}</span>
                <span className="text-xs text-gray-500">({formatFileSize(selectedFile.size)})</span>
              </div>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFileUpload(!showFileUpload)}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <PaperClipIcon className="h-5 w-5" />
            </button>
            
            <div className="flex-1">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Nhập tin nhắn..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </button>
          </div>
          
          {showFileUpload && (
            <div className="mt-2">
              <input
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    setSelectedFile(file)
                    handleFileUpload(file)
                  }
                }}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
              >
                <PaperClipIcon className="h-4 w-4 mr-2" />
                Chọn file
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Create Channel Modal */}
      {showCreateChannel && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowCreateChannel(false)} />

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Tạo kênh mới
                  </h3>
                  <button
                    onClick={() => setShowCreateChannel(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên kênh
                    </label>
                    <input
                      type="text"
                      value={newChannelName}
                      onChange={(e) => setNewChannelName(e.target.value)}
                      placeholder="Nhập tên kênh..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mô tả (tùy chọn)
                    </label>
                    <textarea
                      value={newChannelDescription}
                      onChange={(e) => setNewChannelDescription(e.target.value)}
                      placeholder="Mô tả về kênh..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Loại kênh
                    </label>
                    <select
                      value={newChannelType}
                      onChange={(e) => setNewChannelType(e.target.value as 'general' | 'project' | 'private')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="project">Dự án</option>
                      <option value="general">Chung</option>
                      <option value="private">Riêng tư</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={handleCreateChannel}
                  disabled={!newChannelName.trim()}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Tạo kênh
                </button>
                <button
                  onClick={() => setShowCreateChannel(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

