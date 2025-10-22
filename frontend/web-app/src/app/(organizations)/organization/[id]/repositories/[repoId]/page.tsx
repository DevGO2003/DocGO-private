'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/Button'
import { toast } from 'react-hot-toast'
import { ArrowLeft, FileText, TrendingUp, Calendar, User } from '@/lib/icons'
import { WorkflowStatus } from '@/components/organization'

interface Contract {
  id: string
  fileName: string
  totalValue: number
  currency: string
  createdAt: string
  createdBy: string
  approvalStatus: string
  workflowInstanceId?: string
}

interface Repository {
  id: string
  name: string
  description: string
  type: string
  contract_count: number
  total_value: number
  currency: string
}

export default function RepositoryDetailPage() {
  const params = useParams()
  const router = useRouter()
  const organizationId = params.id as string
  const repositoryId = params.repoId as string
  
  const [repository, setRepository] = useState<Repository | null>(null)
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedContract, setSelectedContract] = useState<string | null>(null)

  useEffect(() => {
    loadRepository()
    loadContracts()
  }, [repositoryId])

  const loadRepository = async () => {
    try {
      const response = await fetch(
        `http://localhost:8082/api/organizations/${organizationId}/repositories/${repositoryId}`
      )
      const data = await response.json()
      setRepository(data)
    } catch (error) {
      console.error('Error loading repository:', error)
      toast.error('Không thể tải thông tin repository')
    }
  }

  const loadContracts = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `http://localhost:8082/api/organizations/${organizationId}/repositories/${repositoryId}/contracts`
      )
      const data = await response.json()
      setContracts(data)
    } catch (error) {
      console.error('Error loading contracts:', error)
      toast.error('Không thể tải danh sách hợp đồng')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-blue-100 text-blue-800'
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

  if (!repository) {
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
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push(`/organization/${organizationId}/repositories`)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{repository.name}</h1>
            <p className="text-gray-600 mt-1">{repository.description}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng hợp đồng</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{repository.contract_count}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng giá trị</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(repository.total_value)}
            </div>
            <p className="text-xs text-muted-foreground">{repository.currency}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Loại</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className="text-sm">{repository.type}</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Contracts List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Danh sách hợp đồng</h2>
          
          {loading ? (
            <Card>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ) : contracts.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Chưa có hợp đồng nào
                </h3>
                <p className="text-gray-600">
                  Thêm hợp đồng vào repository này để bắt đầu
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {contracts.map((contract) => (
                <Card
                  key={contract.id}
                  className={`cursor-pointer hover:shadow-md transition-shadow ${
                    selectedContract === contract.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedContract(contract.id)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base">{contract.fileName}</CardTitle>
                        <CardDescription className="mt-1">
                          <div className="flex items-center gap-2 text-sm">
                            <User className="w-3 h-3" />
                            {contract.createdBy}
                          </div>
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(contract.approvalStatus)}>
                        {contract.approvalStatus === 'approved' && 'Đã duyệt'}
                        {contract.approvalStatus === 'pending' && 'Chờ duyệt'}
                        {contract.approvalStatus === 'rejected' && 'Từ chối'}
                        {contract.approvalStatus === 'draft' && 'Nháp'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Giá trị:</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(contract.totalValue)} {contract.currency}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-3 h-3" />
                      {new Date(contract.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Workflow Status */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Trạng thái phê duyệt</h2>
          
          {selectedContract ? (
            <WorkflowStatus
              contractId={selectedContract}
              onApprove={() => {
                toast.success('Đã phê duyệt hợp đồng')
                loadContracts()
              }}
              onReject={() => {
                toast.success('Đã từ chối hợp đồng')
                loadContracts()
              }}
              onRequestChanges={() => {
                toast.success('Đã yêu cầu chỉnh sửa')
                loadContracts()
              }}
            />
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  Chọn một hợp đồng để xem trạng thái phê duyệt
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
