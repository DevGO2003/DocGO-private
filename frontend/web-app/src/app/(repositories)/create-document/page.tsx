'use client'

import React, { useState } from 'react'
import { DashboardLayout } from '@/components/layout'
import { HeaderPanel } from '@/components/ui'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function CreateDocumentPage() {
  const router = useRouter()
  
  // Manual Tab states (existing form states)
  const [title, setTitle] = useState('')
  const [creatorId, setCreatorId] = useState<string>('')
  const [contractType, setContractType] = useState<string>('')
  const [tags, setTags] = useState<string>('')
  const [object, setObject] = useState<string>('')
  const [effectiveDate, setEffectiveDate] = useState<string>('')
  const [term, setTerm] = useState<string>('')
  const [terminationConditions, setTerminationConditions] = useState<string>('')
  const [content, setContent] = useState<string>('')
  
  // Payment details
  const [paymentTotalValue, setPaymentTotalValue] = useState<string>('')
  const [paymentCurrency, setPaymentCurrency] = useState<string>('VND')
  const [paymentSchedule, setPaymentSchedule] = useState<string>('')
  const [paymentMethod, setPaymentMethod] = useState<string>('Chuyển khoản')
  
  // Dynamic arrays - using simple JSON input for now (easy to replace with backend)
  const [parties, setParties] = useState<string>('')
  const [keyClauses, setKeyClauses] = useState<string>('')
  const [favorableClauses, setFavorableClauses] = useState<string>('')
  const [unfavorableClauses, setUnfavorableClauses] = useState<string>('')
  const [reminders, setReminders] = useState<string>('')
  const [riskAssessment, setRiskAssessment] = useState<string>('')
  const [complianceStatus, setComplianceStatus] = useState<string>('')
  
  // UI state
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [responseData, setResponseData] = useState<any>(null)
  const [jsonErrors, setJsonErrors] = useState<{[key: string]: string}>({})
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage(null)
    setJsonErrors({})
    setSuccess(false)

    try {
      // Validate required fields
      if (!title.trim()) {
        setJsonErrors({ title: 'Tiêu đề là bắt buộc' })
        setSubmitting(false)
        return
      }
      if (!creatorId.trim()) {
        setJsonErrors({ creatorId: 'Creator ID là bắt buộc' })
        setSubmitting(false)
        return
      }

      // Create contract data
      const contractData = {
        title: title.trim(),
        creatorId: parseInt(creatorId),
        contractType: contractType.trim() || null,
        tags: tags.trim() || null,
        object: object.trim() || null,
        effectiveDate: effectiveDate || null,
        term: term.trim() || null,
        terminationConditions: terminationConditions.trim() || null,
        content: content.trim() || null,
        paymentTotalValue: paymentTotalValue.trim() || null,
        paymentCurrency: paymentCurrency,
        paymentSchedule: paymentSchedule.trim() || null,
        paymentMethod: paymentMethod,
        parties: parties.trim() || null,
        keyClauses: keyClauses.trim() || null,
        favorableClauses: favorableClauses.trim() || null,
        unfavorableClauses: unfavorableClauses.trim() || null,
        reminders: reminders.trim() || null,
        riskAssessment: riskAssessment.trim() || null,
        complianceStatus: complianceStatus.trim() || null
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setResponseData(contractData)
      setSuccess(true)
      setMessage('Hợp đồng đã được tạo thành công!')
      toast.success('Hợp đồng đã được tạo thành công!')
      
      // Reset form after success
      setTimeout(() => {
        setTitle('')
        setCreatorId('')
        setContractType('')
        setTags('')
        setObject('')
        setEffectiveDate('')
        setTerm('')
        setTerminationConditions('')
        setContent('')
        setPaymentTotalValue('')
        setPaymentCurrency('VND')
        setPaymentSchedule('')
        setPaymentMethod('Chuyển khoản')
        setParties('')
        setKeyClauses('')
        setFavorableClauses('')
        setUnfavorableClauses('')
        setReminders('')
        setRiskAssessment('')
        setComplianceStatus('')
        setSuccess(false)
        setMessage(null)
        setResponseData(null)
      }, 3000)

    } catch (error) {
      console.error('Error creating contract:', error)
      setMessage('Có lỗi xảy ra khi tạo hợp đồng. Vui lòng thử lại.')
      toast.error('Có lỗi xảy ra khi tạo hợp đồng')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        <HeaderPanel 
          title="Tạo tài liệu mới"
          description="Nhập thông tin chi tiết để khởi tạo tài liệu trong hệ thống"
        />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-green-800">Tạo tài liệu thành công!</h3>
                    <p className="text-green-700">Tài liệu đã được lưu vào hệ thống.</p>
                  </div>
                </div>
              </div>
            )}

            {message && !success && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-red-800">Có lỗi xảy ra</h3>
                    <p className="text-red-700">{message}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Thông tin cơ bản */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">Thông tin cơ bản</h2>
                        <p className="text-sm text-gray-600">Các trường bắt buộc để tạo tài liệu</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">Bắt buộc</span>
                  </div>
                </div>
                <div className="p-8 space-y-8">
                  <div className="grid gap-4">
                    <label className="text-base font-semibold text-gray-800 flex items-center">
                      <span className="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
                      Tiêu đề tài liệu
                      <span className="text-red-500 ml-2">*</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="VD: Tài liệu Dịch vụ IT Quý 4/2025"
                      className={`border rounded-xl px-6 py-4 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md ${
                        jsonErrors.title ? 'border-red-300 focus:ring-red-500' : 'border-gray-200'
                      }`}
                      required
                    />
                    {jsonErrors.title && (
                      <p className="text-sm text-red-600 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {jsonErrors.title}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      Tiêu đề ngắn gọn, giúp dễ tìm kiếm và quản lý
                    </p>
                  </div>
                  <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-2">
                    <div className="grid gap-4">
                      <label className="text-base font-semibold text-gray-800 flex items-center">
                        <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                        Creator ID
                        <span className="text-red-500 ml-2">*</span>
                      </label>
                      <input
                        type="number"
                        value={creatorId}
                        onChange={(e) => setCreatorId(e.target.value)}
                        placeholder="VD: 101"
                        className={`border rounded-xl px-6 py-4 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md ${
                          jsonErrors.creatorId ? 'border-red-300 focus:ring-red-500' : 'border-gray-200'
                        }`}
                        required
                        min={0}
                      />
                      {jsonErrors.creatorId && (
                        <p className="text-sm text-red-600 flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {jsonErrors.creatorId}
                        </p>
                      )}
                    </div>
                    <div className="grid gap-4">
                      <label className="text-base font-semibold text-gray-800 flex items-center">
                        <span className="w-3 h-3 bg-purple-500 rounded-full mr-3"></span>
                        Loại tài liệu
                      </label>
                      <input
                        type="text"
                        value={contractType}
                        onChange={(e) => setContractType(e.target.value)}
                        placeholder="VD: Hợp đồng, Báo cáo, Biên bản"
                        className="border border-gray-200 rounded-xl px-6 py-4 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
                      />
                    </div>
                    <div className="grid gap-4">
                      <label className="text-base font-semibold text-gray-800 flex items-center">
                        <span className="w-3 h-3 bg-orange-500 rounded-full mr-3"></span>
                        Tags
                      </label>
                      <input
                        type="text"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="VD: ưu tiên, SLA, bảo mật"
                        className="border border-gray-200 rounded-xl px-6 py-4 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
                      />
                    </div>
                    <div className="grid gap-4">
                      <label className="text-base font-semibold text-gray-800 flex items-center">
                        <span className="w-3 h-3 bg-indigo-500 rounded-full mr-3"></span>
                        Đối tượng
                      </label>
                      <input
                        type="text"
                        value={object}
                        onChange={(e) => setObject(e.target.value)}
                        placeholder="VD: Dịch vụ IT, Mua bán"
                        className="border border-gray-200 rounded-xl px-6 py-4 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Thời hạn & hiệu lực */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">Thời hạn & Hiệu lực</h2>
                        <p className="text-sm text-gray-600">Thiết lập thời gian hiệu lực và thời hạn tài liệu</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">Quan trọng</span>
                  </div>
                </div>
                <div className="p-8 space-y-8">
                  <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="grid gap-4">
                      <label className="text-base font-semibold text-gray-800 flex items-center">
                        <span className="w-3 h-3 bg-emerald-500 rounded-full mr-3"></span>
                        Ngày hiệu lực
                      </label>
                      <input
                        type="date"
                        value={effectiveDate}
                        onChange={(e) => setEffectiveDate(e.target.value)}
                        className="border border-gray-200 rounded-xl px-6 py-4 text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
                      />
                      <p className="text-sm text-gray-500 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        Ngày tài liệu có hiệu lực
                      </p>
                    </div>
                    <div className="grid gap-4">
                      <label className="text-base font-semibold text-gray-800 flex items-center">
                        <span className="w-3 h-3 bg-teal-500 rounded-full mr-3"></span>
                        Thời hạn
                      </label>
                      <input
                        type="text"
                        value={term}
                        onChange={(e) => setTerm(e.target.value)}
                        placeholder="VD: 12 tháng, 2 năm"
                        className="border border-gray-200 rounded-xl px-6 py-4 text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
                      />
                      <p className="text-sm text-gray-500 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        Thời hạn thực hiện tài liệu
                      </p>
                    </div>
                    <div className="grid gap-4 sm:col-span-2 lg:col-span-1">
                      <label className="text-base font-semibold text-gray-800 flex items-center">
                        <span className="w-3 h-3 bg-rose-500 rounded-full mr-3"></span>
                        Điều kiện chấm dứt
                      </label>
                      <input
                        type="text"
                        value={terminationConditions}
                        onChange={(e) => setTerminationConditions(e.target.value)}
                        placeholder="VD: Vi phạm, Hết hạn"
                        className="border border-gray-200 rounded-xl px-6 py-4 text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
                      />
                      <p className="text-sm text-gray-500 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Các điều kiện chấm dứt
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Thanh toán */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">Thông tin thanh toán</h2>
                        <p className="text-sm text-gray-600">Chi tiết về giá trị và phương thức thanh toán</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">Tùy chọn</span>
                  </div>
                </div>
                <div className="p-8 space-y-8">
                  <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="grid gap-4">
                      <label className="text-base font-semibold text-gray-800 flex items-center">
                        <span className="w-3 h-3 bg-amber-500 rounded-full mr-3"></span>
                        Tổng giá trị
                      </label>
                      <input
                        type="text"
                        value={paymentTotalValue}
                        onChange={(e) => setPaymentTotalValue(e.target.value)}
                        placeholder="VD: 100,000,000"
                        className="border border-gray-200 rounded-xl px-6 py-4 text-base focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
                      />
                    </div>
                    <div className="grid gap-4">
                      <label className="text-base font-semibold text-gray-800 flex items-center">
                        <span className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></span>
                        Đơn vị tiền tệ
                      </label>
                      <select
                        value={paymentCurrency}
                        onChange={(e) => setPaymentCurrency(e.target.value)}
                        className="border border-gray-200 rounded-xl px-6 py-4 text-base focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        <option value="VND">VND</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                      </select>
                    </div>
                    <div className="grid gap-4">
                      <label className="text-base font-semibold text-gray-800 flex items-center">
                        <span className="w-3 h-3 bg-orange-500 rounded-full mr-3"></span>
                        Lịch thanh toán
                      </label>
                      <input
                        type="text"
                        value={paymentSchedule}
                        onChange={(e) => setPaymentSchedule(e.target.value)}
                        placeholder="VD: Hàng tháng, Hàng quý"
                        className="border border-gray-200 rounded-xl px-6 py-4 text-base focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
                      />
                    </div>
                    <div className="grid gap-4">
                      <label className="text-base font-semibold text-gray-800 flex items-center">
                        <span className="w-3 h-3 bg-red-500 rounded-full mr-3"></span>
                        Phương thức
                      </label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="border border-gray-200 rounded-xl px-6 py-4 text-base focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        <option value="Chuyển khoản">Chuyển khoản</option>
                        <option value="Tiền mặt">Tiền mặt</option>
                        <option value="Thẻ">Thẻ</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Nội dung tài liệu */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">Nội dung tài liệu</h2>
                        <p className="text-sm text-gray-600">Mô tả chi tiết nội dung và điều khoản</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">Chi tiết</span>
                  </div>
                </div>
                <div className="p-8 space-y-8">
                  <div className="grid gap-4">
                    <label className="text-base font-semibold text-gray-800 flex items-center">
                      <span className="w-3 h-3 bg-purple-500 rounded-full mr-3"></span>
                      Nội dung chính
                    </label>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Nhập nội dung chi tiết của tài liệu..."
                      rows={6}
                      className="border border-gray-200 rounded-xl px-6 py-4 text-base focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md resize-none"
                    />
                    <p className="text-sm text-gray-500 flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      Mô tả chi tiết các điều khoản và nội dung tài liệu
                    </p>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-8 py-4 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-200"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-4 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang tạo...
                    </>
                  ) : (
                    'Tạo tài liệu'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
