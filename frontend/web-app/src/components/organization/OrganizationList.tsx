'use client'

import { useState, useEffect } from 'react'
import { organizationAPI } from '@/lib/apis/organization-api'
import { Organization } from '@/types/organization'
import OrganizationFormModal from './OrganizationFormModal'
import { toast } from 'react-hot-toast'
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  CheckIcon,
  MagnifyingGlassIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'

interface OrganizationListProps {
  onOrganizationSelect: (organizationId: string | null) => void
  selectedOrganizationId: string | null
}

export default function OrganizationList({ onOrganizationSelect, selectedOrganizationId }: OrganizationListProps) {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFormModal, setShowFormModal] = useState(false)
  const [editingOrganization, setEditingOrganization] = useState<Organization | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    loadOrganizations()
  }, [])

  const loadOrganizations = async () => {
    try {
      setLoading(true)
      
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
          name: 'Viện Nghiên cứu',
          description: 'Viện nghiên cứu khoa học và công nghệ',
          ownerUserId: 'user4',
          status: 'INACTIVE',
          memberCount: 45,
          createdAt: '2024-01-05T09:00:00Z',
          updatedAt: '2024-01-05T09:00:00Z'
        }
      ]
      
      setOrganizations(mockOrganizations)
      
      // TODO: Uncomment when backend API is ready
      /*
      const response = await organizationAPI.getAllOrganizations({
        page: 0,
        size: 100,
        sortBy: 'createdAt',
        sortDirection: 'DESC'
      })
      
      if (response.data?.data?.content) {
        setOrganizations(response.data.data.content)
      }
      */
    } catch (error) {
      console.error('Error loading organizations:', error)
      toast.error('Không thể tải danh sách tổ chức')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateOrganization = async (data: { name: string; description?: string }) => {
    try {
      // Mock: Tạo tổ chức mới
      const newOrganization: Organization = {
        id: `org_${Date.now()}`,
        name: data.name,
        description: data.description,
        ownerUserId: 'current-user-id',
        status: 'ACTIVE',
        memberCount: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      setOrganizations(prev => [newOrganization, ...prev])
      toast.success('Tạo tổ chức thành công')
      setShowFormModal(false)
      
      // TODO: Uncomment when backend API is ready
      /*
      const authData = localStorage.getItem('docgo_auth_v1')
      const userData = authData ? JSON.parse(authData) : null
      const ownerUserId = userData?.user?.id || 'current-user-id'

      await organizationAPI.createOrganization({
        ...data,
        ownerUserId
      })
      
      loadOrganizations()
      */
    } catch (error) {
      console.error('Error creating organization:', error)
      toast.error('Không thể tạo tổ chức')
    }
  }

  const handleUpdateOrganization = async (data: { name: string; description?: string }) => {
    if (!editingOrganization) return

    try {
      // Mock: Cập nhật tổ chức
      setOrganizations(prev => prev.map(org => 
        org.id === editingOrganization.id 
          ? { ...org, ...data, updatedAt: new Date().toISOString() }
          : org
      ))
      
      toast.success('Cập nhật tổ chức thành công')
      setShowFormModal(false)
      setEditingOrganization(null)
      
      // TODO: Uncomment when backend API is ready
      /*
      await organizationAPI.updateOrganization(editingOrganization.id, data)
      loadOrganizations()
      */
    } catch (error) {
      console.error('Error updating organization:', error)
      toast.error('Không thể cập nhật tổ chức')
    }
  }

  const handleDeleteOrganization = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tổ chức này?')) return

    try {
      setDeletingId(id)
      
      // Mock: Xóa tổ chức
      setOrganizations(prev => prev.filter(org => org.id !== id))
      
      toast.success('Xóa tổ chức thành công')
      if (selectedOrganizationId === id) {
        onOrganizationSelect(null)
      }
      
      // TODO: Uncomment when backend API is ready
      /*
      await organizationAPI.deleteOrganization(id)
      loadOrganizations()
      */
    } catch (error) {
      console.error('Error deleting organization:', error)
      toast.error('Không thể xóa tổ chức')
    } finally {
      setDeletingId(null)
    }
  }

  const filteredOrganizations = organizations.filter(org =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (org.description && org.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800'
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800'
      case 'SUSPENDED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Hoạt động'
      case 'INACTIVE':
        return 'Không hoạt động'
      case 'SUSPENDED':
        return 'Tạm dừng'
      default:
        return status
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Đang tải danh sách tổ chức...</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Danh sách Tổ chức</h2>
          <p className="mt-1 text-sm text-gray-600">
            Quản lý và theo dõi các tổ chức trong hệ thống
          </p>
        </div>
        <button
          onClick={() => setShowFormModal(true)}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Tạo tổ chức mới
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
            placeholder="Tìm kiếm tổ chức..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      {/* Organizations Grid */}
      {filteredOrganizations.length === 0 ? (
        <div className="text-center py-12">
          <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Không có tổ chức</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Không tìm thấy tổ chức nào phù hợp.' : 'Bắt đầu bằng cách tạo tổ chức đầu tiên.'}
          </p>
          {!searchTerm && (
            <div className="mt-6">
              <button
                onClick={() => setShowFormModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Tạo tổ chức mới
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrganizations.map((org) => (
            <div
              key={org.id}
              className={`bg-white rounded-lg border-2 p-6 hover:shadow-lg transition-shadow cursor-pointer ${
                selectedOrganizationId === org.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
              }`}
              onClick={() => onOrganizationSelect(org.id)}
              onDoubleClick={() => onOrganizationSelect(org.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    <BuildingOfficeIcon className="h-8 w-8 text-primary-600 mr-3" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{org.name}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(org.status)}`}>
                        {getStatusText(org.status)}
                      </span>
                    </div>
                  </div>
                  
                  {org.description && (
                    <p className="mt-3 text-sm text-gray-600 line-clamp-2">{org.description}</p>
                  )}
                  
                  <div className="mt-4 flex items-center text-sm text-gray-500">
                    <span>{org.memberCount || 0} thành viên</span>
                    <span className="mx-2">•</span>
                    <span>Tạo ngày {new Date(org.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 flex items-center justify-end space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onOrganizationSelect(org.id)
                  }}
                  className="p-2 text-gray-400 hover:text-primary-600 transition-colors relative group"
                  title="Chọn tổ chức để xem chi tiết ở các tab khác"
                  aria-label="Chọn tổ chức để xem chi tiết"
                >
                  <CheckIcon className="h-4 w-4" />
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 max-w-xs">
                    Chọn tổ chức để xem chi tiết ở các tab khác
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setEditingOrganization(org)
                    setShowFormModal(true)
                  }}
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Chỉnh sửa"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteOrganization(org.id)
                  }}
                  disabled={deletingId === org.id}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                  title="Xóa"
                >
                  {deletingId === org.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                  ) : (
                    <TrashIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      <OrganizationFormModal
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false)
          setEditingOrganization(null)
        }}
        onSubmit={editingOrganization ? handleUpdateOrganization : handleCreateOrganization}
        organization={editingOrganization}
      />
    </div>
  )
}

