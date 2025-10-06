'use client'

import React, { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout'
import { useParams } from 'next/navigation'
import { contractAPI, fileStorageAPI } from '@/lib/api'
import { useTranslation } from '@/hooks/useTranslation'
import { translateContractType, translateContractStatus, translateContractTag } from '@/utils/tagTranslations'
import FileDetailView from '@/components/FileDetailView'

export default function ContractDetailPage() {
  const params = useParams() as { id: string }
  const { t } = useTranslation()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'overview' | 'summary' | 'files'>('overview')
  const [contractFiles, setContractFiles] = useState<any[]>([])
  const [selectedFile, setSelectedFile] = useState<any>(null)

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true)
      try {
        setError('')
        const res = await contractAPI.getContract(String(params.id))
        const c: any = res.data?.data
        const mapped = {
          id: c.id,
          title: c.title || c.contractNumber || `Contract ${c.id}`,
          description: c.object || c.description || '',
          status: c.status || 'DRAFT',
          contractType: c.contractType || 'Other',
          tags: c.tags || [],
          parties: (c.parties || []).map((p: any) => ({
            name: p.name || '',
            role: p.role || '',
            representative: p.representative,
            taxCode: p.taxCode,
            contact: p.contact,
            address: p.address,
          })),
          effectiveDate: c.effectiveDate || '',
          expiryDate: c.expiryDate || '',
          paymentDetails: {
            totalValue: Number(c.paymentDetails?.totalValue || 0),
            currency: c.paymentDetails?.currency || 'VND',
            schedule: c.paymentDetails?.schedule || '',
            paymentMethod: c.paymentDetails?.paymentMethod || '',
          },
          keyClauses: c.keyClauses || [],
          unfavorableClauses: c.unfavorableClauses || [],
          reminders: c.reminders || [],
          riskAssessment: c.riskAssessment || { riskLevel: 'LOW', riskFactors: [], mitigationMeasures: [] },
          complianceStatus: c.complianceStatus || { status: 'COMPLIANT', issues: [], recommendations: [] },
          content: c.content || c.object || '',
        }
        setData(mapped)
        
        // Fetch contract files
        try {
          const filesResponse = await fileStorageAPI.getFiles()
          if (filesResponse.data?.statusCode === 200) {
            setContractFiles(filesResponse.data.data?.content || [])
          }
        } catch (fileError) {
          console.error('Error fetching contract files:', fileError)
        }
      } catch (e: any) {
        setError('Lỗi kết nối máy chủ')
        setData(null)
      } finally {
        setLoading(false)
      }
    }
    fetchDetail()
  }, [params.id])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-6 text-red-600">{error}</div>
      </DashboardLayout>
    )
  }

  if (!data) {
    return (
      <DashboardLayout>
        <div className="p-6">Không tìm thấy hợp đồng.</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Fancy Header */}
        <div className="relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6 shadow-sm">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">{data.title}</h1>
              <p className="text-gray-600">Mã: HD-{data.id} · Loại: {translateContractType(data.contractType, t)}</p>
            </div>
            <div className="flex gap-2">
              <span className={`px-3 py-1 text-sm rounded-full border ${badgeClass(data.status)}`}>{translateContractStatus(data.status, t)}</span>
              <span className="px-3 py-1 text-sm rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">{translateContractType(data.contractType, t)}</span>
            </div>
          </div>
          <div className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-indigo-200/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-purple-200/30 blur-3xl" />
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/80 backdrop-blur rounded-2xl border border-gray-200 shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-3 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-indigo-500 text-indigo-700'
                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
                }`}
              >
                Tổng quan
              </button>
              <button
                onClick={() => setActiveTab('summary')}
                className={`py-4 px-3 border-b-2 font-medium text-sm ${
                  activeTab === 'summary'
                    ? 'border-indigo-500 text-indigo-700'
                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
                }`}
              >
                Tóm tắt & Files
              </button>
              <button
                onClick={() => setActiveTab('files')}
                className={`py-4 px-3 border-b-2 font-medium text-sm ${
                  activeTab === 'files'
                    ? 'border-indigo-500 text-indigo-700'
                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
                }`}
              >
                Files ({contractFiles.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-white/80 backdrop-blur rounded-2xl border border-gray-200 p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Hành động:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium shadow-sm">
                📝 Chỉnh sửa
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium shadow-sm">
                📤 Gửi duyệt
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium shadow-sm">
                📋 Tạo phiên bản
              </button>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-medium shadow-sm">
                ✍️ Gửi ký
              </button>
              <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm font-medium shadow-sm">
                📄 Tải PDF
              </button>
              <button className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition text-sm font-medium shadow-sm">
                💬 Bình luận
              </button>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium shadow-sm">
                🗑️ Xóa
              </button>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Parties */}
            <div className="bg-white/80 backdrop-blur rounded-2xl border border-gray-200 p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Các bên tham gia</h3>
              <div className="divide-y">
                {data.parties?.map((p: any, idx: number) => (
                  <div key={idx} className="py-3 flex items-start justify-between gap-4">
                    <div>
                      <div className="font-medium text-gray-900">{p.name}</div>
                      <div className="text-sm text-gray-600">Vai trò: {p.role}</div>
                      {p.representative && <div className="text-sm text-gray-600">Đại diện: {p.representative}</div>}
                      {p.address && <div className="text-sm text-gray-600">Địa chỉ: {p.address}</div>}
                    </div>
                    <div className="text-right text-sm text-gray-600">
                      {p.taxCode && <div>MST: {p.taxCode}</div>}
                      {p.contact && <div>Liên hệ: {p.contact}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="bg-white/80 backdrop-blur rounded-2xl border border-gray-200 p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Nội dung hợp đồng</h3>
              <pre className="whitespace-pre-wrap text-sm text-gray-700">{data.content}</pre>
            </div>

            {/* Clauses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/80 backdrop-blur rounded-2xl border border-gray-200 p-5 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-3">Điều khoản chính</h3>
                <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                  {data.keyClauses?.map((c: any, i: number) => (
                    <li key={i}><span className="font-medium">{c.name}:</span> {c.description}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-white/80 backdrop-blur rounded-2xl border border-gray-200 p-5 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-3">Điều khoản bất lợi</h3>
                <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                  {data.unfavorableClauses?.map((c: any, i: number) => (
                    <li key={i}><span className="font-medium">{c.clauseName}:</span> {c.description}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Timing & Payment */}
            <div className="bg-white/80 backdrop-blur rounded-2xl border border-gray-200 p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Thời hạn & Thanh toán</h3>
              <div className="text-sm text-gray-700 space-y-2">
                <div className="flex justify-between"><span>Hiệu lực</span><span>{data.effectiveDate}</span></div>
                <div className="flex justify-between"><span>Hết hạn</span><span>{data.expiryDate}</span></div>
                <div className="flex justify-between"><span>Tổng giá trị</span><span>{data.paymentDetails?.totalValue?.toLocaleString('vi-VN')} {data.paymentDetails?.currency}</span></div>
                <div className="flex justify-between"><span>Lịch thanh toán</span><span>{data.paymentDetails?.schedule}</span></div>
              </div>
            </div>

            {/* Risk & Compliance */}
            <div className="bg-white/80 backdrop-blur rounded-2xl border border-gray-200 p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Rủi ro & Tuân thủ</h3>
              <div className="text-sm text-gray-700 space-y-2">
                <div><span className="font-medium">Mức rủi ro:</span> {data.riskAssessment?.riskLevel}</div>
                <div><span className="font-medium">Yếu tố rủi ro:</span> {(data.riskAssessment?.riskFactors||[]).join(', ')}</div>
                <div><span className="font-medium">Biện pháp:</span> {(data.riskAssessment?.mitigationMeasures||[]).join(', ')}</div>
                <div><span className="font-medium">Tuân thủ:</span> {data.complianceStatus?.status}</div>
              </div>
            </div>

            {/* Reminders */}
            <div className="bg-white/80 backdrop-blur rounded-2xl border border-gray-200 p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3">Nhắc nhở</h3>
              <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                {data.reminders?.map((r: any, i: number) => (
                  <li key={i}><span className="font-medium">{r.type}</span> — {r.date}: {r.content}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        )}

        {activeTab === 'summary' && (
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tóm tắt hợp đồng</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Thông tin cơ bản</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Tiêu đề:</span> {data.title}</div>
                    <div><span className="font-medium">Loại:</span> {translateContractType(data.contractType, t)}</div>
                    <div><span className="font-medium">Trạng thái:</span> {translateContractStatus(data.status, t)}</div>
                    <div><span className="font-medium">Hiệu lực:</span> {data.effectiveDate}</div>
                    <div><span className="font-medium">Hết hạn:</span> {data.expiryDate}</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Thanh toán</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Tổng giá trị:</span> {data.paymentDetails?.totalValue?.toLocaleString('vi-VN')} {data.paymentDetails?.currency}</div>
                    <div><span className="font-medium">Lịch thanh toán:</span> {data.paymentDetails?.schedule}</div>
                    <div><span className="font-medium">Phương thức:</span> {data.paymentDetails?.paymentMethod}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Files liên quan</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {contractFiles.slice(0, 6).map((file) => (
                  <div
                    key={file.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedFile({
                      id: file.id,
                      name: file.fileName || 'Unknown File',
                      size: file.fileSize || 0,
                      type: file.fileType || 'application/octet-stream',
                      uploadDate: file.uploadDate || new Date().toISOString().split('T')[0],
                      lastModified: file.lastModified || new Date().toISOString().split('T')[0],
                      storagePath: file.storagePath || 'Default',
                      tags: file.tags || [],
                      description: file.description || '',
                      metadata: file.metadata || {}
                    })}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{file.fileName}</p>
                        <p className="text-xs text-gray-500">{file.fileType}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {contractFiles.length > 6 && (
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setActiveTab('files')}
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    Xem tất cả {contractFiles.length} files
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'files' && (
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Files liên quan ({contractFiles.length})</h3>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm">
                  Upload File
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {contractFiles.map((file) => (
                  <div
                    key={file.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedFile({
                      id: file.id,
                      name: file.fileName || 'Unknown File',
                      size: file.fileSize || 0,
                      type: file.fileType || 'application/octet-stream',
                      uploadDate: file.uploadDate || new Date().toISOString().split('T')[0],
                      lastModified: file.lastModified || new Date().toISOString().split('T')[0],
                      storagePath: file.storagePath || 'Default',
                      tags: file.tags || [],
                      description: file.description || '',
                      metadata: file.metadata || {}
                    })}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{file.fileName}</p>
                        <p className="text-xs text-gray-500">{file.fileType}</p>
                        <p className="text-xs text-gray-400">
                          {file.fileSize ? (file.fileSize / 1024 / 1024).toFixed(2) + ' MB' : 'Unknown size'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {contractFiles.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Chưa có files nào</h4>
                  <p className="text-gray-500 mb-4">Upload files để quản lý tài liệu liên quan đến hợp đồng này</p>
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                    Upload File
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* File Detail Modal */}
        {selectedFile && (
          <FileDetailView
            file={selectedFile}
            onClose={() => setSelectedFile(null)}
            onSave={(fileData) => {
              // TODO: Implement save functionality
              console.log('Save file:', fileData)
              setSelectedFile(null)
            }}
            onDiscard={() => setSelectedFile(null)}
          />
        )}
      </div>
    </DashboardLayout>
  )
}

function badgeClass(status: string) {
  switch (status) {
    case 'DRAFT':
      return 'bg-gray-50 text-gray-700 border-gray-200'
    case 'PENDING_REVIEW':
      return 'bg-amber-50 text-amber-700 border-amber-200'
    case 'APPROVED':
      return 'bg-blue-50 text-blue-700 border-blue-200'
    case 'ACTIVE':
      return 'bg-green-50 text-green-700 border-green-200'
    case 'EXPIRED':
      return 'bg-rose-50 text-rose-700 border-rose-200'
    case 'TERMINATED':
      return 'bg-red-50 text-red-700 border-red-200'
    case 'ARCHIVED':
      return 'bg-slate-50 text-slate-700 border-slate-200'
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200'
  }
}
