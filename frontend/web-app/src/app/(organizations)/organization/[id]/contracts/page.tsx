'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { toast } from 'react-hot-toast'
import { Plus, FileText, Calendar, User, DollarSign, CheckCircle2, Clock, XCircle } from '@/lib/icons'
import { MOCK_CONTRACTS } from '@/lib/mock/organization-mock'

export default function ContractsPage() {
  const params = useParams()
  const router = useRouter()
  const organizationId = params.id as string
  
  const [contracts, setContracts] = useState(MOCK_CONTRACTS)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         contract.createdBy.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || contract.approvalStatus === filterStatus
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="w-4 h-4" />
      case 'pending':
        return <Clock className="w-4 h-4" />
      case 'rejected':
        return <XCircle className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Đã duyệt'
      case 'pending': return 'Chờ duyệt'
      case 'rejected': return 'Từ chối'
      default: return status
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

  const stats = {
    total: contracts.length,
    pending: contracts.filter(c => c.approvalStatus === 'pending').length,
    approved: contracts.filter(c => c.approvalStatus === 'approved').length,
    rejected: contracts.filter(c => c.approvalStatus === 'rejected').length
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📄 Quản lý hợp đồng</h1>
            <p className="text-gray-600 mt-1">
              Tạo và theo dõi quy trình phê duyệt hợp đồng
            </p>
          </div>
          <Button
            onClick={() => router.push(`/organization/${organizationId}/contracts/create`)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tạo hợp đồng mới
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-2 border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng hợp đồng</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <FileText className="w-12 h-12 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-yellow-200 bg-yellow-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-800">Chờ duyệt</p>
                <p className="text-3xl font-bold text-yellow-900 mt-1">{stats.pending}</p>
              </div>
              <Clock className="w-12 h-12 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-800">Đã duyệt</p>
                <p className="text-3xl font-bold text-green-900 mt-1">{stats.approved}</p>
              </div>
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-800">Từ chối</p>
                <p className="text-3xl font-bold text-red-900 mt-1">{stats.rejected}</p>
              </div>
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Tìm kiếm hợp đồng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              {['all', 'pending', 'approved', 'rejected'].map(status => (
                <Button
                  key={status}
                  variant={filterStatus === status ? 'default' : 'outline'}
                  onClick={() => setFilterStatus(status)}
                  className="capitalize"
                >
                  {status === 'all' ? 'Tất cả' : getStatusText(status)}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contracts List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredContracts.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Chưa có hợp đồng nào
              </h3>
              <p className="text-gray-600 mb-4">
                Tạo hợp đồng mới để bắt đầu quy trình phê duyệt
              </p>
              <Button
                onClick={() => router.push(`/organization/${organizationId}/contracts/create`)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tạo hợp đồng đầu tiên
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredContracts.map((contract) => (
            <Card
              key={contract.id}
              className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
              onClick={() => router.push(`/organization/${organizationId}/contracts/${contract.id}`)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <FileText className="w-8 h-8 text-blue-600" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {contract.fileName}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={`${getStatusColor(contract.approvalStatus)} border flex items-center gap-1`}>
                            {getStatusIcon(contract.approvalStatus)}
                            {getStatusText(contract.approvalStatus)}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Giá trị:</span>
                        <span className="font-semibold text-green-600">
                          {formatCurrency(contract.totalValue)} {contract.currency}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Người tạo:</span>
                        <span className="font-medium">{contract.createdBy}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Ngày tạo:</span>
                        <span className="font-medium">
                          {new Date(contract.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="ml-4">
                    <Button
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/organization/${organizationId}/contracts/${contract.id}`)
                      }}
                    >
                      Xem chi tiết →
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
