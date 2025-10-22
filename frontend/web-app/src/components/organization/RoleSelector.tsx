/**
 * Role Selector Component
 * Component để chọn role hiện tại (for testing/demo)
 */

'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/Button'
import { ROLES, ROLE_DESCRIPTIONS, ROLE_COLORS, ROLE_ICONS, ROLE_PERMISSIONS } from '@/lib/constants/roles-permissions'

interface RoleSelectorProps {
  currentRole: string
  onRoleChange: (role: string) => void
}

export function RoleSelector({ currentRole, onRoleChange }: RoleSelectorProps) {
  const [showPermissions, setShowPermissions] = useState<string | null>(null)

  const workflowRoles = [
    ROLES.CONTRACT_REVIEWER,
    ROLES.DEPARTMENT_HEAD,
    ROLES.DIRECTOR,
    ROLES.BOARD_MEMBER
  ]

  const orgRoles = [
    ROLES.OWNER,
    ROLES.ADMIN,
    ROLES.MEMBER
  ]

  return (
    <Card className="border-2 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🎭 Chọn Role để Test
          <Badge className="bg-yellow-100 text-yellow-800">Demo Mode</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Organization Roles */}
        <div>
          <h3 className="font-semibold text-sm text-gray-700 mb-2">Organization Roles</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {orgRoles.map(role => (
              <button
                key={role}
                onClick={() => onRoleChange(role)}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  currentRole === role
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{ROLE_ICONS[role]}</span>
                  <span className="font-semibold text-sm">{role}</span>
                </div>
                <p className="text-xs text-gray-600">{ROLE_DESCRIPTIONS[role]}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Workflow Roles */}
        <div>
          <h3 className="font-semibold text-sm text-gray-700 mb-2">Workflow Roles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {workflowRoles.map(role => (
              <div key={role}>
                <button
                  onClick={() => onRoleChange(role)}
                  className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                    currentRole === role
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{ROLE_ICONS[role]}</span>
                      <span className="font-semibold text-sm">{role}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowPermissions(showPermissions === role ? null : role)
                      }}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      {showPermissions === role ? 'Ẩn' : 'Xem quyền'}
                    </button>
                  </div>
                  <p className="text-xs text-gray-600">{ROLE_DESCRIPTIONS[role]}</p>
                </button>
                
                {/* Permissions List */}
                {showPermissions === role && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Quyền hạn:</p>
                    <div className="space-y-1">
                      {ROLE_PERMISSIONS[role]?.map(permission => (
                        <div key={permission} className="flex items-center gap-2 text-xs">
                          <span className="text-green-600">✓</span>
                          <span className="text-gray-600">{permission}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Current Role Display */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Role hiện tại:</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl">{ROLE_ICONS[currentRole]}</span>
                <Badge className={ROLE_COLORS[currentRole]}>
                  {currentRole}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-600">Số quyền:</p>
              <p className="text-2xl font-bold text-blue-600">
                {ROLE_PERMISSIONS[currentRole]?.length || 0}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
