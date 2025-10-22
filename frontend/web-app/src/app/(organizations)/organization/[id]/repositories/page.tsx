'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'react-hot-toast'
import { FolderOpen, Plus, Trash2, Edit, FileText, TrendingUp } from '@/lib/icons'

interface Repository {
  id: string
  name: string
  description: string
  type: string
  visibility: string
  contract_count: number
  total_value: number
  currency: string
  last_activity_at: string
}

export default function RepositoriesPage() {
  const params = useParams()
  const router = useRouter()
  const organizationId = params.id as string
  
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newRepo, setNewRepo] = useState({ name: '', description: '', type: 'contracts' })

  useEffect(() => {
    loadRepositories()
  }, [organizationId])

  const loadRepositories = async () => {
    try {
      setLoading(true)
      
      // Try real API first, fallback to mock
      try {
        const response = await fetch(
          `http://localhost:8082/api/organizations/${organizationId}/repositories`
        )
        if (!response.ok) throw new Error('API failed')
        const data = await response.json()
        setRepositories(data)
      } catch (apiError) {
        console.log('Using mock repositories data')
        const { mockOrganizationAPI } = await import('@/lib/mock/organization-mock')
        const data = await mockOrganizationAPI.getRepositories(organizationId)
        setRepositories(data as any)
      }
    } catch (error) {
      console.error('Error loading repositories:', error)
      toast.error('Không thể tải danh sách repositories')
    } finally {
      setLoading(false)
    }
  }

  const createRepository = async () => {
    if (!newRepo.name) {
      toast.error('Vui lòng nhập tên repository')
      return
    }

    try {
      // Try real API first, fallback to mock
      try {
        const response = await fetch(
          `http://localhost:8082/api/organizations/${organizationId}/repositories`,
          {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'X-User-Id': 'current-user-id'
            },
            body: JSON.stringify(newRepo)
          }
        )
        if (!response.ok) throw new Error('API failed')
      } catch (apiError) {
        console.log('Using mock create repository')
        const { mockOrganizationAPI } = await import('@/lib/mock/organization-mock')
        await mockOrganizationAPI.createRepository(organizationId, newRepo)
      }
      
      toast.success('Tạo repository thành công!')
      setShowCreateDialog(false)
      setNewRepo({ name: '', description: '', type: 'contracts' })
      loadRepositories()
    } catch (error) {
      console.error('Error creating repository:', error)
      toast.error('Có lỗi xảy ra')
    }
  }

  const deleteRepository = async (repoId: string) => {
    if (!confirm('Bạn có chắc muốn xóa repository này?')) return

    try {
      // Try real API first, fallback to mock
      try {
        const response = await fetch(
          `http://localhost:8082/api/organizations/${organizationId}/repositories/${repoId}`,
          {
            method: 'DELETE',
            headers: { 'X-User-Id': 'current-user-id' }
          }
        )
        if (!response.ok) throw new Error('API failed')
      } catch (apiError) {
        console.log('Using mock delete repository')
        const { mockOrganizationAPI } = await import('@/lib/mock/organization-mock')
        await mockOrganizationAPI.deleteRepository(organizationId, repoId)
      }
      
      toast.success('Xóa repository thành công!')
      loadRepositories()
    } catch (error) {
      console.error('Error deleting repository:', error)
      toast.error('Có lỗi xảy ra')
    }
  }

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)}B`
    } else if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`
    }
    return value.toLocaleString()
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      contracts: 'bg-blue-100 text-blue-800',
      legal: 'bg-purple-100 text-purple-800',
      hr: 'bg-green-100 text-green-800',
      finance: 'bg-yellow-100 text-yellow-800',
      sales: 'bg-pink-100 text-pink-800',
      custom: 'bg-gray-100 text-gray-800'
    }
    return colors[type] || colors.custom
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Repositories</h1>
            <p className="text-gray-600 mt-1">Quản lý kho lưu trữ hợp đồng</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Tạo Repository
          </Button>
        </div>
      </div>

      {/* Repositories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {repositories.map((repo) => (
          <Card key={repo.id} className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-200">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FolderOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{repo.name}</CardTitle>
                    <Badge className={`mt-1 ${getTypeColor(repo.type)}`}>
                      {repo.type}
                    </Badge>
                  </div>
                </div>
              </div>
              <CardDescription className="mt-2">{repo.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <FileText className="w-4 h-4" />
                    Hợp đồng
                  </div>
                  <p className="text-2xl font-bold">{repo.contract_count}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <TrendingUp className="w-4 h-4" />
                    Tổng giá trị
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(repo.total_value)}
                  </p>
                  <p className="text-xs text-gray-500">{repo.currency}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => router.push(`/organization/${organizationId}/repositories/${repo.id}`)}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Xem
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => deleteRepository(repo.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {repositories.length === 0 && (
          <div className="col-span-full">
            <Card>
              <CardContent className="p-12 text-center">
                <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Chưa có repository nào
                </h3>
                <p className="text-gray-600 mb-4">
                  Tạo repository đầu tiên để bắt đầu tổ chức hợp đồng
                </p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Tạo Repository
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tạo Repository Mới</DialogTitle>
            <DialogDescription>
              Tạo kho lưu trữ để tổ chức hợp đồng theo nhóm
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên Repository</Label>
              <Input
                id="name"
                placeholder="Ví dụ: Hợp đồng mua bán"
                value={newRepo.name}
                onChange={(e) => setNewRepo({ ...newRepo, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Input
                id="description"
                placeholder="Mô tả ngắn gọn về repository"
                value={newRepo.description}
                onChange={(e) => setNewRepo({ ...newRepo, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Loại</Label>
              <select
                id="type"
                className="w-full px-3 py-2 border rounded-md"
                value={newRepo.type}
                onChange={(e) => setNewRepo({ ...newRepo, type: e.target.value })}
              >
                <option value="contracts">Hợp đồng</option>
                <option value="legal">Pháp lý</option>
                <option value="hr">Nhân sự</option>
                <option value="finance">Tài chính</option>
                <option value="sales">Kinh doanh</option>
                <option value="custom">Tùy chỉnh</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Hủy
            </Button>
            <Button onClick={createRepository}>Tạo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
