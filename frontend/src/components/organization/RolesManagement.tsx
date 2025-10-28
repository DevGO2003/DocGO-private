'use client'

import { useState, useEffect } from 'react'
import { organizationAPI } from '@/lib/apis/organization-api'
import { OrganizationRole, OrganizationPermission, Organization } from '@/types/organization'
import { toast } from 'react-hot-toast'
import { 
  PlusIcon, 
  TrashIcon, 
  PencilIcon,
  MagnifyingGlassIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon,
  KeyIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

interface RolesManagementProps {
  organizationId: string | null
  onOrganizationSelect: (organizationId: string | null) => void
}

interface RoleFormData {
  name: string
  displayName: string
  description: string
  level: number
}

export default function RolesManagement({ organizationId, onOrganizationSelect }: RolesManagementProps) {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [roles, setRoles] = useState<OrganizationRole[]>([])
  const [permissions, setPermissions] = useState<OrganizationPermission[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFormModal, setShowFormModal] = useState(false)
  const [showPermissionsModal, setShowPermissionsModal] = useState(false)
  const [editingRole, setEditingRole] = useState<OrganizationRole | null>(null)
  const [selectedRole, setSelectedRole] = useState<OrganizationRole | null>(null)
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [formData, setFormData] = useState<RoleFormData>({
    name: '',
    displayName: '',
    description: '',
    level: 1
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    loadOrganizations()
  }, [])

  useEffect(() => {
    if (organizationId) {
      loadRoles(organizationId)
      loadPermissions(organizationId)
    } else {
      setRoles([])
      setPermissions([])
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

  const loadRoles = async (orgId: string) => {
    try {
      setLoading(true)
      
      // Mock data tạm thời cho roles
      const mockRoles: OrganizationRole[] = [
        {
          id: 'role1',
          organizationId: orgId,
          name: 'admin',
          displayName: 'Quản trị viên',
          description: 'Toàn quyền quản lý tổ chức',
          permissionIds: ['perm1', 'perm2', 'perm3', 'perm4', 'perm5', 'perm6', 'perm7'],
          level: 4,
          createdAt: '2024-01-15T08:00:00Z'
        },
        {
          id: 'role2',
          organizationId: orgId,
          name: 'moderator',
          displayName: 'Điều hành viên',
          description: 'Quản lý nội dung và thành viên',
          permissionIds: ['perm1', 'perm2', 'perm4', 'perm5'],
          level: 3,
          createdAt: '2024-01-15T08:00:00Z'
        },
        {
          id: 'role3',
          organizationId: orgId,
          name: 'member',
          displayName: 'Thành viên',
          description: 'Thành viên thông thường',
          permissionIds: ['perm1', 'perm4'],
          level: 2,
          createdAt: '2024-01-15T08:00:00Z'
        },
        {
          id: 'role4',
          organizationId: orgId,
          name: 'viewer',
          displayName: 'Người xem',
          description: 'Chỉ xem nội dung',
          permissionIds: ['perm1'],
          level: 1,
          createdAt: '2024-01-15T08:00:00Z'
        }
      ]
      
      setRoles(mockRoles)
      
      // TODO: Uncomment when backend API is ready
      /*
      const response = await organizationAPI.getRoles(orgId, {
        page: 0,
        size: 100
      })
      
      if (response.data?.data?.content) {
        setRoles(response.data.data.content)
      }
      */
    } catch (error) {
      console.error('Error loading roles:', error)
      toast.error('Không thể tải danh sách vai trò')
    } finally {
      setLoading(false)
    }
  }

  const loadPermissions = async (orgId: string) => {
    try {
      // Mock data tạm thời cho permissions
      const mockPermissions: OrganizationPermission[] = [
        {
          id: 'perm1',
          organizationId: orgId,
          code: 'user.read',
          name: 'Đọc thông tin người dùng',
          description: 'Xem thông tin cơ bản của người dùng trong tổ chức',
          category: 'User Management',
          createdAt: '2024-01-15T08:00:00Z'
        },
        {
          id: 'perm2',
          organizationId: orgId,
          code: 'user.write',
          name: 'Chỉnh sửa thông tin người dùng',
          description: 'Cập nhật thông tin người dùng trong tổ chức',
          category: 'User Management',
          createdAt: '2024-01-15T08:00:00Z'
        },
        {
          id: 'perm3',
          organizationId: orgId,
          code: 'user.delete',
          name: 'Xóa người dùng',
          description: 'Xóa người dùng khỏi tổ chức',
          category: 'User Management',
          createdAt: '2024-01-15T08:00:00Z'
        },
        {
          id: 'perm4',
          organizationId: orgId,
          code: 'document.read',
          name: 'Đọc tài liệu',
          description: 'Xem và tải xuống tài liệu trong tổ chức',
          category: 'Document Management',
          createdAt: '2024-01-15T08:00:00Z'
        },
        {
          id: 'perm5',
          organizationId: orgId,
          code: 'document.write',
          name: 'Tạo và chỉnh sửa tài liệu',
          description: 'Tạo mới và chỉnh sửa tài liệu trong tổ chức',
          category: 'Document Management',
          createdAt: '2024-01-15T08:00:00Z'
        },
        {
          id: 'perm6',
          organizationId: orgId,
          code: 'document.delete',
          name: 'Xóa tài liệu',
          description: 'Xóa tài liệu khỏi tổ chức',
          category: 'Document Management',
          createdAt: '2024-01-15T08:00:00Z'
        },
        {
          id: 'perm7',
          organizationId: orgId,
          code: 'organization.manage',
          name: 'Quản lý tổ chức',
          description: 'Cấu hình và quản lý thông tin tổ chức',
          category: 'Organization Management',
          createdAt: '2024-01-15T08:00:00Z'
        }
      ]
      
      setPermissions(mockPermissions)
      
      // TODO: Uncomment when backend API is ready
      /*
      const response = await organizationAPI.getPermissions(orgId, {
        page: 0,
        size: 100
      })
      
      if (response.data?.data?.content) {
        setPermissions(response.data.data.content)
      }
      */
    } catch (error) {
      console.error('Error loading permissions:', error)
    }
  }

  const handleCreateRole = async () => {
    if (!organizationId) return

    try {
      setIsSubmitting(true)
      
      // Mock: Tạo vai trò mới
      const newRole: OrganizationRole = {
        id: `role_${Date.now()}`,
        organizationId: organizationId,
        name: formData.name,
        displayName: formData.displayName,
        description: formData.description,
        permissionIds: [],
        level: formData.level,
        createdAt: new Date().toISOString()
      }
      
      setRoles(prev => [...prev, newRole])
      toast.success('Tạo vai trò thành công')
      setShowFormModal(false)
      resetForm()
      
      // TODO: Uncomment when backend API is ready
      /*
      await organizationAPI.createRole(organizationId, formData)
      loadRoles(organizationId)
      */
    } catch (error) {
      console.error('Error creating role:', error)
      toast.error('Không thể tạo vai trò')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateRole = async () => {
    if (!organizationId || !editingRole) return

    try {
      setIsSubmitting(true)
      
      // Mock: Cập nhật vai trò
      setRoles(prev => prev.map(role => 
        role.id === editingRole.id 
          ? { ...role, ...formData }
          : role
      ))
      
      toast.success('Cập nhật vai trò thành công')
      setShowFormModal(false)
      setEditingRole(null)
      resetForm()
      
      // TODO: Uncomment when backend API is ready
      /*
      await organizationAPI.updateRole(organizationId, editingRole.id, formData)
      loadRoles(organizationId)
      */
    } catch (error) {
      console.error('Error updating role:', error)
      toast.error('Không thể cập nhật vai trò')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteRole = async (roleId: string) => {
    if (!organizationId) return
    if (!confirm('Bạn có chắc chắn muốn xóa vai trò này?')) return

    try {
      setDeletingId(roleId)
      
      // Mock: Xóa vai trò
      setRoles(prev => prev.filter(role => role.id !== roleId))
      
      toast.success('Xóa vai trò thành công')
      
      // TODO: Uncomment when backend API is ready
      /*
      await organizationAPI.deleteRole(organizationId, roleId)
      loadRoles(organizationId)
      */
    } catch (error) {
      console.error('Error deleting role:', error)
      toast.error('Không thể xóa vai trò')
    } finally {
      setDeletingId(null)
    }
  }

  const handleUpdatePermissions = async () => {
    if (!organizationId || !selectedRole) return

    try {
      setIsSubmitting(true)
      
      // Mock: Cập nhật quyền hạn cho vai trò
      setRoles(prev => prev.map(role => 
        role.id === selectedRole.id 
          ? { ...role, permissionIds: selectedPermissions }
          : role
      ))
      
      toast.success('Cập nhật quyền hạn thành công')
      setShowPermissionsModal(false)
      setSelectedRole(null)
      setSelectedPermissions([])
      
      // TODO: Uncomment when backend API is ready
      /*
      await organizationAPI.updateRolePermissions(organizationId, selectedRole.id, {
        permissionIds: selectedPermissions
      })
      loadRoles(organizationId)
      */
    } catch (error) {
      console.error('Error updating permissions:', error)
      toast.error('Không thể cập nhật quyền hạn')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      displayName: '',
      description: '',
      level: 1
    })
  }

  const openCreateModal = () => {
    resetForm()
    setEditingRole(null)
    setShowFormModal(true)
  }

  const openEditModal = (role: OrganizationRole) => {
    setFormData({
      name: role.name,
      displayName: role.displayName,
      description: role.description || '',
      level: role.level
    })
    setEditingRole(role)
    setShowFormModal(true)
  }

  const openPermissionsModal = (role: OrganizationRole) => {
    setSelectedRole(role)
    setSelectedPermissions(role.permissionIds)
    setShowPermissionsModal(true)
  }

  const togglePermission = (permissionId: string) => {
    setSelectedPermissions(prev =>
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    )
  }

  const getPermissionsByCategory = () => {
    const categories: { [key: string]: OrganizationPermission[] } = {}
    
    permissions.forEach(permission => {
      const category = permission.category || 'Other'
      if (!categories[category]) {
        categories[category] = []
      }
      categories[category].push(permission)
    })
    
    return categories
  }

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (role.description && role.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const selectedOrganization = organizations.find(org => org.id === organizationId)

  if (!organizationId) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Chọn tổ chức</h3>
          <p className="mt-1 text-sm text-gray-500">
            Vui lòng chọn một tổ chức từ tab "Tổng quan" để quản lý vai trò.
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
          <h2 className="text-xl font-semibold text-gray-900">Quản lý Vai trò</h2>
          <p className="mt-1 text-sm text-gray-600">
            {selectedOrganization?.name} • {roles.length} vai trò
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Tạo vai trò mới
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
            placeholder="Tìm kiếm vai trò..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      {/* Roles Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải danh sách vai trò...</p>
        </div>
      ) : filteredRoles.length === 0 ? (
        <div className="text-center py-12">
          <ShieldCheckIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Không có vai trò</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Không tìm thấy vai trò nào phù hợp.' : 'Bắt đầu bằng cách tạo vai trò đầu tiên.'}
          </p>
          {!searchTerm && (
            <div className="mt-6">
              <button
                onClick={openCreateModal}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Tạo vai trò mới
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredRoles.map((role) => (
              <li key={role.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ShieldCheckIcon className="h-8 w-8 text-primary-600" />
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <h3 className="text-sm font-medium text-gray-900">{role.displayName}</h3>
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Cấp {role.level}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 font-mono">{role.name}</div>
                      {role.description && (
                        <div className="text-sm text-gray-600 mt-1">{role.description}</div>
                      )}
                      <div className="text-xs text-gray-500 mt-1">
                        {role.permissionIds.length} quyền hạn
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openPermissionsModal(role)}
                      className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                      title="Quản lý quyền hạn"
                    >
                      <KeyIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => openEditModal(role)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Chỉnh sửa"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteRole(role.id)}
                      disabled={deletingId === role.id}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                      title="Xóa"
                    >
                      {deletingId === role.id ? (
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

      {/* Form Modal */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowFormModal(false)} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingRole ? 'Chỉnh sửa Vai trò' : 'Tạo Vai trò Mới'}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên vai trò (code) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="vd: admin, moderator, member"
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên hiển thị <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.displayName}
                      onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="vd: Quản trị viên, Điều hành viên"
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cấp độ <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.level}
                      onChange={(e) => setFormData(prev => ({ ...prev, level: parseInt(e.target.value) }))}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                      disabled={isSubmitting}
                    >
                      <option value={1}>Cấp 1 - Người xem</option>
                      <option value={2}>Cấp 2 - Thành viên</option>
                      <option value={3}>Cấp 3 - Điều hành viên</option>
                      <option value={4}>Cấp 4 - Quản trị viên</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mô tả
                    </label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Mô tả chi tiết vai trò này"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={editingRole ? handleUpdateRole : handleCreateRole}
                  disabled={isSubmitting || !formData.name || !formData.displayName}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang lưu...' : (editingRole ? 'Cập nhật' : 'Tạo mới')}
                </button>
                <button
                  onClick={() => setShowFormModal(false)}
                  disabled={isSubmitting}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Permissions Modal */}
      {showPermissionsModal && selectedRole && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowPermissionsModal(false)} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Quản lý Quyền hạn
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedRole.displayName} • {selectedPermissions.length}/{permissions.length} quyền hạn
                    </p>
                  </div>
                  <button
                    onClick={() => setShowPermissionsModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                
                {/* Permissions by Category */}
                <div className="space-y-6 max-h-96 overflow-y-auto">
                  {Object.entries(getPermissionsByCategory()).map(([category, categoryPermissions]) => (
                    <div key={category}>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">{category}</h4>
                      <div className="space-y-2">
                        {categoryPermissions.map((permission) => (
                          <div
                            key={permission.id}
                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                              selectedPermissions.includes(permission.id)
                                ? 'border-primary-500 bg-primary-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => togglePermission(permission.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-medium text-gray-900">
                                    {permission.name}
                                  </span>
                                  <span className="text-xs text-gray-500 font-mono">
                                    {permission.code}
                                  </span>
                                </div>
                                {permission.description && (
                                  <p className="text-sm text-gray-600 mt-1">{permission.description}</p>
                                )}
                              </div>
                              {selectedPermissions.includes(permission.id) && (
                                <CheckIcon className="h-5 w-5 text-primary-600 flex-shrink-0 ml-2" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={handleUpdatePermissions}
                  disabled={isSubmitting}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
                <button
                  onClick={() => setShowPermissionsModal(false)}
                  disabled={isSubmitting}
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

