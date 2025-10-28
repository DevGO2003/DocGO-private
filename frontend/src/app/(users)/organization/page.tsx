'use client'

import { useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import OrganizationList from '@/components/organization/OrganizationList'
import ChatManagement from '@/components/organization/ChatManagement'
import MembersManagement from '@/components/organization/MembersManagement'
import RolesManagement from '@/components/organization/RolesManagement'
import PermissionsManagement from '@/components/organization/PermissionsManagement'

type TabType = 'overview' | 'chat' | 'members' | 'roles' | 'permissions'

export default function OrganizationPage() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string | null>(null)

  const handleOrganizationSelect = (organizationId: string | null) => {
    setSelectedOrganizationId(organizationId)
    if (organizationId && activeTab === 'overview') {
      setActiveTab('chat') // Auto-switch to chat tab
    }
  }

  const tabs = [
    { id: 'overview' as TabType, label: 'Tổng quan', icon: '📊' },
    { id: 'chat' as TabType, label: 'Trò chuyện', icon: '💬' },
    { id: 'members' as TabType, label: 'Thành viên', icon: '👥' },
    { id: 'roles' as TabType, label: 'Vai trò', icon: '🎭' },
    { id: 'permissions' as TabType, label: 'Quyền hạn', icon: '🔐' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Tổ chức</h1>
          <p className="mt-2 text-gray-600">
            Quản lý tổ chức, thành viên, vai trò và quyền hạn
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow">
          {activeTab === 'overview' && (
            <OrganizationList 
              onOrganizationSelect={handleOrganizationSelect}
              selectedOrganizationId={selectedOrganizationId}
            />
          )}
          
          {activeTab === 'chat' && (
            <ChatManagement 
              organizationId={selectedOrganizationId}
              onOrganizationSelect={setSelectedOrganizationId}
            />
          )}
          
          {activeTab === 'members' && (
            <MembersManagement 
              organizationId={selectedOrganizationId}
              onOrganizationSelect={setSelectedOrganizationId}
            />
          )}
          
          {activeTab === 'roles' && (
            <RolesManagement 
              organizationId={selectedOrganizationId}
              onOrganizationSelect={setSelectedOrganizationId}
            />
          )}
          
          {activeTab === 'permissions' && (
            <PermissionsManagement 
              organizationId={selectedOrganizationId}
              onOrganizationSelect={setSelectedOrganizationId}
            />
          )}
        </div>
      </div>
    </div>
  )
}

