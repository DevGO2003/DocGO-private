'use client'

import { useState, useEffect } from 'react'
import { organizationAPI } from '@/lib/apis/organization-api'
import { OrganizationPermission, Organization } from '@/types/organization'
import { toast } from 'react-hot-toast'
import { 
  PlusIcon, 
  TrashIcon, 
  PencilIcon,
  MagnifyingGlassIcon,
  BuildingOfficeIcon,
  KeyIcon
} from '@heroicons/react/24/outline'

interface PermissionsManagementProps {
  organizationId: string | null
  onOrganizationSelect: (organizationId: string | null) => void
}

interface PermissionFormData {
  code: string
  name: string
  description: string
  category: string
}

export default function PermissionsManagement({ organizationId, onOrganizationSelect }: PermissionsManagementProps) {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [permissions, setPermissions] = useState<OrganizationPermission[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFormModal, setShowFormModal] = useState(false)
  const [editingPermission, setEditingPermission] = useState<OrganizationPermission | null>(null)
  const [formData, setFormData] = useState<PermissionFormData>({
    code: '',
    name: '',
    description: '',
    category: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    loadOrganizations()
  }, [])

  useEffect(() => {
    if (organizationId) {
      loadPermissions(organizationId)
    } else {
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

  const loadPermissions = async (orgId: string) => {
    try {
      setLoading(true)
      
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
      toast.error('Không thể tải danh sách quyền hạn')
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePermission = async () => {
    if (!organizationId) return

    try {
      setIsSubmitting(true)
      
      // Mock: Tạo quyền hạn mới
      const newPermission: OrganizationPermission = {
        id: `perm_${Date.now()}`,
        organizationId: organizationId,
        code: formData.code,
        name: formData.name,
        description: formData.description,
        category: formData.category,
        createdAt: new Date().toISOString()
      }
      
      setPermissions(prev => [...prev, newPermission])
      toast.success('Tạo quyền hạn thành công')
      setShowFormModal(false)
      resetForm()
      
      // TODO: Uncomment when backend API is ready
      /*
      await organizationAPI.createPermission(organizationId, formData)
      loadPermissions(organizationId)
      */
    } catch (error) {
      console.error('Error creating permission:', error)
      toast.error('Không thể tạo quyền hạn')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdatePermission = async () => {
    if (!organizationId || !editingPermission) return

    try {
      setIsSubmitting(true)
      
      // Mock: Cập nhật quyền hạn
      setPermissions(prev => prev.map(permission => 
        permission.id === editingPermission.id 
          ? { ...permission, ...formData }
          : permission
      ))
      
      toast.success('Cập nhật quyền hạn thành công')
      setShowFormModal(false)
      setEditingPermission(null)
      resetForm()
      
      // TODO: Uncomment when backend API is ready
      /*
      await organizationAPI.updatePermission(organizationId, editingPermission.id, formData)
      loadPermissions(organizationId)
      */
    } catch (error) {
      console.error('Error updating permission:', error)
      toast.error('Không thể cập nhật quyền hạn')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeletePermission = async (permissionId: string) => {
    if (!organizationId) return
    if (!confirm('Bạn có chắc chắn muốn xóa quyền hạn này?')) return

    try {
      setDeletingId(permissionId)
      
      // Mock: Xóa quyền hạn
      setPermissions(prev => prev.filter(permission => permission.id !== permissionId))
      
      toast.success('Xóa quyền hạn thành công')
      
      // TODO: Uncomment when backend API is ready
      /*
      await organizationAPI.deletePermission(organizationId, permissionId)
      loadPermissions(organizationId)
      */
    } catch (error) {
      console.error('Error deleting permission:', error)
      toast.error('Không thể xóa quyền hạn')
    } finally {
      setDeletingId(null)
    }
  }

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      category: ''
    })
  }

  const openCreateModal = () => {
    resetForm()
    setEditingPermission(null)
    setShowFormModal(true)
  }

  const openEditModal = (permission: OrganizationPermission) => {
    setFormData({
      code: permission.code,
      name: permission.name,
      description: permission.description || '',
      category: permission.category || ''
    })
    setEditingPermission(permission)
    setShowFormModal(true)
  }

  const filteredPermissions = permissions.filter(permission =>
    permission.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (permission.description && permission.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (permission.category && permission.category.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const selectedOrganization = organizations.find(org => org.id === organizationId)

  if (!organizationId) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Chọn tổ chức</h3>
          <p className="mt-1 text-sm text-gray-500">
            Vui lòng chọn một tổ chức từ tab "Tổng quan" để quản lý quyền hạn.
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
          <h2 className="text-xl font-semibold text-gray-900">Quản lý Quyền hạn</h2>
          <p className="mt-1 text-sm text-gray-600">
            {selectedOrganization?.name} • {permissions.length} quyền hạn
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Tạo quyền hạn mới
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
            placeholder="Tìm kiếm quyền hạn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      {/* Permissions Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải danh sách quyền hạn...</p>
        </div>
      ) : filteredPermissions.length === 0 ? (
        <div className="text-center py-12">
          <KeyIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Không có quyền hạn</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Không tìm thấy quyền hạn nào phù hợp.' : 'Bắt đầu bằng cách tạo quyền hạn đầu tiên.'}
          </p>
          {!searchTerm && (
            <div className="mt-6">
              <button
                onClick={openCreateModal}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Tạo quyền hạn mới
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredPermissions.map((permission) => (
              <li key={permission.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <KeyIcon className="h-8 w-8 text-primary-600" />
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <h3 className="text-sm font-medium text-gray-900">{permission.name}</h3>
                        {permission.category && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {permission.category}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 font-mono">{permission.code}</div>
                      {permission.description && (
                        <div className="text-sm text-gray-600 mt-1">{permission.description}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openEditModal(permission)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Chỉnh sửa"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePermission(permission.id)}
                      disabled={deletingId === permission.id}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                      title="Xóa"
                    >
                      {deletingId === permission.id ? (
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
                  {editingPermission ? 'Chỉnh sửa Quyền hạn' : 'Tạo Quyền hạn Mới'}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mã quyền hạn <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="vd: user.read, document.write"
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên quyền hạn <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="vd: Đọc thông tin người dùng"
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Danh mục
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="vd: User Management, Document Management"
                      disabled={isSubmitting}
                    />
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
                      placeholder="Mô tả chi tiết quyền hạn này"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={editingPermission ? handleUpdatePermission : handleCreatePermission}
                  disabled={isSubmitting || !formData.code || !formData.name}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang lưu...' : (editingPermission ? 'Cập nhật' : 'Tạo mới')}
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
    </div>
  )
}

