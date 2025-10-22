'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/Button'
import { RoleSelector } from '@/components/organization/RoleSelector'
import { PermissionGuard, RoleBasedContent } from '@/components/auth/PermissionGuard'
import { useCurrentUser, usePermissions } from '@/hooks/usePermissions'
import { PERMISSIONS, ROLE_ICONS } from '@/lib/constants/roles-permissions'
import { setMockUserRole, getMockUserRole } from '@/lib/mock/organization-mock'
import { CheckCircle2, XCircle, Plus, Edit, Trash2, Eye } from '@/lib/icons'

export default function RoleDemoPage() {
  const params = useParams()
  const organizationId = params.id as string
  
  const [currentRole, setCurrentRole] = useState('Nhân viên kiểm tra')
  const currentUser = useCurrentUser()
  const { permissions, hasPermission } = usePermissions({
    userRoles: currentUser.roles,
    userPermissions: currentUser.permissions
  })

  useEffect(() => {
    // Load saved role
    const saved = getMockUserRole()
    setCurrentRole(saved)
  }, [])

  const handleRoleChange = (role: string) => {
    setCurrentRole(role)
    setMockUserRole(role)
    // Force re-render
    window.location.reload()
  }

  const permissionCategories = [
    {
      name: 'Quản lý tổ chức',
      permissions: [
        { key: PERMISSIONS.ORG_MANAGE, label: 'Quản lý tổ chức', icon: '🏢' },
        { key: PERMISSIONS.ORG_VIEW, label: 'Xem tổ chức', icon: '👁️' },
        { key: PERMISSIONS.ORG_DELETE, label: 'Xóa tổ chức', icon: '🗑️' }
      ]
    },
    {
      name: 'Quản lý thành viên',
      permissions: [
        { key: PERMISSIONS.MEMBER_INVITE, label: 'Mời thành viên', icon: '✉️' },
        { key: PERMISSIONS.MEMBER_REMOVE, label: 'Xóa thành viên', icon: '👋' },
        { key: PERMISSIONS.MEMBER_VIEW, label: 'Xem thành viên', icon: '👥' }
      ]
    },
    {
      name: 'Quản lý Workflow',
      permissions: [
        { key: PERMISSIONS.WORKFLOW_CREATE, label: 'Tạo workflow', icon: '➕' },
        { key: PERMISSIONS.WORKFLOW_EDIT, label: 'Sửa workflow', icon: '✏️' },
        { key: PERMISSIONS.WORKFLOW_VIEW, label: 'Xem workflow', icon: '📊' }
      ]
    },
    {
      name: 'Quản lý Repository',
      permissions: [
        { key: PERMISSIONS.REPO_CREATE, label: 'Tạo repository', icon: '📁' },
        { key: PERMISSIONS.REPO_DELETE, label: 'Xóa repository', icon: '🗑️' },
        { key: PERMISSIONS.REPO_VIEW, label: 'Xem repository', icon: '👁️' }
      ]
    },
    {
      name: 'Phê duyệt hợp đồng',
      permissions: [
        { key: PERMISSIONS.APPROVAL_APPROVE, label: 'Phê duyệt', icon: '✅' },
        { key: PERMISSIONS.APPROVAL_REJECT, label: 'Từ chối', icon: '❌' },
        { key: PERMISSIONS.APPROVAL_REQUEST_CHANGES, label: 'Yêu cầu sửa', icon: '📝' },
        { key: PERMISSIONS.APPROVAL_VIEW, label: 'Xem trạng thái', icon: '👁️' }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🎭 Demo Role-Based Permissions
        </h1>
        <p className="text-gray-600">
          Chọn role để xem các chức năng và quyền hạn tương ứng
        </p>
      </div>

      {/* Role Selector */}
      <RoleSelector currentRole={currentRole} onRoleChange={handleRoleChange} />

      {/* Current User Info */}
      <Card className="border-2 border-green-200">
        <CardHeader>
          <CardTitle>👤 Thông tin người dùng hiện tại</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-4">
            <div className="text-4xl">{ROLE_ICONS[currentRole]}</div>
            <div className="flex-1">
              <p className="text-sm text-gray-600">Tên:</p>
              <p className="font-semibold text-lg">{currentUser.name}</p>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600">Email:</p>
              <p className="font-semibold">{currentUser.email}</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Roles:</p>
            <div className="flex gap-2">
              {currentUser.roles.map(role => (
                <Badge key={role} className="bg-blue-100 text-blue-800">
                  {role}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">
              Tổng số quyền: <span className="font-bold text-blue-600">{permissions.length}</span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Permissions Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>🔐 Ma trận quyền hạn</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {permissionCategories.map(category => (
            <div key={category.name}>
              <h3 className="font-semibold text-gray-900 mb-3">{category.name}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {category.permissions.map(perm => {
                  const hasAccess = hasPermission(perm.key)
                  return (
                    <div
                      key={perm.key}
                      className={`p-4 rounded-lg border-2 ${
                        hasAccess
                          ? 'border-green-300 bg-green-50'
                          : 'border-gray-200 bg-gray-50 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{perm.icon}</span>
                          <span className="font-medium text-sm">{perm.label}</span>
                        </div>
                        {hasAccess ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{perm.key}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Action Buttons Demo */}
      <Card>
        <CardHeader>
          <CardTitle>🎯 Demo các hành động theo quyền</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Create Repository */}
            <PermissionGuard
              permission={PERMISSIONS.REPO_CREATE}
              fallback={
                <Button disabled className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Tạo Repository
                </Button>
              }
            >
              <Button className="w-full bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Tạo Repository
              </Button>
            </PermissionGuard>

            {/* Edit Workflow */}
            <PermissionGuard
              permission={PERMISSIONS.WORKFLOW_EDIT}
              fallback={
                <Button disabled className="w-full">
                  <Edit className="w-4 h-4 mr-2" />
                  Sửa Workflow
                </Button>
              }
            >
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                <Edit className="w-4 h-4 mr-2" />
                Sửa Workflow
              </Button>
            </PermissionGuard>

            {/* Delete Organization */}
            <PermissionGuard
              permission={PERMISSIONS.ORG_DELETE}
              fallback={
                <Button disabled className="w-full">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Xóa Tổ chức
                </Button>
              }
            >
              <Button className="w-full bg-red-600 hover:bg-red-700">
                <Trash2 className="w-4 h-4 mr-2" />
                Xóa Tổ chức
              </Button>
            </PermissionGuard>

            {/* View Only */}
            <PermissionGuard permission={PERMISSIONS.APPROVAL_VIEW}>
              <Button className="w-full bg-gray-600 hover:bg-gray-700">
                <Eye className="w-4 h-4 mr-2" />
                Xem Phê duyệt
              </Button>
            </PermissionGuard>
          </div>

          {/* Role-based Content */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <RoleBasedContent
              roleContent={{
                'owner': (
                  <p className="text-blue-800">
                    👑 <strong>Chủ sở hữu:</strong> Bạn có toàn quyền quản lý tổ chức này!
                  </p>
                ),
                'Nhân viên kiểm tra': (
                  <p className="text-green-800">
                    📋 <strong>Nhân viên kiểm tra:</strong> Bạn có thể kiểm tra và phê duyệt hồ sơ ban đầu.
                  </p>
                ),
                'Trưởng phòng': (
                  <p className="text-orange-800">
                    👔 <strong>Trưởng phòng:</strong> Bạn có thể phê duyệt hợp đồng của phòng ban.
                  </p>
                ),
                'Giám đốc': (
                  <p className="text-red-800">
                    💼 <strong>Giám đốc:</strong> Bạn có thể phê duyệt hợp đồng giá trị cao.
                  </p>
                ),
                'Thành viên HĐQT': (
                  <p className="text-indigo-800">
                    🎯 <strong>Thành viên HĐQT:</strong> Bạn tham gia phê duyệt hợp đồng đặc biệt quan trọng.
                  </p>
                )
              }}
              defaultContent={
                <p className="text-gray-600">
                  👤 <strong>Thành viên:</strong> Bạn có quyền xem thông tin cơ bản.
                </p>
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
