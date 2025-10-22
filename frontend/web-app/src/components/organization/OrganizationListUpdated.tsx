/**
 * OrganizationList Component
 * Kết nối với backend user-management-service qua API Gateway
 */

'use client'

import { useState, useEffect } from 'react'
import { organizationService } from '@/lib/services/organization-service'
import { UserOrganizationContext } from '@/types/organization-extended'
import OrganizationFormModal from './OrganizationFormModal'
import { toast } from 'react-hot-toast'
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  CheckIcon,
  MagnifyingGlassIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

interface OrganizationListUpdatedProps {
  onOrganizationSelect: (organizationId: string | null) => void
  selectedOrganizationId: string | null
}

export default function OrganizationListUpdated({ 
  onOrganizationSelect, 
  selectedOrganizationId 
}: OrganizationListUpdatedProps) {
  const [organizations, setOrganizations] = useState<UserOrganizationContext[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFormModal, setShowFormModal] = useState(false)
  const [editingOrganization, setEditingOrganization] = useState<UserOrganizationContext | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    loadUserOrganizations()
  }, [])

  const loadUserOrganizations = async () => {
    try {
      setLoading(true)
      const userOrgs = await organizationService.getUserOrganizations()
      setOrganizations(userOrgs)
      toast.success('Tải danh sách tổ chức thành công')
    } catch (error) {
      console.error('Error loading organizations:', error)
      toast.error('Không thể tải danh sách tổ chức')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateOrganization = async (data: { name: string; description?: string }) => {
    try {
      const newOrg = await organizationService.createOrganization(data)
      setOrganizations(prev => [newOrg, ...prev])
      toast.success('Tạo tổ chức thành công')
      setShowFormModal(false)
    } catch (error) {
      console.error('Error creating organization:', error)
      toast.error('Không thể tạo tổ chức')
    }
  }

  const handleUpdateOrganization = async (data: { name: string; description?: string }) => {
    if (!editingOrganization) return

    try {
      if (!editingOrganization.isOwner && !editingOrganization.isAdmin) {
        toast.error('Bạn không có quyền chỉnh sửa tổ chức này')
        return
      }

      // Call API update
      await organizationService.updateOrganization(editingOrganization.id, data)
      
      // Reload organizations
      await loadUserOrganizations()
      
      toast.success('Cập nhật tổ chức thành công')
      setEditingOrganization(null)
      setShowFormModal(false)
    } catch (error) {
      console.error('Error updating organization:', error)
      toast.error('Không thể cập nhật tổ chức')
    }
  }

  const handleDeleteOrganization = async (organizationId: string) => {
    const org = organizations.find(o => o.id === organizationId)
    if (!org) return

    if (!org.isOwner) {
      toast.error('Chỉ chủ sở hữu mới có thể xóa tổ chức')
      return
    }

    if (!confirm(`Bạn có chắc chắn muốn xóa tổ chức "${org.name}"? Hành động này không thể hoàn tác.`)) {
      return
    }

    try {
      setDeletingId(organizationId)
      
      await organizationService.deleteOrganization(organizationId)
      
      setOrganizations(prev => prev.filter(org => org.id !== organizationId))
      
      if (selectedOrganizationId === organizationId) {
        onOrganizationSelect(null)
      }
      
      toast.success('Xóa tổ chức thành công')
    } catch (error) {
      console.error('Error deleting organization:', error)
      toast.error('Không thể xóa tổ chức')
    } finally {
      setDeletingId(null)
    }
  }

  const handleSelectOrganization = async (organizationId: string) => {
    onOrganizationSelect(organizationId)
  }

  const filteredOrganizations = organizations.filter(org =>
    !searchTerm || 
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-800'
      case 'admin': return 'bg-blue-100 text-blue-800'
      case 'member': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'owner': return 'Chủ sở hữu'
      case 'admin': return 'Quản trị viên'
      case 'member': return 'Thành viên'
      default: return role
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tổ chức của tôi</h2>
          <p className="mt-1 text-sm text-gray-500">
            Quản lý các tổ chức bạn tham gia
          </p>
        </div>
        <button
          onClick={() => {
            setEditingOrganization(null)
            setShowFormModal(true)
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Tạo tổ chức mới
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Tìm kiếm tổ chức..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
        />
      </div>

      {/* Organizations Grid */}
      {filteredOrganizations.length === 0 ? (
        <div className="text-center py-12">
          <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Không có tổ chức nào</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Không tìm thấy tổ chức phù hợp' : 'Bắt đầu bằng cách tạo tổ chức mới'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredOrganizations.map((org) => (
            <div
              key={org.id}
              className={`relative rounded-lg border-2 ${
                selectedOrganizationId === org.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              } p-6 shadow-sm transition-all cursor-pointer`}
              onClick={() => handleSelectOrganization(org.id)}
            >
              {/* Selected Indicator */}
              {selectedOrganizationId === org.id && (
                <div className="absolute top-4 right-4">
                  <CheckIcon className="h-6 w-6 text-primary-600" />
                </div>
              )}

              {/* Organization Info */}
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <BuildingOfficeIcon className="h-10 w-10 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-medium text-gray-900 truncate">
                    {org.name}
                  </h3>
                  {org.description && (
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                      {org.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Role Badge */}
              <div className="mt-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(org.userRole)}`}>
                  <ShieldCheckIcon className="h-4 w-4 mr-1" />
                  {getRoleLabel(org.userRole)}
                </span>
              </div>

              {/* Stats */}
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center text-gray-500">
                  <UserGroupIcon className="h-4 w-4 mr-1" />
                  <span>{org.memberCount || org.stats?.totalMembers || 0} thành viên</span>
                </div>
                <div className="flex items-center text-gray-500">
                  <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
                  <span>{org.stats?.totalChatGroups || 0} nhóm chat</span>
                </div>
              </div>

              {/* Actions */}
              {(org.isOwner || org.isAdmin) && (
                <div className="mt-4 flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditingOrganization(org)
                      setShowFormModal(true)
                    }}
                    className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <PencilIcon className="h-4 w-4 mr-1" />
                    Sửa
                  </button>
                  {org.isOwner && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteOrganization(org.id)
                      }}
                      disabled={deletingId === org.id}
                      className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                    >
                      <TrashIcon className="h-4 w-4 mr-1" />
                      {deletingId === org.id ? 'Đang xóa...' : 'Xóa'}
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showFormModal && (
        <OrganizationFormModal
          isOpen={showFormModal}
          organization={editingOrganization}
          onSubmit={editingOrganization ? handleUpdateOrganization : handleCreateOrganization}
          onClose={() => {
            setShowFormModal(false)
            setEditingOrganization(null)
          }}
        />
      )}
    </div>
  )
}
