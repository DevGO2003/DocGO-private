'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/label'
import { toast } from 'react-hot-toast'
import { ArrowLeft, Upload, FileText, DollarSign, Calendar, Building } from '@/lib/icons'

export default function CreateContractPage() {
  const params = useParams()
  const router = useRouter()
  const organizationId = params.id as string
  
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    fileName: '',
    contractType: 'purchase',
    totalValue: '',
    currency: 'VND',
    description: '',
    repositoryId: '',
    partnerName: '',
    startDate: '',
    endDate: ''
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
      setFormData(prev => ({ ...prev, fileName: file.name }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedFile) {
      toast.error('Vui lòng chọn file hợp đồng')
      return
    }

    if (!formData.totalValue || parseFloat(formData.totalValue) <= 0) {
      toast.error('Vui lòng nhập giá trị hợp đồng hợp lệ')
      return
    }

    try {
      setLoading(true)

      // Mock API call - Tạo hợp đồng và khởi tạo workflow
      const contractData = {
        ...formData,
        totalValue: parseFloat(formData.totalValue),
        organizationId,
        file: selectedFile,
        createdAt: new Date().toISOString(),
        status: 'pending_approval'
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500))

      console.log('Creating contract:', contractData)

      // Mock response
      const contractId = `contract-${Date.now()}`
      const workflowInstanceId = `wf-instance-${Date.now()}`

      toast.success('Tạo hợp đồng thành công! Đang khởi tạo quy trình phê duyệt...')

      // Redirect to contract detail with workflow
      setTimeout(() => {
        router.push(`/organization/${organizationId}/contracts/${contractId}`)
      }, 1000)

    } catch (error) {
      console.error('Error creating contract:', error)
      toast.error('Có lỗi xảy ra khi tạo hợp đồng')
    } finally {
      setLoading(false)
    }
  }

  const contractTypes = [
    { value: 'purchase', label: 'Hợp đồng mua bán', icon: '🛒' },
    { value: 'service', label: 'Hợp đồng dịch vụ', icon: '🔧' },
    { value: 'labor', label: 'Hợp đồng lao động', icon: '👔' },
    { value: 'lease', label: 'Hợp đồng thuê', icon: '🏠' },
    { value: 'other', label: 'Khác', icon: '📄' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push(`/organization/${organizationId}/contracts`)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">📝 Tạo hợp đồng mới</h1>
              <p className="text-gray-600 mt-1">
                Tải lên hợp đồng và hệ thống sẽ tự động khởi tạo quy trình phê duyệt
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload */}
          <Card className="border-2 border-dashed border-blue-300 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Tải lên file hợp đồng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-white hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {selectedFile ? (
                        <>
                          <FileText className="w-16 h-16 text-blue-600 mb-4" />
                          <p className="mb-2 text-lg font-semibold text-gray-700">
                            {selectedFile.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          <p className="text-xs text-blue-600 mt-2">Click để chọn file khác</p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-16 h-16 text-gray-400 mb-4" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Click để tải lên</span> hoặc kéo thả file
                          </p>
                          <p className="text-xs text-gray-500">PDF, DOC, DOCX (MAX. 10MB)</p>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileSelect}
                    />
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contract Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Thông tin hợp đồng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Contract Type */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Loại hợp đồng *
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {contractTypes.map(type => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, contractType: type.value }))}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        formData.contractType === type.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{type.icon}</div>
                      <div className="text-sm font-medium">{type.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Partner Name */}
              <div>
                <Label htmlFor="partnerName" className="text-sm font-medium text-gray-700">
                  Tên đối tác *
                </Label>
                <div className="mt-1 relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="partnerName"
                    type="text"
                    required
                    placeholder="Công ty ABC..."
                    value={formData.partnerName}
                    onChange={(e) => setFormData(prev => ({ ...prev, partnerName: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Total Value */}
              <div>
                <Label htmlFor="totalValue" className="text-sm font-medium text-gray-700">
                  Giá trị hợp đồng *
                </Label>
                <div className="mt-1 flex gap-2">
                  <div className="flex-1 relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="totalValue"
                      type="number"
                      required
                      placeholder="150000000"
                      value={formData.totalValue}
                      onChange={(e) => setFormData(prev => ({ ...prev, totalValue: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="VND">VND</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
                {formData.totalValue && (
                  <p className="mt-1 text-sm text-gray-600">
                    ≈ {parseFloat(formData.totalValue).toLocaleString('vi-VN')} {formData.currency}
                  </p>
                )}
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate" className="text-sm font-medium text-gray-700">
                    Ngày bắt đầu
                  </Label>
                  <div className="mt-1 relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="endDate" className="text-sm font-medium text-gray-700">
                    Ngày kết thúc
                  </Label>
                  <div className="mt-1 relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                  Mô tả
                </Label>
                <textarea
                  id="description"
                  rows={4}
                  placeholder="Mô tả chi tiết về hợp đồng..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </CardContent>
          </Card>

          {/* Workflow Preview */}
          {formData.totalValue && (
            <Card className="border-2 border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  ⚡ Quy trình phê duyệt sẽ được khởi tạo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-gray-700">
                    Dựa trên giá trị hợp đồng <strong>{parseFloat(formData.totalValue).toLocaleString('vi-VN')} {formData.currency}</strong>, 
                    các bước phê duyệt sau sẽ được kích hoạt:
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-green-300">
                      <span className="text-2xl">📋</span>
                      <div>
                        <p className="font-semibold text-sm">Bước 1: Kiểm tra hồ sơ</p>
                        <p className="text-xs text-gray-600">Nhân viên kiểm tra</p>
                      </div>
                    </div>
                    {parseFloat(formData.totalValue) >= 50000000 && (
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-green-300">
                        <span className="text-2xl">👔</span>
                        <div>
                          <p className="font-semibold text-sm">Bước 2: Trưởng phòng phê duyệt</p>
                          <p className="text-xs text-gray-600">Trưởng phòng</p>
                        </div>
                      </div>
                    )}
                    {parseFloat(formData.totalValue) >= 500000000 && (
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-green-300">
                        <span className="text-2xl">💼</span>
                        <div>
                          <p className="font-semibold text-sm">Bước 3: Giám đốc phê duyệt</p>
                          <p className="text-xs text-gray-600">Giám đốc</p>
                        </div>
                      </div>
                    )}
                    {parseFloat(formData.totalValue) >= 2000000000 && (
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-green-300">
                        <span className="text-2xl">🎯</span>
                        <div>
                          <p className="font-semibold text-sm">Bước 4: Hội đồng quản trị</p>
                          <p className="text-xs text-gray-600">Thành viên HĐQT (cần 3 người)</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/organization/${organizationId}/contracts`)}
              className="flex-1"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={loading || !selectedFile}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Tạo hợp đồng & Khởi tạo phê duyệt
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
