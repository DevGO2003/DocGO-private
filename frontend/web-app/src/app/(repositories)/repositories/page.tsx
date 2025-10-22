'use client'

import React, { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout'
import { HeaderPanel, PrimaryContent, GradientButton } from '@/components/ui'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { documentAPI, Repository } from '@/lib/api'
import toast from 'react-hot-toast'
import {
  PlusIcon,
  FolderIcon,
  UsersIcon,
  DocumentTextIcon,
  TrashIcon,
  PencilIcon,
  LockClosedIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'

export default function RepositoriesPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: false,
    tags: [] as string[]
  })

  useEffect(() => {
    loadRepositories()
  }, [])

  const loadRepositories = async () => {
    try {
      setLoading(true)
      const response = await documentAPI.getAllRepositories({
        page: 0,
        size: 100,
        sortBy: 'createdAt',
        sortDirection: 'desc'
      })
      
      if (response.data?.data?.content) {
        setRepositories(response.data.data.content)
      } else if (Array.isArray(response.data?.data)) {
        setRepositories(response.data.data)
      }
    } catch (error: any) {
      console.error('Error loading repositories:', error)
      toast.error('Không thể tải danh sách kho tài liệu')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên kho tài liệu')
      return
    }

    try {
      const createData = {
        name: formData.name,
        description: formData.description,
        isPublic: formData.isPublic,
        tags: formData.tags
      }

      const response = await documentAPI.createRepository(createData)
      
      if (response.data?.data) {
        toast.success('Tạo kho tài liệu thành công')
        setShowCreateModal(false)
        setFormData({ name: '', description: '', isPublic: false, tags: [] })
        loadRepositories()
      }
    } catch (error: any) {
      console.error('Error creating repository:', error)
      toast.error(error.response?.data?.description || 'Không thể tạo kho tài liệu')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa kho tài liệu này?')) return

    try {
      await documentAPI.deleteRepository(id)
      toast.success('Xóa kho tài liệu thành công')
      loadRepositories()
    } catch (error: any) {
      console.error('Error deleting repository:', error)
      toast.error('Không thể xóa kho tài liệu')
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const getCurrentUser = () => {
    // Nếu có user từ auth, dùng username hoặc email
    if (user) {
      return user.username || user.email || 'admin'
    }
    // Chưa có auth hoàn chỉnh, dùng admin mặc định
    return 'admin'
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 p-5">
        <div className="max-w-7xl mx-auto space-y-5">
          <HeaderPanel
            title="Kho tài liệu"
            subtitle={`Quản lý các kho tài liệu của bạn • Người dùng: ${getCurrentUser()}`}
            breadcrumbs={[
              { label: 'Trang chủ', href: '/dashboard' },
              { label: 'Kho tài liệu', current: true }
            ]}
            gradientFrom="blue-500"
            gradientTo="indigo-600"
            right={
              <div className="flex items-center gap-2">
                <GradientButton onClick={() => setShowCreateModal(true)} size="sm">
                  <PlusIcon className="h-5 w-5" />
                  Tạo kho mới
                </GradientButton>
              </div>
            }
          />

          <PrimaryContent>
            <div className="space-y-5">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Đang tải...</p>
                </div>
              ) : repositories.length === 0 ? (
                <div className="text-center py-12">
                  <FolderIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có kho tài liệu</h3>
                  <p className="text-gray-600 mb-4">Tạo kho tài liệu đầu tiên để bắt đầu quản lý tài liệu</p>
                  <GradientButton onClick={() => setShowCreateModal(true)}>
                    <PlusIcon className="h-5 w-5" />
                    Tạo kho mới
                  </GradientButton>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {repositories.map((repo) => (
                    <div
                      key={repo.id}
                      className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition cursor-pointer"
                      onClick={() => router.push(`/repositories/${repo.id}`)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 rounded-lg">
                            <FolderIcon className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{repo.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              {repo.isPublic ? (
                                <span className="flex items-center gap-1 text-xs text-green-600">
                                  <GlobeAltIcon className="h-3 w-3" />
                                  Công khai
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-xs text-gray-600">
                                  <LockClosedIcon className="h-3 w-3" />
                                  Riêng tư
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {repo.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{repo.description}</p>
                      )}

                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        <div className="flex items-center gap-1">
                          <DocumentTextIcon className="h-4 w-4" />
                          <span>{repo.fileCount} files</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <UsersIcon className="h-4 w-4" />
                          <span>{repo.memberCount} members</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t">
                        <span className="text-xs text-gray-500">{formatSize(repo.totalSize)}</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/repositories/${repo.id}/settings`)
                            }}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <PencilIcon className="h-4 w-4 text-gray-600" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(repo.id)
                            }}
                            className="p-1 hover:bg-red-100 rounded"
                          >
                            <TrashIcon className="h-4 w-4 text-red-600" />
                          </button>
                        </div>
                      </div>

                      {repo.ownerName && (
                        <div className="mt-2 pt-2 border-t">
                          <span className="text-xs text-gray-500">
                            Người tạo: <span className="font-medium">{repo.ownerName}</span>
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </PrimaryContent>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Tạo kho tài liệu mới</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên kho <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập tên kho tài liệu"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Mô tả về kho tài liệu"
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isPublic" className="text-sm text-gray-700">
                  Công khai (cho phép mọi người xem)
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <GradientButton onClick={handleCreate} className="flex-1">
                Tạo kho
              </GradientButton>
              <GradientButton
                onClick={() => {
                  setShowCreateModal(false)
                  setFormData({ name: '', description: '', isPublic: false, tags: [] })
                }}
                variant="secondary"
                className="flex-1"
              >
                Hủy
              </GradientButton>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
