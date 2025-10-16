'use client'

import { useState, useEffect } from 'react'
import { organizationAPI } from '@/lib/apis/organization-api'
import { OrganizationMember, Organization } from '@/types/organization'
import { toast } from 'react-hot-toast'
import { 
  PlusIcon, 
  TrashIcon, 
  UserPlusIcon,
  MagnifyingGlassIcon,
  BuildingOfficeIcon,
  CheckIcon,
  XMarkIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'

interface User {
  id: string
  username: string
  email: string
  firstName?: string
  lastName?: string
  status: string
}

interface OrganizationRole {
  id: string
  organizationId: string
  name: string
  displayName: string
  description: string
  permissionIds: string[]
  level: number
  createdAt: string
}

interface MembersManagementProps {
  organizationId: string | null
  onOrganizationSelect: (organizationId: string | null) => void
}

export default function MembersManagement({ organizationId, onOrganizationSelect }: MembersManagementProps) {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [members, setMembers] = useState<OrganizationMember[]>([])
  const [availableUsers, setAvailableUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [usersLoading, setUsersLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [userSearchTerm, setUserSearchTerm] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [invitingUserId, setInvitingUserId] = useState<string | null>(null)
  const [showAddMemberModal, setShowAddMemberModal] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [isAddingMultiple, setIsAddingMultiple] = useState(false)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [selectedMember, setSelectedMember] = useState<OrganizationMember | null>(null)
  const [availableRoles, setAvailableRoles] = useState<OrganizationRole[]>([])
  const [currentUserRole, setCurrentUserRole] = useState<string>('admin') // Mock: giả sử user hiện tại là admin
  
  // Danh sách cấp độ có sẵn - đơn giản hóa
  const roleLevels = [
    { value: 1, label: 'Cấp 1 - Người xem', description: 'Chỉ xem nội dung' },
    { value: 2, label: 'Cấp 2 - Thành viên', description: 'Thành viên thông thường' },
    { value: 3, label: 'Cấp 3 - Điều hành viên', description: 'Quản lý nội dung và thành viên' },
    { value: 4, label: 'Cấp 4 - Quản trị viên', description: 'Toàn quyền quản lý tổ chức' }
  ]
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loadingMore, setLoadingMore] = useState(false)

  useEffect(() => {
    loadOrganizations()
  }, [])

  useEffect(() => {
    if (organizationId) {
      loadMembers(organizationId)
    } else {
      setMembers([])
      setAvailableUsers([])
    }
  }, [organizationId])

  useEffect(() => {
    if (organizationId && showAddMemberModal) {
      setCurrentPage(1)
      loadAvailableUsers(1, true) // Reset to page 1
    }
  }, [userSearchTerm, showAddMemberModal])

  useEffect(() => {
    if (organizationId && showAddMemberModal) {
      loadAvailableUsers(currentPage, true) // Load specific page
    }
  }, [currentPage])

  useEffect(() => {
    if (organizationId) {
      loadRoles()
    }
  }, [organizationId])


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
        }
      ]
      
      setOrganizations(mockOrganizations)
      
      // TODO: Uncomment when backend API is ready
      /*
      const response = await organizationAPI.getAllOrganizations({
        page: 0,
        size: 100
      })
      
      if (response.data?.data?.content) {
        setOrganizations(response.data.data.content)
      }
      */
    } catch (error) {
      console.error('Error loading organizations:', error)
    }
  }

  const loadRoles = async () => {
    if (!organizationId) return
    
    try {
      // Mock data tạm thời cho roles - đơn giản hóa cấp độ
      const mockRoles: OrganizationRole[] = [
        {
          id: 'role1',
          organizationId: organizationId,
          name: 'admin',
          displayName: 'Quản trị viên',
          description: 'Toàn quyền quản lý tổ chức',
          permissionIds: ['all'],
          level: 4,
          createdAt: '2024-01-15T08:00:00Z'
        },
        {
          id: 'role2',
          organizationId: organizationId,
          name: 'moderator',
          displayName: 'Điều hành viên',
          description: 'Quản lý nội dung và thành viên',
          permissionIds: ['manage_content', 'manage_members'],
          level: 3,
          createdAt: '2024-01-15T08:00:00Z'
        },
        {
          id: 'role3',
          organizationId: organizationId,
          name: 'member',
          displayName: 'Thành viên',
          description: 'Thành viên thông thường',
          permissionIds: ['view_content', 'create_content'],
          level: 2,
          createdAt: '2024-01-15T08:00:00Z'
        },
        {
          id: 'role4',
          organizationId: organizationId,
          name: 'viewer',
          displayName: 'Người xem',
          description: 'Chỉ xem nội dung',
          permissionIds: ['view_only'],
          level: 1,
          createdAt: '2024-01-15T08:00:00Z'
        }
      ]
      
      setAvailableRoles(mockRoles)
      
      // TODO: Uncomment when backend API is ready
      /*
      const response = await organizationAPI.getRoles(organizationId, {
        page: 0,
        size: 100
      })
      
      if (response.data?.data?.content) {
        setAvailableRoles(response.data.data.content)
      }
      */
    } catch (error) {
      console.error('Error loading roles:', error)
    }
  }

  const loadMembers = async (orgId: string) => {
    try {
      setLoading(true)
      
      // Mock data tạm thời cho members
      const mockMembers: OrganizationMember[] = [
        {
          id: 'member1',
          organizationId: orgId,
          userId: 'user1',
          email: 'admin@company.com',
          roleIds: ['admin'],
          status: 'ACTIVE',
          joinedAt: '2024-01-15T08:00:00Z'
        },
        {
          id: 'member2',
          organizationId: orgId,
          userId: 'user2',
          email: 'manager@company.com',
          roleIds: ['moderator'],
          status: 'ACTIVE',
          joinedAt: '2024-01-20T10:30:00Z'
        },
        {
          id: 'member3',
          organizationId: orgId,
          userId: 'user3',
          email: 'employee@company.com',
          roleIds: ['member'],
          status: 'ACTIVE',
          joinedAt: '2024-02-01T14:15:00Z'
        }
      ]
      
      setMembers(mockMembers)
      
      // TODO: Uncomment when backend API is ready
      /*
      const response = await organizationAPI.getMembers(orgId, {
        page: 0,
        size: 100
      })
      
      if (response.data?.data?.content) {
        setMembers(response.data.data.content)
      }
      */
    } catch (error) {
      console.error('Error loading members:', error)
      toast.error('Không thể tải danh sách thành viên')
    } finally {
      setLoading(false)
    }
  }

  const loadAvailableUsers = async (page: number = 1, reset: boolean = false) => {
    if (!organizationId) return
    
    try {
      if (reset) {
      setUsersLoading(true)
      } else {
        setLoadingMore(true)
      }
      
      // Mock data để test frontend - Tạo nhiều user hơn để test pagination
      const allMockUsers: User[] = [
        {
          id: 'user1',
          username: 'john_doe',
          email: 'john@example.com',
          firstName: 'John',
          lastName: 'Doe',
          status: 'ACTIVE'
        },
        {
          id: 'user2',
          username: 'jane_smith',
          email: 'jane@example.com',
          firstName: 'Jane',
          lastName: 'Smith',
          status: 'ACTIVE'
        },
        {
          id: 'user3',
          username: 'bob_wilson',
          email: 'bob@example.com',
          firstName: 'Bob',
          lastName: 'Wilson',
          status: 'ACTIVE'
        },
        {
          id: 'user4',
          username: 'alice_brown',
          email: 'alice@example.com',
          firstName: 'Alice',
          lastName: 'Brown',
          status: 'ACTIVE'
        },
        {
          id: 'user5',
          username: 'charlie_davis',
          email: 'charlie@example.com',
          firstName: 'Charlie',
          lastName: 'Davis',
          status: 'ACTIVE'
        },
        {
          id: 'user6',
          username: 'diana_miller',
          email: 'diana@example.com',
          firstName: 'Diana',
          lastName: 'Miller',
          status: 'ACTIVE'
        },
        {
          id: 'user7',
          username: 'eve_johnson',
          email: 'eve@example.com',
          firstName: 'Eve',
          lastName: 'Johnson',
          status: 'ACTIVE'
        },
        {
          id: 'user8',
          username: 'frank_garcia',
          email: 'frank@example.com',
          firstName: 'Frank',
          lastName: 'Garcia',
          status: 'ACTIVE'
        },
        {
          id: 'user9',
          username: 'grace_lee',
          email: 'grace@example.com',
          firstName: 'Grace',
          lastName: 'Lee',
          status: 'ACTIVE'
        },
        {
          id: 'user10',
          username: 'henry_taylor',
          email: 'henry@example.com',
          firstName: 'Henry',
          lastName: 'Taylor',
          status: 'ACTIVE'
        },
        {
          id: 'user11',
          username: 'iris_martinez',
          email: 'iris@example.com',
          firstName: 'Iris',
          lastName: 'Martinez',
          status: 'ACTIVE'
        },
        {
          id: 'user12',
          username: 'jack_anderson',
          email: 'jack@example.com',
          firstName: 'Jack',
          lastName: 'Anderson',
          status: 'ACTIVE'
        }
      ]
      
      // Filter mock data based on search term
      let filteredMockUsers = allMockUsers
      if (userSearchTerm) {
        filteredMockUsers = allMockUsers.filter(user => 
          user.firstName?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
          user.lastName?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
          user.username.toLowerCase().includes(userSearchTerm.toLowerCase())
        )
      }
      
      // Lọc ra những user chưa là member của organization này
      const memberUserIds = members.map(member => member.userId)
      const finalFilteredUsers = filteredMockUsers.filter(user => 
        !memberUserIds.includes(user.id)
      )
      
      // Pagination logic
      const pageSize = 5
      const totalFilteredUsers = finalFilteredUsers.length
      const calculatedTotalPages = Math.ceil(totalFilteredUsers / pageSize)
      
      const startIndex = (page - 1) * pageSize
      const endIndex = startIndex + pageSize
      const pageUsers = finalFilteredUsers.slice(startIndex, endIndex)
      
      setAvailableUsers(pageUsers)
      setTotalPages(calculatedTotalPages)
      
      // TODO: Uncomment when backend API is fixed
      /*
      const response = await organizationAPI.getAvailableUsers({
        page: page - 1, // Backend thường dùng 0-based indexing
        size: pageSize,
        searchTerm: userSearchTerm || undefined
      })
      
      if (response.data?.data) {
        // Lọc ra những user chưa là member của organization này
        const memberUserIds = members.map(member => member.userId)
        const filteredUsers = response.data.data.content?.filter(user => 
          !memberUserIds.includes(user.id)
        ) || []
        
        if (reset) {
        setAvailableUsers(filteredUsers)
        } else {
          setAvailableUsers(prev => [...prev, ...filteredUsers])
        }
        
        // Check if there are more pages
        setHasMoreUsers(response.data.data.content.length === pageSize)
      }
      */
    } catch (error) {
      console.error('Error loading available users:', error)
      // Không hiển thị toast error để tránh spam
    } finally {
      setUsersLoading(false)
      setLoadingMore(false)
    }
  }

  const handleAddUser = async (userId: string) => {
    if (!organizationId) return

    try {
      setInvitingUserId(userId)
      // Tìm user để lấy thông tin
      const user = availableUsers.find(u => u.id === userId)
      if (!user) return

      // Mock: Thêm thành viên trực tiếp vào tổ chức với quyền mặc định
      const newMember: OrganizationMember = {
        id: `member_${Date.now()}`,
        organizationId: organizationId,
        userId: user.id,
        email: user.email,
        roleIds: ['member'], // Vai trò mặc định: "Thành viên"
        status: 'ACTIVE', // Tự động active, không cần chấp nhận
        joinedAt: new Date().toISOString()
      }

      // Cập nhật state local (mock)
      setMembers(prev => [...prev, newMember])
      
      // Remove user from available list
      setAvailableUsers(prev => prev.filter(u => u.id !== userId))
      
      toast.success(`Đã thêm ${user.firstName || user.username} vào tổ chức`)
      
      // TODO: Khi có backend API, thay thế bằng:
      // await organizationAPI.addMember(organizationId, {
      //   userId: user.id,
      //   roleIds: ['member'] // Vai trò mặc định: "Thành viên"
      // })
      
    } catch (error) {
      console.error('Error adding user:', error)
      toast.error('Không thể thêm thành viên')
    } finally {
      setInvitingUserId(null)
    }
  }

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleAddMultipleUsers = async () => {
    if (!organizationId || selectedUsers.length === 0) return

    try {
      setIsAddingMultiple(true)
      const usersToAdd = availableUsers.filter(user => selectedUsers.includes(user.id))
      
      const newMembers: OrganizationMember[] = usersToAdd.map(user => ({
        id: `member_${Date.now()}_${user.id}`,
        organizationId: organizationId,
        userId: user.id,
        email: user.email,
        roleIds: ['member'],
        status: 'ACTIVE',
        joinedAt: new Date().toISOString()
      }))

      setMembers(prev => [...prev, ...newMembers])
      setSelectedUsers([])
      
      // Remove added users from available list
      setAvailableUsers(prev => prev.filter(user => !selectedUsers.includes(user.id)))
      
      toast.success(`Đã thêm ${usersToAdd.length} thành viên vào tổ chức`)
      
      // Đóng modal sau khi thêm thành công
      setShowAddMemberModal(false)
      
    } catch (error) {
      console.error('Error adding multiple users:', error)
      toast.error('Không thể thêm thành viên')
    } finally {
      setIsAddingMultiple(false)
    }
  }

  const handleSelectAll = () => {
    if (selectedUsers.length === availableUsers.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(availableUsers.map(user => user.id))
    }
  }

  const handleOpenRoleModal = (member: OrganizationMember) => {
    setSelectedMember(member)
    setShowRoleModal(true)
  }

  const handleAssignRole = async (roleId: string) => {
    if (!selectedMember || !organizationId) return

    try {
      setIsSubmitting(true)
      
      // Mock: Cập nhật vai trò cho thành viên
      setMembers(prev => prev.map(member => 
        member.id === selectedMember.id 
          ? { ...member, roleIds: [roleId] }
          : member
      ))
      
      const role = availableRoles.find(r => r.id === roleId)
      toast.success(`Đã gán vai trò "${role?.displayName}" cho ${selectedMember.email}`)
      setShowRoleModal(false)
      setSelectedMember(null)
      
      // TODO: Uncomment when backend API is ready
      /*
      await organizationAPI.assignRole(organizationId, selectedMember.userId, {
        roleIds: [roleId]
      })
      loadMembers(organizationId)
      */
      
    } catch (error) {
      console.error('Error assigning role:', error)
      toast.error('Không thể gán vai trò')
    } finally {
      setIsSubmitting(false)
    }
  }

  const canAssignRole = (targetRoleLevel: number) => {
    // Chỉ admin (level 4) mới có thể gán vai trò
    // Admin có thể gán vai trò cho user có level thấp hơn
    const currentUserLevel = currentUserRole === 'admin' ? 4 : 0
    return currentUserLevel > targetRoleLevel
  }

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1)
    }
  }


  const handleRemoveMember = async (userId: string) => {
    if (!organizationId) return
    if (!confirm('Bạn có chắc chắn muốn xóa thành viên này?')) return

    try {
      setDeletingId(userId)
      
      // Mock: Xóa thành viên
      setMembers(prev => prev.filter(member => member.userId !== userId))
      
      toast.success('Xóa thành viên thành công')
      
      // TODO: Uncomment when backend API is ready
      /*
      await organizationAPI.removeMember(organizationId, userId)
      loadMembers(organizationId)
      */
    } catch (error) {
      console.error('Error removing member:', error)
      toast.error('Không thể xóa thành viên')
    } finally {
      setDeletingId(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Hoạt động'
      case 'PENDING':
        return 'Chờ xác nhận'
      case 'INACTIVE':
        return 'Không hoạt động'
      default:
        return status
    }
  }

  const getRoleDisplayName = (roleIds: string[]) => {
    // Mock mapping cho vai trò
    const roleMap: { [key: string]: string } = {
      'member': 'Thành viên',
      'admin': 'Quản trị viên',
      'moderator': 'Điều hành viên',
      'viewer': 'Người xem'
    }
    
    if (roleIds.length === 0) return 'Chưa có vai trò'
    return roleIds.map(roleId => roleMap[roleId] || roleId).join(', ')
  }

  const filteredMembers = members.filter(member =>
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedOrganization = organizations.find(org => org.id === organizationId)

  if (!organizationId) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Chọn tổ chức</h3>
          <p className="mt-1 text-sm text-gray-500">
            Vui lòng chọn một tổ chức từ tab "Tổng quan" để quản lý thành viên.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Quản lý Thành viên</h2>
          <p className="mt-1 text-sm text-gray-600">
            {selectedOrganization?.name} • {members.length} thành viên
          </p>
        </div>
        <button
          onClick={() => setShowAddMemberModal(true)}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <UserPlusIcon className="h-4 w-4 mr-2" />
          Thêm thành viên
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm thành viên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      {/* Current Members Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Thành viên hiện tại</h3>
      </div>

      {/* Members Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải danh sách thành viên...</p>
        </div>
      ) : filteredMembers.length === 0 ? (
          <div className="text-center py-8">
            <UserPlusIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h4 className="mt-2 text-sm font-medium text-gray-900">Chưa có thành viên</h4>
            <p className="mt-1 text-sm text-gray-500">
              Click "Thêm thành viên" để thêm user vào tổ chức.
            </p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {filteredMembers.map((member) => (
                <li key={member.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary-600">
                            {member.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{member.email}</div>
                        <div className="text-sm text-gray-500">
                          {getRoleDisplayName(member.roleIds)} • Tham gia ngày {new Date(member.joinedAt).toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                        {getStatusText(member.status)}
                      </span>
                      
                      {/* Role Assignment Button - Only for Admin */}
                      {currentUserRole === 'admin' && (
                        <button
                          onClick={() => handleOpenRoleModal(member)}
                          className="text-blue-400 hover:text-blue-600 transition-colors"
                          title="Gán vai trò"
                        >
                          <Cog6ToothIcon className="h-4 w-4" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleRemoveMember(member.userId)}
                        disabled={deletingId === member.userId}
                        className="text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
                        title="Xóa thành viên"
                      >
                        {deletingId === member.userId ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                        ) : (
                          <TrashIcon className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Add Members Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowAddMemberModal(false)}
            />

            {/* Modal */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              {/* Header */}
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Thêm thành viên mới</h3>
              <button
                    onClick={() => setShowAddMemberModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                    <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
                {/* User Search */}
                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                placeholder="Tìm kiếm user để thêm..."
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchTerm(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

          {/* Select All Button */}
          {availableUsers.length > 0 && (
            <div className="flex items-center justify-between">
              <button
                onClick={handleSelectAll}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                {selectedUsers.length === availableUsers.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
              </button>
              <span className="text-sm text-gray-500">
                {selectedUsers.length}/{availableUsers.length} đã chọn
              </span>
            </div>
          )}

                {/* Available Users List */}
                {usersLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-600">Đang tải danh sách user...</p>
                  </div>
                ) : availableUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <UserPlusIcon className="mx-auto h-8 w-8 text-gray-400" />
                    <h4 className="mt-2 text-sm font-medium text-gray-900">Không có user nào</h4>
                    <p className="mt-1 text-sm text-gray-500">
                      {userSearchTerm ? 'Không tìm thấy user nào phù hợp.' : 'Tất cả user đã là thành viên của tổ chức này.'}
                    </p>
                  </div>
                ) : (
                  <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                      {availableUsers.map((user) => (
                        <li key={user.id} className="px-6 py-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                        <div className="flex-shrink-0 mr-3">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.id)}
                            onChange={() => handleSelectUser(user.id)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                        </div>
                              <div className="flex-shrink-0">
                                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                                  <span className="text-sm font-medium text-gray-600">
                                    {(user.firstName || user.username).charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username}
                                </div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                      <div className="flex items-center space-x-2">
                        {selectedUsers.includes(user.id) && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                            Đã chọn
                          </span>
                        )}
                            <button
                          onClick={() => handleAddUser(user.id)}
                              disabled={invitingUserId === user.id}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                            >
                              {invitingUserId === user.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              ) : (
                                <>
                                  <UserPlusIcon className="h-3 w-3 mr-1" />
                              Thêm
                                </>
                              )}
                            </button>
                      </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                    
                    {/* Pagination Controls */}
                    <div className="px-6 py-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        {/* Previous Button */}
                        <button
                          onClick={handlePreviousPage}
                          disabled={currentPage === 1 || loadingMore || totalPages <= 1}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                          Trước
                        </button>
                        
                        {/* Center Section - Page Info */}
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-700">
                            Trang {currentPage} / {totalPages}
                          </span>
                          {loadingMore && (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                          )}
                        </div>
                        
                        {/* Right Section - Add Button and Next Button */}
                        <div className="flex items-center space-x-2">
                          {/* Add Members Button */}
                          {selectedUsers.length > 0 && (
                            <button
                              onClick={handleAddMultipleUsers}
                              disabled={isAddingMultiple}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                            >
                              {isAddingMultiple ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                              ) : (
                                <UserPlusIcon className="h-4 w-4 mr-1" />
                              )}
                              Thêm {selectedUsers.length} thành viên
                            </button>
                          )}
                          
                          {/* Next Button */}
                          <button
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages || loadingMore || totalPages <= 1}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Sau
                            <svg className="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Footer */}
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Role Assignment Modal */}
      {showRoleModal && selectedMember && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowRoleModal(false)}
            />

            {/* Modal */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              {/* Header */}
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Gán vai trò cho thành viên
                  </h3>
                  <button
                    onClick={() => setShowRoleModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
          </div>

                {/* Member Info */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-600">
                        {selectedMember.email.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{selectedMember.email}</div>
                      <div className="text-sm text-gray-500">
                        Vai trò hiện tại: {getRoleDisplayName(selectedMember.roleIds)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Role Selection */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-900">Chọn vai trò mới:</h4>
                  {availableRoles.map((role) => (
                    <div
                      key={role.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedMember.roleIds.includes(role.id)
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${
                        !canAssignRole(role.level) ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      onClick={() => canAssignRole(role.level) && handleAssignRole(role.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900">
                              {role.displayName}
                            </span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Cấp {role.level}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{role.description}</p>
                        </div>
                        {selectedMember.roleIds.includes(role.id) && (
                          <CheckIcon className="h-5 w-5 text-primary-600" />
                        )}
                      </div>
                  </div>
                  ))}
                </div>

                {/* Role Level Explanation */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h5 className="text-sm font-medium text-blue-900 mb-2">📊 Giải thích cấp độ vai trò:</h5>
                  <div className="text-xs text-blue-800 space-y-1">
                    <div><strong>Cấp 4 (Quản trị viên):</strong> Toàn quyền quản lý tổ chức</div>
                    <div><strong>Cấp 3 (Điều hành viên):</strong> Quản lý nội dung và thành viên</div>
                    <div><strong>Cấp 2 (Thành viên):</strong> Thành viên thông thường</div>
                    <div><strong>Cấp 1 (Người xem):</strong> Chỉ xem nội dung</div>
                    <div className="mt-2 text-blue-700">
                      <strong>Lưu ý:</strong> Admin chỉ có thể gán vai trò có cấp độ thấp hơn cho thành viên.
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Footer */}
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => setShowRoleModal(false)}
                  className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

