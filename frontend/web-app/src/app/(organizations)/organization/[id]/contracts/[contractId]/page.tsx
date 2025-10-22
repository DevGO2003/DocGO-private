'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/Button'
import { toast } from 'react-hot-toast'
import { ArrowLeft, FileText, DollarSign, Calendar, User, Building, Download } from '@/lib/icons'
import { WorkflowStatus } from '@/components/organization'
import { MOCK_CONTRACTS } from '@/lib/mock/organization-mock'

export default function ContractDetailPage() {
  const params = useParams()
  const router = useRouter()
  const organizationId = params.id as string
  const contractId = params.contractId as string
  
  const [contract, setContract] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadContract()
  }, [contractId])

  const loadContract = async () => {
    try {
      setLoading(true)
      // Mock data
      const found = MOCK_CONTRACTS.find(c => c.id === contractId)
      if (found) {
        setContract(found)
      } else {
        toast.error('Không tìm thấy hợp đồng')
        router.push(`/organization/${organizationId}/contracts`)
      }
    } catch (error) {
      console.error('Error loading contract:', error)
      toast.error('Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Đã duyệt'
      case 'pending': return 'Chờ duyệt'
      case 'rejected': return 'Từ chối'
      default: return status
    }
  }

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

  if (!contract) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              onClick={() => router.push(`/organization/${organizationId}/contracts`)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{contract.fileName}</h1>
                  <Badge className={`${getStatusColor(contract.approvalStatus)} border mt-1`}>
                    {getStatusText(contract.approvalStatus)}
                  </Badge>
                </div>
              </div>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Download className="w-4 h-4 mr-2" />
              Tải xuống
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contract Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>📋 Thông tin hợp đồng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <DollarSign className="w-4 h-4" />
                      <span>Giá trị hợp đồng</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                      {contract.totalValue.toLocaleString('vi-VN')} {contract.currency}
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <User className="w-4 h-4" />
                      <span>Người tạo</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      {contract.createdBy}
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <Calendar className="w-4 h-4" />
                      <span>Ngày tạo</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      {new Date(contract.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <Building className="w-4 h-4" />
                      <span>Repository</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      {contract.repositoryId || 'Chưa phân loại'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Document Preview */}
            <Card>
              <CardHeader>
                <CardTitle>📄 Xem trước tài liệu</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-[4/3] bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium mb-2">
                      {contract.fileName}
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      Xem trước PDF sẽ hiển thị ở đây
                    </p>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Download className="w-4 h-4 mr-2" />
                      Tải xuống để xem
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Workflow Status */}
          <div className="lg:col-span-1">
            <WorkflowStatus
              contractId={contractId}
              onApprove={() => {
                toast.success('Đã phê duyệt hợp đồng!')
                loadContract()
              }}
              onReject={() => {
                toast.success('Đã từ chối hợp đồng!')
                loadContract()
              }}
              onRequestChanges={() => {
                toast.success('Đã yêu cầu chỉnh sửa!')
                loadContract()
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
