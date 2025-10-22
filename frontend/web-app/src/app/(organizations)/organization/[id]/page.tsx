'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams, usePathname } from 'next/navigation'
import { organizationService } from '@/lib/services/organization-service'
import { UserOrganizationContext } from '@/types/organization-extended'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

export default function OrganizationDetailPage() {
  const router = useRouter()
  const params = useParams()
  const pathname = usePathname()
  const organizationId = params.id as string
  
  const [organization, setOrganization] = useState<UserOrganizationContext | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadOrganization = async () => {
      try {
        setLoading(true)
        
        // Try real API first, fallback to mock if auth is disabled
        try {
          const orgDetails = await organizationService.selectOrganization(organizationId)
          setOrganization(orgDetails)
        } catch (apiError) {
          console.log('Using mock data (auth disabled)')
          // Import mock data dynamically
          const { mockOrganizationAPI } = await import('@/lib/mock/organization-mock')
          const orgDetails = await mockOrganizationAPI.selectOrganization(organizationId)
          setOrganization(orgDetails as any)
        }
      } catch (error) {
        console.error('Error loading organization:', error)
        toast.error('Không thể tải thông tin tổ chức')
        router.push('/organization/list')
      } finally {
        setLoading(false)
      }
    }

    if (organizationId) {
      loadOrganization()
    }
  }, [organizationId, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <span className="text-gray-600 font-medium">Đang tải...</span>
        </div>
      </div>
    )
  }

  if (!organization) {
    return null
  }

  const navigationTabs = [
    { name: 'Tổng quan', href: `/organization/${organizationId}`, icon: '📊', exact: true },
    { name: 'Hợp đồng', href: `/organization/${organizationId}/contracts`, icon: '📄' },
    { name: 'Thành viên', href: `/organization/${organizationId}/members`, icon: '👥' },
    { name: 'Vai trò', href: `/organization/${organizationId}/roles`, icon: '🎭' },
    { name: 'Quyền hạn', href: `/organization/${organizationId}/permissions`, icon: '🔐' },
    { name: 'Workflow', href: `/organization/${organizationId}/workflow`, icon: '⚡' },
    { name: 'Repositories', href: `/organization/${organizationId}/repositories`, icon: '📁' },
    { name: 'Role Demo', href: `/organization/${organizationId}/role-demo`, icon: '🎭', badge: 'Demo' },
  ]

  const quickActions = [
    { 
      id: 'members', 
      label: 'Quản lý thành viên', 
      icon: '👥', 
      href: `/organization/${organizationId}/members`,
      description: 'Thêm, xóa và quản lý thành viên'
    },
    { 
      id: 'roles', 
      label: 'Vai trò & Quyền hạn', 
      icon: '🎭', 
      href: `/organization/${organizationId}/roles`,
      description: 'Cấu hình vai trò và phân quyền'
    },
    { 
      id: 'workflow', 
      label: 'Workflow', 
      icon: '⚡', 
      href: `/organization/${organizationId}/workflow`,
      description: 'Thiết lập quy trình phê duyệt'
    },
    { 
      id: 'repositories', 
      label: 'Repositories', 
      icon: '📁', 
      href: `/organization/${organizationId}/repositories`,
      description: 'Quản lý kho lưu trữ hợp đồng'
    },
  ]

  const isActiveTab = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href
    }
    return pathname?.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/organization/list"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Quay lại danh sách
          </Link>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{organization.name}</h1>
                  <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-full">
                    <span className="text-lg">
                      {organization.isOwner ? '👑' : organization.isAdmin ? '🛡️' : '👤'}
                    </span>
                    <span className="text-sm font-semibold text-blue-800">
                      {organization.isOwner ? 'Chủ sở hữu' : 
                       organization.isAdmin ? 'Quản trị viên' : 
                       'Thành viên'}
                    </span>
                  </div>
                </div>
                <p className="text-gray-600">
                  {organization.description || 'Quản lý tổ chức và thành viên'}
                </p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="mt-6 border-t border-gray-200 pt-4">
              <nav className="flex gap-2 overflow-x-auto">
                {navigationTabs.map((tab) => (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                      isActiveTab(tab.href, tab.exact)
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.name}</span>
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Hành động nhanh</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.id}
                href={action.href}
                className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 p-6 border border-gray-200"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                    {action.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {action.label}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {action.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Thống kê</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-600 mb-1">Tổng thành viên</div>
                  <div className="text-3xl font-bold text-gray-900">
                    {organization.stats?.totalMembers || 0}
                  </div>
                </div>
                <div className="text-4xl">👥</div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-600 mb-1">Nhóm chat</div>
                  <div className="text-3xl font-bold text-gray-900">
                    {organization.stats?.totalChatGroups || 0}
                  </div>
                </div>
                <div className="text-4xl">💬</div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-600 mb-1">Hoạt động gần đây</div>
                  <div className="text-3xl font-bold text-gray-900">
                    {organization.stats?.recentActivity || 0}
                  </div>
                </div>
                <div className="text-4xl">📊</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
