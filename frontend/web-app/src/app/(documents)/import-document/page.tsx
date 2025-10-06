'use client'

import React, { useState, useRef } from 'react'
import { DashboardLayout } from '@/components/layout'
import { TitlePanel } from '@/components/ui'
import ContractSummaryRender from '@/components/ContractSummaryRender'
import EditableArrayTable from '@/components/EditableArrayTable'
import ProgressBar from '@/components/ProgressBar'
import { DocumentTextIcon, DocumentMagnifyingGlassIcon, ArrowUpTrayIcon, PlusIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import { automationAPI, fileStorageAPI } from '@/lib/api'
import toast from 'react-hot-toast'

export default function CreateContractPage() {
  // Tab state
  const [activeTab, setActiveTab] = useState<'file' | 'summary'>('file')
  const router = useRouter()
  
  // File Tab states
  const [selectedRegularFile, setSelectedRegularFile] = useState<File | null>(null)
  const [fileUploading, setFileUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  
  // UI state
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [responseData, setResponseData] = useState<any>(null)
  const [jsonErrors, setJsonErrors] = useState<{[key: string]: string}>({})
  const [success, setSuccess] = useState(false)

  // Summary tab state (từ AI summarize)
  const [summaryData, setSummaryData] = useState<any | null>(null)
  const [summaryJsonText, setSummaryJsonText] = useState<string>('')
  const [summaryJsonError, setSummaryJsonError] = useState<string>('')
  const [summarySubmitting, setSummarySubmitting] = useState<boolean>(false)
  const [classifyResult, setClassifyResult] = useState<any | null>(null)

  const handleSummaryValidate = (value: string) => {
    if (!value.trim()) {
      setSummaryJsonError('')
      return true
    }
    try {
      JSON.parse(value)
      setSummaryJsonError('')
      return true
    } catch (e) {
      setSummaryJsonError('JSON không hợp lệ. Vui lòng kiểm tra lại cú pháp.')
      return false
    }
  }

  const handleSummarySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!summaryJsonText.trim()) {
      toast.error('Vui lòng nhập JSON tóm tắt')
      return
    }
    if (!handleSummaryValidate(summaryJsonText)) {
      toast.error('JSON tóm tắt không hợp lệ')
      return
    }

    try {
      setSummarySubmitting(true)
      const parsed = JSON.parse(summaryJsonText)
      setSummaryData(parsed)
      toast.success('Đã cập nhật dữ liệu tóm tắt từ JSON')
    } catch (err: any) {
      toast.error(`Lỗi: ${err?.message || 'Không thể parse JSON'}`)
    } finally {
      setSummarySubmitting(false)
    }
  }
  
  // File input refs
  const ocrFileInputRef = useRef<HTMLInputElement>(null)
  const regularFileInputRef = useRef<HTMLInputElement>(null)

  // OCR Tab handlers
  const handleOcrFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      toast.success(`Đã chọn file: ${file.name}`)
    }
  }

  const handleOcrExtract = async () => {
    if (!selectedFile) {
      toast.error('Vui lòng chọn file để upload')
      return
    }

    try {
      setOcrLoading(true)
      // 1) Upload trực tiếp qua automation-service (files)
      const uploadRes = await fileStorageAPI.uploadFile(selectedFile)
      const uploadBody = uploadRes.data
      const uploadOk = uploadBody && (uploadBody.statusCode === 200 || uploadBody.statusCode === 201)

      if (!uploadOk) {
        toast.error(uploadBody?.description || 'Tải lên thất bại')
        return
      }

      toast.success('Tải lên thành công')
      // Hiển thị toast có hành động đẹp thay cho confirm xấu
      try {
        const { openCenterDialog } = await import('@/lib/ui/actionToast')
        openCenterDialog('Tải lên thành công', {
          description: `${selectedFile.name} đã được lưu vào hệ thống.`,
          actions: [
            {
              label: 'Xem chi tiết',
              onClick: () => setActiveTab('summary'),
            },
            {
              label: 'Tải thêm',
              onClick: () => {
                // reset để người dùng chọn file mới
                setSelectedFile(null)
                ;(document.getElementById('file-input') as HTMLInputElement | null)?.focus()
              },
            },
          ],
          durationMs: 8000,
        })
      } catch {}

      // 2) Nếu cần, vẫn có thể gọi extract lại (giữ nguyên logic)
      const extractRes = await automationAPI.extractText(selectedFile, apiKey || undefined)
      const extractBody = extractRes.data
      if (extractBody?.statusCode === 200 && typeof extractBody.data === 'string') {
        setExtractedText(extractBody.data)
        toast.success('Trích xuất văn bản thành công')
      } else if (extractBody?.statusCode === 204) {
        toast('Không có nội dung để trích xuất', { icon: 'ℹ️' })
        setExtractedText('')
      } else {
        toast.error(extractBody?.description || 'Trích xuất thất bại')
        return
      }

      // 3) Classify tài liệu
      let classifyBody: any
      try {
        const classifyRes = await automationAPI.classifyText(extractBody.data as string, apiKey || undefined)
        classifyBody = classifyRes.data
      } catch (e: any) {
        // fallback thử classify bằng file nếu có lỗi
        const classifyRes2 = await automationAPI.classifyFile(selectedFile, apiKey || undefined)
        classifyBody = classifyRes2.data
      }
      if (classifyBody?.statusCode === 200) {
        setClassifyResult(classifyBody.data)
        toast.success('Phân loại tài liệu thành công')
      } else if (classifyBody?.statusCode === 204) {
        toast('Không có kết quả phân loại', { icon: 'ℹ️' })
      } else {
        toast.error(classifyBody?.description || 'Phân loại thất bại')
      }

      // 4) Summarize nếu là hợp đồng
      if (classifyBody?.data?.isContract) {
        const sumRes = await automationAPI.summarizeFile(selectedFile, apiKey || undefined)
        const sumBody = sumRes.data
        if (sumBody?.statusCode === 200) {
          setSummaryData(sumBody.data)
          toast.success('Tóm tắt hợp đồng thành công')
        } else if (sumBody?.statusCode === 204) {
          toast('Không có dữ liệu tóm tắt', { icon: 'ℹ️' })
        } else {
          toast.error(sumBody?.description || 'Tóm tắt thất bại')
        }
      }
    } catch (error: any) {
      console.error('Upload failed:', error)
      const msg = error?.response?.data?.description || error?.message || 'Lỗi upload file'
      toast.error(msg)
    } finally {
      setOcrLoading(false)
    }
  }

  // File Tab handlers
  const handleRegularFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedRegularFile(file)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedRegularFile(e.dataTransfer.files[0])
    }
  }

  const handleOcrDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setOcrDragActive(true)
    } else if (e.type === 'dragleave') {
      setOcrDragActive(false)
    }
  }

  const handleOcrDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setOcrDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      
      // Tab OCR nhận PDF, DOC, DOCX, TXT
      const allowedTypes = ['pdf', 'doc', 'docx', 'txt']
      const fileExtension = file.name.split('.').pop()?.toLowerCase()
      
      if (fileExtension && allowedTypes.includes(fileExtension)) {
        setSelectedFile(file)
        toast.success(`Đã chọn file: ${file.name}`)
      } else {
        toast.error('Chỉ hỗ trợ file PDF, DOCX, TXT cho OCR')
      }
    }
  }

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    switch (extension) {
      case 'pdf':
        return (
          <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
        )
      case 'doc':
      case 'docx':
        return (
          <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
        )
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return (
          <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z" />
          </svg>
        )
      case 'txt':
        return (
          <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
        )
      default:
        return (
          <svg className="w-8 h-8 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
        )
    }
  }

  const handleRegularFileUpload = async () => {
    if (!selectedRegularFile) {
      toast.error('Vui lòng chọn file để tải lên')
      return
    }

    try {
      setFileUploading(true)
      setUploadProgress(0)
      const res = await fileStorageAPI.uploadFile(selectedRegularFile, undefined, undefined, (progress) => {
        setUploadProgress(progress)
      })
      const body = res.data

      if (body && (body.statusCode === 200 || body.statusCode === 201)) {
        toast.success('Tải lên file thành công!')
        setSelectedRegularFile(null)
        setUploadProgress(0)
      } else if (body?.statusCode === 204) {
        toast('Không có nội dung để tải lên', { icon: 'ℹ️' })
      } else {
        toast.error(body?.description || 'Tải lên thất bại')
      }
    } catch (error: any) {
      console.error('File Upload Error:', error)
      const msg = error?.response?.data?.description || error?.message || 'Lỗi tải lên file'
      toast.error(msg)
    } finally {
      setFileUploading(false)
      setUploadProgress(0)
    }
  }

  // JSON validation helper
  const validateJson = (value: string, fieldName: string) => {
    if (!value.trim()) return true
    try {
      JSON.parse(value)
      setJsonErrors(prev => ({ ...prev, [fieldName]: '' }))
      return true
    } catch (e: any) {
      setJsonErrors(prev => ({ ...prev, [fieldName]: 'JSON không hợp lệ. Vui lòng kiểm tra lại cú pháp.' }))
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setResponseData(null)

    // Basic validation
    if (!title.trim()) {
      setMessage('Vui lòng nhập tiêu đề hợp đồng.')
      return
    }
    if (!creatorId.trim() || isNaN(Number(creatorId))) {
      setMessage('Vui lòng nhập Creator ID hợp lệ (số).')
      return
    }

    // Validate all JSON fields
    const jsonFields = [
      { value: parties, name: 'parties' },
      { value: keyClauses, name: 'keyClauses' },
      { value: favorableClauses, name: 'favorableClauses' },
      { value: unfavorableClauses, name: 'unfavorableClauses' },
      { value: reminders, name: 'reminders' },
      { value: riskAssessment, name: 'riskAssessment' },
      { value: complianceStatus, name: 'complianceStatus' }
    ]

    let hasJsonError = false
    jsonFields.forEach(field => {
      if (!validateJson(field.value, field.name)) {
        hasJsonError = true
      }
    })

    if (hasJsonError) {
      setMessage('Vui lòng kiểm tra lại các trường JSON.')
      return
    }

    try {
      setSubmitting(true)
      setMessage('Đang tạo hợp đồng...')

      // Build payload matching backend schema
      const payload: any = {
        title: title.trim(),
        creatorId: Number(creatorId),
        status: 'DRAFT', // Default status
        contractType: contractType || 'Hợp đồng lao động',
        tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
        object: object || '',
        effectiveDate: effectiveDate || new Date().toISOString().split('T')[0],
        term: term || '12 tháng',
        terminationConditions: terminationConditions || '',
        content: content || '',
        paymentDetails: {
          totalValue: Number(paymentTotalValue) || 0,
          currency: paymentCurrency || 'VND',
          schedule: paymentSchedule || 'Thanh toán 1 lần',
          paymentMethod: paymentMethod || 'Chuyển khoản'
        }
      }

      // Optional basic fields
      if (contractType.trim()) payload.contractType = contractType.trim()
      if (tags.trim()) payload.tags = tags.split(',').map(t => t.trim()).filter(Boolean)
      if (object.trim()) payload.object = object.trim()
      if (effectiveDate) payload.effectiveDate = effectiveDate
      if (term.trim()) payload.term = term.trim()
      if (terminationConditions.trim()) payload.terminationConditions = terminationConditions.trim()
      if (content.trim()) payload.content = content.trim()

      // Payment details
      if (paymentTotalValue || paymentCurrency || paymentSchedule || paymentMethod) {
        payload.paymentDetails = {
          totalValue: paymentTotalValue ? Number(paymentTotalValue) : 0,
          schedule: paymentSchedule || '',
          currency: paymentCurrency || 'VND',
          paymentMethod: paymentMethod || ''
        }
      }

      // JSON arrays (parse if provided)
      if (parties.trim()) payload.parties = JSON.parse(parties)
      if (keyClauses.trim()) payload.keyClauses = JSON.parse(keyClauses)
      if (favorableClauses.trim()) payload.favorableClauses = JSON.parse(favorableClauses)
      if (unfavorableClauses.trim()) payload.unfavorableClauses = JSON.parse(unfavorableClauses)
      if (reminders.trim()) payload.reminders = JSON.parse(reminders)
      if (riskAssessment.trim()) payload.riskAssessment = JSON.parse(riskAssessment)
      if (complianceStatus.trim()) payload.complianceStatus = JSON.parse(complianceStatus)

      // For now, use mock API - easy to replace with real backend
      const res = await fetch('/api/mock/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const json = await res.json().catch(() => null)
      if (!res.ok) {
        const errorMsg = json?.description || json?.message || json?.detail || res.statusText
        setMessage(`Lỗi tạo hợp đồng: ${errorMsg}`)
        setSubmitting(false)
        return
      }

      const data = json?.data ?? json
      setResponseData(data)
      setMessage('Tạo hợp đồng thành công!')
      setSuccess(true)
      
      // Reset form after successful submission
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
    } catch (err: any) {
      setMessage(`Có lỗi xảy ra: ${err?.message || String(err)}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Title */}
          <TitlePanel
            title="NHẬP TÀI LIỆU"
            description="Tải lên và xử lý tài liệu hợp đồng hoặc tạo hợp đồng mới"
            variant="primary"
          />

          {/* Tabs Navigation */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('file')}
                  className={`py-4 px-3 rounded-t-lg border-b-2 font-medium text-sm ${
                    activeTab === 'file'
                      ? 'border-emerald-500 text-emerald-700 bg-emerald-50'
                      : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <ArrowUpTrayIcon className="h-5 w-5 inline mr-2" />
                  Upload tệp
                </button>
                <button
                  onClick={() => setActiveTab('summary')}
                  className={`py-4 px-3 rounded-t-lg border-b-2 font-medium text-sm ${
                    activeTab === 'summary'
                      ? 'border-indigo-500 text-indigo-700 bg-indigo-50'
                      : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <DocumentTextIcon className="h-5 w-5 inline mr-2" />
                  Tóm tắt hợp đồng (AI)
                </button>
              </nav>
            </div>

            <div className="p-6">

              {/* File Tab Content */}
              {activeTab === 'file' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Tải lên file thông thường</h3>
                    <p className="text-gray-600 text-lg mb-4">Chọn bất kỳ loại file nào để lưu trữ an toàn trong hệ thống</p>
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl p-4 max-w-4xl mx-auto">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="text-left">
                          <h4 className="text-sm font-semibold text-gray-900 mb-1">Tính năng lưu trữ file đa dạng</h4>
                          <p className="text-sm text-gray-600 mb-2">Hệ thống hỗ trợ lưu trữ mọi loại file từ tài liệu văn bản, hình ảnh, video đến các file chuyên môn như CAD, 3D models.</p>
                          <div className="flex flex-wrap gap-2 text-xs">
                            <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">Lưu trữ an toàn</span>
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">Truy cập mọi lúc</span>
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full">Backup tự động</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="max-w-4xl mx-auto">
                    {/* Drag & Drop Zone */}
                    <div
                      className={`relative w-full border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
                        dragActive
                          ? 'border-emerald-500 bg-emerald-50 scale-[1.02]'
                          : 'border-gray-300 hover:border-emerald-400 hover:bg-gray-50'
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <input
                        ref={regularFileInputRef}
                        type="file"
                        accept="*/*"
                        onChange={handleRegularFileSelect}
                        className="hidden"
                      />
                      
                      {selectedRegularFile ? (
                        // File Selected State
                        <div className="p-8 text-center">
                          <div className="flex flex-col items-center space-y-4">
                            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                              {getFileIcon(selectedRegularFile.name)}
                            </div>
                            <div className="space-y-2">
                              <h4 className="text-lg font-semibold text-gray-900">{selectedRegularFile.name}</h4>
                              <p className="text-sm text-gray-600">
                                Kích thước: {(selectedRegularFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                              <p className="text-xs text-gray-500">
                                Loại: {selectedRegularFile.type || 'Không xác định'}
                              </p>
                            </div>
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => setSelectedRegularFile(null)}
                                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                Chọn file khác
                              </button>
                        <button
                          onClick={() => regularFileInputRef.current?.click()}
                                className="px-4 py-2 text-sm text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100 rounded-lg transition-colors"
                        >
                                Thay đổi
                        </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        // Empty State
                        <div className="p-12 text-center">
                          <div className="flex flex-col items-center space-y-6">
                            <div className="relative">
                              <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center">
                                <ArrowUpTrayIcon className="w-10 h-10 text-emerald-600" />
                              </div>
                              <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                </svg>
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              <h4 className="text-xl font-semibold text-gray-900">Kéo thả file vào đây</h4>
                              <p className="text-gray-600">hoặc</p>
                              <button
                                onClick={() => regularFileInputRef.current?.click()}
                                className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 active:scale-[0.98] transition-all duration-200 shadow-lg hover:shadow-xl"
                              >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Chọn file từ máy tính
                              </button>
                            </div>
                            
                            <div className="text-center space-y-3">
                              <div>
                                <p className="text-sm text-gray-500 mb-2">Hỗ trợ tất cả loại file:</p>
                                <div className="flex flex-wrap justify-center gap-2">
                                  {['PDF', 'DOC/DOCX', 'TXT', 'JPG/PNG', 'ZIP', 'MP4', '...'].map((type) => (
                                    <span
                                      key={type}
                                      className="px-3 py-1 bg-emerald-100 text-emerald-600 text-xs rounded-full"
                                    >
                                      {type}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              
                              <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 max-w-md mx-auto">
                                <div className="flex items-center space-x-2 text-xs text-emerald-700">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span className="font-medium">Lưu ý:</span>
                                </div>
                                <p className="text-xs text-emerald-600 mt-1">
                                  File sẽ được lưu trữ an toàn với mã hóa AES-256 và backup tự động. Bạn có thể truy cập mọi lúc.
                        </p>
                      </div>
                              
                              <p className="text-xs text-gray-400">
                                Kích thước tối đa: 1GB
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Upload Button */}
                    {selectedRegularFile && (
                      <div className="mt-8 text-center">
                        {/* Progress Bar */}
                        {fileUploading && (
                          <div className="mb-4">
                            <ProgressBar 
                              progress={uploadProgress} 
                              color="emerald" 
                              size="md"
                              className="max-w-md mx-auto"
                            />
                          </div>
                        )}
                        
                        <button
                          onClick={handleRegularFileUpload}
                          disabled={fileUploading}
                          className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-teal-700 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                        >
                          {fileUploading ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                              </svg>
                              Đang tải lên... {uploadProgress}%
                            </>
                          ) : (
                            <>
                              <ArrowUpTrayIcon className="w-5 h-5 mr-2" />
                              Tải lên file
                            </>
                          )}
                        </button>
                        <p className="text-sm text-gray-500 mt-3">
                          File sẽ được lưu trữ an toàn trong hệ thống với mã hóa AES-256
                        </p>
                        
                        {/* Additional Features Info */}
                        <div className="mt-6 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl p-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                            <div className="flex flex-col items-center space-y-2">
                              <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                              </div>
                              <h5 className="text-sm font-semibold text-gray-900">Bảo mật cao</h5>
                              <p className="text-xs text-gray-600">Mã hóa AES-256, backup tự động</p>
                            </div>
                            
                            <div className="flex flex-col items-center space-y-2">
                              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                                </svg>
                              </div>
                              <h5 className="text-sm font-semibold text-gray-900">Tổ chức thông minh</h5>
                              <p className="text-xs text-gray-600">Tự động phân loại và gắn tag</p>
                            </div>
                            
                            <div className="flex flex-col items-center space-y-2">
                              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                              </div>
                              <h5 className="text-sm font-semibold text-gray-900">Truy cập dễ dàng</h5>
                              <p className="text-xs text-gray-600">Tìm kiếm nhanh, chia sẻ thuận tiện</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

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
                      <p className="text-sm text-gray-600">Các trường bắt buộc để tạo hợp đồng</p>
                        </div>
                      </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">Bắt buộc</span>
            </div>
          </div>
              <div className="p-8 space-y-8">
                <div className="grid gap-4">
                  <label className="text-base font-semibold text-gray-800 flex items-center">
                    <span className="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
                    Tiêu đề hợp đồng
                    <span className="text-red-500 ml-2">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="VD: Hợp đồng Dịch vụ IT Quý 4/2025"
                    className="border border-gray-200 rounded-xl px-6 py-4 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
                    required
                  />
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
                      className="border border-gray-200 rounded-xl px-6 py-4 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
                      required
                      min={0}
                    />
              </div>
                  <div className="grid gap-4">
                    <label className="text-base font-semibold text-gray-800 flex items-center">
                      <span className="w-3 h-3 bg-purple-500 rounded-full mr-3"></span>
                      Loại hợp đồng
                    </label>
                    <input
                      type="text"
                      value={contractType}
                      onChange={(e) => setContractType(e.target.value)}
                      placeholder="VD: Dịch vụ, Mua bán, Hợp tác"
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
                      <p className="text-sm text-gray-600">Thiết lập thời gian hiệu lực và thời hạn hợp đồng</p>
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
                      Ngày hợp đồng có hiệu lực
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
                      Thời hạn thực hiện hợp đồng
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
                  <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">Tài chính</span>
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
                      type="number"
                      min={0}
                      value={paymentTotalValue}
                      onChange={(e) => setPaymentTotalValue(e.target.value)}
                      placeholder="VD: 150000000"
                      className="border border-gray-200 rounded-xl px-6 py-4 text-base focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
                    />
                  </div>
                  <div className="grid gap-4">
                    <label className="text-base font-semibold text-gray-800 flex items-center">
                      <span className="w-3 h-3 bg-orange-500 rounded-full mr-3"></span>
                      Tiền tệ
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
                      <span className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></span>
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
                  <div className="grid gap-4">
                    <label className="text-base font-semibold text-gray-800 flex items-center">
                      <span className="w-3 h-3 bg-red-500 rounded-full mr-3"></span>
                      Lịch thanh toán
                    </label>
                    <input
                      type="text"
                      value={paymentSchedule}
                      onChange={(e) => setPaymentSchedule(e.target.value)}
                      placeholder="VD: 30% khi ký, 70% nghiệm thu"
                      className="border border-gray-200 rounded-xl px-6 py-4 text-base focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
                    />
                  </div>
                </div>
              </div>
                  </div>

            {/* Các bên tham gia */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-violet-50 to-purple-50 px-6 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-violet-500 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <div>
                      <h2 className="text-lg font-semibold text-gray-900">Các bên tham gia</h2>
                      <p className="text-sm text-gray-600">Thông tin chi tiết về các bên tham gia hợp đồng</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-violet-100 text-violet-700 text-xs font-medium rounded-full">JSON</span>
                </div>
              </div>
              <div className="p-8 space-y-6">
                <div className="grid gap-4">
                  <label className="text-base font-semibold text-gray-800 flex items-center">
                    <span className="w-3 h-3 bg-violet-500 rounded-full mr-3"></span>
                    Parties (JSON)
                  </label>
                  <textarea
                    value={parties}
                    onChange={(e) => {
                      setParties(e.target.value)
                      validateJson(e.target.value, 'parties')
                    }}
                    placeholder='[{"name":"Công ty ABC","role":"Bên cung cấp","representative":"Nguyễn Văn A","taxCode":"0123456789","contact":"contact@abc.com","address":"123 Đường ABC, TP.HCM","businessLicense":"123456789"}]'
                    rows={8}
                    className={`border border-gray-200 rounded-xl px-6 py-4 text-base focus:outline-none focus:ring-2 transition-all duration-200 shadow-sm hover:shadow-md ${jsonErrors.parties ? 'border-red-300 focus:ring-red-400' : 'focus:ring-violet-500 focus:border-transparent'}`}
                  />
                  {jsonErrors.parties ? (
                    <p className="text-sm text-red-600 flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {jsonErrors.parties}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500 flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      Mảng JSON chứa thông tin các bên tham gia
                    </p>
                  )}
                        </div>
                      </div>
                    </div>

            {/* Điều khoản hợp đồng */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-cyan-50 to-blue-50 px-6 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Điều khoản hợp đồng</h2>
                      <p className="text-sm text-gray-600">Các điều khoản chính, có lợi và bất lợi</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-cyan-100 text-cyan-700 text-xs font-medium rounded-full">Điều khoản</span>
                </div>
              </div>
              <div className="p-8 space-y-8">
                <div className="grid gap-6">
                  <label className="text-base font-semibold text-gray-800 flex items-center">
                    <span className="w-3 h-3 bg-cyan-500 rounded-full mr-3"></span>
                    Điều khoản chính (keyClauses)
                  </label>
                  <textarea
                    value={keyClauses}
                    onChange={(e) => {
                      setKeyClauses(e.target.value)
                      validateJson(e.target.value, 'keyClauses')
                    }}
                    placeholder='[{"name":"Phạt vi phạm","description":"Mức phạt 5% giá trị hợp đồng","source":"Điều 5"}]'
                    rows={6}
                    className={`border border-gray-200 rounded-xl px-6 py-4 text-base focus:outline-none focus:ring-2 transition-all duration-200 shadow-sm hover:shadow-md ${jsonErrors.keyClauses ? 'border-red-300 focus:ring-red-400' : 'focus:ring-cyan-500 focus:border-transparent'}`}
                  />
                  {jsonErrors.keyClauses && (
                    <p className="text-sm text-red-600 flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {jsonErrors.keyClauses}
                    </p>
                  )}
                </div>
                <div className="grid gap-8 sm:grid-cols-2">
                  <div className="grid gap-6">
                    <label className="text-base font-semibold text-gray-800 flex items-center">
                      <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                      Điều khoản có lợi
                    </label>
                    <textarea
                      value={favorableClauses}
                      onChange={(e) => {
                        setFavorableClauses(e.target.value)
                        validateJson(e.target.value, 'favorableClauses')
                      }}
                      placeholder='[{"clauseName":"Bảo hành","description":"Bảo hành 24 tháng","benefitTo":"Bên mua"}]'
                      rows={6}
                      className={`border border-gray-200 rounded-xl px-6 py-4 text-base focus:outline-none focus:ring-2 transition-all duration-200 shadow-sm hover:shadow-md ${jsonErrors.favorableClauses ? 'border-red-300 focus:ring-red-400' : 'focus:ring-cyan-500 focus:border-transparent'}`}
                    />
                    {jsonErrors.favorableClauses && (
                      <p className="text-sm text-red-600 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {jsonErrors.favorableClauses}
                      </p>
                    )}
                </div>
                  <div className="grid gap-6">
                    <label className="text-base font-semibold text-gray-800 flex items-center">
                      <span className="w-3 h-3 bg-red-500 rounded-full mr-3"></span>
                      Điều khoản bất lợi
                    </label>
                    <textarea
                      value={unfavorableClauses}
                      onChange={(e) => {
                        setUnfavorableClauses(e.target.value)
                        validateJson(e.target.value, 'unfavorableClauses')
                      }}
                      placeholder='[{"clauseName":"Trả chậm","description":"Phạt 0.5%/tháng","riskTo":"Bên bán"}]'
                      rows={6}
                      className={`border border-gray-200 rounded-xl px-6 py-4 text-base focus:outline-none focus:ring-2 transition-all duration-200 shadow-sm hover:shadow-md ${jsonErrors.unfavorableClauses ? 'border-red-300 focus:ring-red-400' : 'focus:ring-cyan-500 focus:border-transparent'}`}
                    />
                    {jsonErrors.unfavorableClauses && (
                      <p className="text-sm text-red-600 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {jsonErrors.unfavorableClauses}
                      </p>
                    )}
                  </div>
                </div>
            </div>
          </div>

            {/* Nhắc nhở & Rủi ro */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-rose-50 to-pink-50 px-6 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Nhắc nhở & Đánh giá rủi ro</h2>
                      <p className="text-sm text-gray-600">Lịch nhắc nhở và đánh giá rủi ro hợp đồng</p>
                    </div>
              </div>
                  <span className="px-3 py-1 bg-rose-100 text-rose-700 text-xs font-medium rounded-full">Rủi ro</span>
              </div>
            </div>
              <div className="p-8 space-y-8">
                <div className="grid gap-6">
                  <label className="text-base font-semibold text-gray-800 flex items-center">
                    <span className="w-3 h-3 bg-rose-500 rounded-full mr-3"></span>
                    Nhắc nhở (reminders)
                  </label>
                  <textarea
                    value={reminders}
                    onChange={(e) => {
                      setReminders(e.target.value)
                      validateJson(e.target.value, 'reminders')
                    }}
                    placeholder='[{"type":"renewal","date":"2025-12-01","content":"Gia hạn hợp đồng"}]'
                    rows={5}
                    className={`border border-gray-200 rounded-xl px-6 py-4 text-base focus:outline-none focus:ring-2 transition-all duration-200 shadow-sm hover:shadow-md ${jsonErrors.reminders ? 'border-red-300 focus:ring-red-400' : 'focus:ring-rose-500 focus:border-transparent'}`}
                  />
                  {jsonErrors.reminders && (
                    <p className="text-sm text-red-600 flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {jsonErrors.reminders}
                    </p>
                  )}
                </div>
                <div className="grid gap-8 sm:grid-cols-2">
                  <div className="grid gap-6">
                    <label className="text-base font-semibold text-gray-800 flex items-center">
                      <span className="w-3 h-3 bg-orange-500 rounded-full mr-3"></span>
                      Đánh giá rủi ro (riskAssessment)
                    </label>
                    <textarea
                      value={riskAssessment}
                      onChange={(e) => {
                        setRiskAssessment(e.target.value)
                        validateJson(e.target.value, 'riskAssessment')
                      }}
                      placeholder='{"riskLevel":"MEDIUM","riskFactors":["Rủi ro thanh toán","Rủi ro thực hiện"],"mitigationMeasures":["Ký quỹ","Bảo lãnh"]}'
                      rows={6}
                      className={`border border-gray-200 rounded-xl px-6 py-4 text-base focus:outline-none focus:ring-2 transition-all duration-200 shadow-sm hover:shadow-md ${jsonErrors.riskAssessment ? 'border-red-300 focus:ring-red-400' : 'focus:ring-rose-500 focus:border-transparent'}`}
                    />
                    {jsonErrors.riskAssessment && (
                      <p className="text-sm text-red-600 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {jsonErrors.riskAssessment}
                      </p>
                    )}
                  </div>
                  <div className="grid gap-6">
                    <label className="text-base font-semibold text-gray-800 flex items-center">
                      <span className="w-3 h-3 bg-emerald-500 rounded-full mr-3"></span>
                      Trạng thái tuân thủ (complianceStatus)
                    </label>
                    <textarea
                      value={complianceStatus}
                      onChange={(e) => {
                        setComplianceStatus(e.target.value)
                        validateJson(e.target.value, 'complianceStatus')
                      }}
                      placeholder='{"status":"COMPLIANT","issues":[],"recommendations":["Kiểm tra định kỳ"]}'
                      rows={6}
                      className={`border border-gray-200 rounded-xl px-6 py-4 text-base focus:outline-none focus:ring-2 transition-all duration-200 shadow-sm hover:shadow-md ${jsonErrors.complianceStatus ? 'border-red-300 focus:ring-red-400' : 'focus:ring-rose-500 focus:border-transparent'}`}
                    />
                    {jsonErrors.complianceStatus && (
                      <p className="text-sm text-red-600 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {jsonErrors.complianceStatus}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Hoàn tất tạo hợp đồng</h3>
                    <p className="text-sm text-gray-600">Kiểm tra thông tin và tạo hợp đồng mới</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      // Reset all form fields
                      setTitle('')
                      setCreatorId('')
                      setContractType('')
                      setTags('')
                      setObject('')
                      setEffectiveDate('')
                      setTerm('')
                      setTerminationConditions('')
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
                      setContent('')
                      setMessage(null)
                      setResponseData(null)
                      setJsonErrors({})
                    }}
                    disabled={submitting}
                    className="inline-flex items-center px-6 py-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 shadow-sm hover:shadow-md"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Xoá dữ liệu
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 hover:shadow-xl"
                  >
                    {submitting && (
                      <svg className="h-5 w-5 animate-spin mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                      </svg>
                    )}
                    {submitting ? 'Đang tạo...' : 'Tạo hợp đồng'}
                  </button>
                </div>
              </div>
            </div>
                    {/* Success/Error Messages */}
                    {message && (
                      <div className={`rounded-2xl border p-6 shadow-lg ${
                        success 
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                          : 'bg-red-50 border-red-200 text-red-800'
                      }`}>
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                            success ? 'bg-emerald-100' : 'bg-red-100'
                          }`}>
                            {success ? (
                              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <h3 className={`font-semibold ${success ? 'text-emerald-900' : 'text-red-900'}`}>
                              {success ? 'Thành công!' : 'Có lỗi xảy ra'}
                            </h3>
                            <p className="text-sm mt-1">{message}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {responseData && (
                      <div className="rounded-2xl border bg-blue-50 border-blue-200 p-6 shadow-lg">
                        <h3 className="font-semibold text-blue-900 mb-3">Thông tin hợp đồng đã tạo:</h3>
                        <div className="bg-white rounded-lg p-4 border border-blue-200">
                          <pre className="text-sm text-gray-800 overflow-x-auto">
                            {JSON.stringify(responseData, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </form>
                </div>
              )}

            {/* Summary Tab Content */}
            {activeTab === 'summary' && (
              <div className="space-y-8 pb-24">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6M9 8h6M5 6h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z" /></svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Thông tin tóm tắt hợp đồng</h3>
                        <p className="text-sm text-gray-600">Chỉnh sửa nhanh các nội dung chính trước khi lưu vào hệ thống</p>
                      </div>
                    </div>
                    <span className="hidden md:inline px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">Tóm tắt</span>
                  </div>
                </div>

                {/* Panel hiển thị file đã chọn */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Tệp được chọn</h2>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">Nguồn dữ liệu</span>
                  </div>
                  <div className="p-6">
                    {selectedFile ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-50 border border-gray-200 rounded flex items-center justify-center">
                            {getFileIcon(selectedFile.name)}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{selectedFile.name}</div>
                            <div className="text-sm text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</div>
                          </div>
                        </div>
                        <button onClick={() => setSelectedFile(null)} className="text-sm text-gray-600 hover:text-gray-800">Gỡ tệp</button>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">Chưa có tệp được chọn. Hãy chọn tệp ở tab OCR.</div>
                    )}
                  </div>
                </div>

                {/* Khu vực nội dung chính, ưu tiên multi-line */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Thông tin chung</h2>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">Cơ bản</span>
                  </div>
                  <div className="p-6 grid gap-6 md:grid-cols-2">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center"><span className="w-3 h-3 bg-indigo-500 rounded-full mr-2"></span>Tiêu đề hợp đồng</label>
                      <textarea rows={2} placeholder="VD: Hợp đồng DV IT Q4/2025" value={summaryData?.title ?? ''} onChange={(e) => setSummaryData((prev: any) => ({ ...(prev || {}), title: e.target.value }))} className="border border-gray-200 rounded-lg px-4 py-2" />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center"><span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>Loại hợp đồng</label>
                      <input placeholder="VD: Mua bán, Dịch vụ" value={summaryData?.contractType ?? ''} onChange={(e) => setSummaryData((prev: any) => ({ ...(prev || {}), contractType: e.target.value }))} className="border border-gray-200 rounded-lg px-4 py-2" />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center"><span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>Số hợp đồng</label>
                      <input placeholder="VD: MD-d3kj3" value={summaryData?.contractNumber ?? ''} onChange={(e) => setSummaryData((prev: any) => ({ ...(prev || {}), contractNumber: e.target.value }))} className="border border-gray-200 rounded-lg px-4 py-2" />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center"><span className="w-3 h-3 bg-teal-500 rounded-full mr-2"></span>Thời hạn</label>
                      <input placeholder="VD: 12 tháng" value={summaryData?.term ?? ''} onChange={(e) => setSummaryData((prev: any) => ({ ...(prev || {}), term: e.target.value }))} className="border border-gray-200 rounded-lg px-4 py-2" />
                    </div>
                    <div className="grid gap-2 md:col-span-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center"><span className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></span>Đối tượng hợp đồng</label>
                      <textarea rows={3} placeholder="VD: Dịch vụ phát triển phần mềm, triển khai hệ thống" value={summaryData?.object ?? ''} onChange={(e) => setSummaryData((prev: any) => ({ ...(prev || {}), object: e.target.value }))} className="border border-gray-200 rounded-lg px-4 py-2" />
                    </div>
                    <div className="grid gap-2 md:col-span-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center"><span className="w-3 h-3 bg-orange-500 rounded-full mr-2"></span>Tags</label>
                      <textarea rows={2} placeholder="VD: ưu tiên, SLA, bảo mật" value={(summaryData?.tags || []).join(', ')} onChange={(e) => setSummaryData((prev: any) => ({ ...(prev || {}), tags: e.target.value.split(',').map((t: string) => t.trim()).filter(Boolean) }))} className="border border-gray-200 rounded-lg px-4 py-2" />
                    </div>
                    <div className="grid gap-2 md:col-span-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center"><span className="w-3 h-3 bg-rose-500 rounded-full mr-2"></span>Điều kiện chấm dứt</label>
                      <textarea rows={2} placeholder="VD: Vi phạm điều khoản, hết hạn, chấm dứt theo thỏa thuận" value={summaryData?.terminationConditions ?? ''} onChange={(e) => setSummaryData((prev: any) => ({ ...(prev || {}), terminationConditions: e.target.value }))} className="border border-gray-200 rounded-lg px-4 py-2" />
                    </div>
                  </div>
                </div>

                {/* Thông tin thanh toán */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Thông tin thanh toán</h2>
                    <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">Tài chính</span>
                  </div>
                  <div className="p-6 grid gap-6 md:grid-cols-2">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center"><span className="w-3 h-3 bg-amber-500 rounded-full mr-2"></span>Tổng giá trị</label>
                      <input placeholder="VD: 150000000" value={summaryData?.paymentDetails?.totalValue ?? ''} onChange={(e) => setSummaryData((prev: any) => ({ ...(prev || {}), paymentDetails: { ...(prev?.paymentDetails || {}), totalValue: e.target.value } }))} className="border border-gray-200 rounded-lg px-4 py-2" />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center"><span className="w-3 h-3 bg-orange-500 rounded-full mr-2"></span>Tiền tệ</label>
                      <input placeholder="VD: VND" value={summaryData?.paymentDetails?.currency ?? ''} onChange={(e) => setSummaryData((prev: any) => ({ ...(prev || {}), paymentDetails: { ...(prev?.paymentDetails || {}), currency: e.target.value } }))} className="border border-gray-200 rounded-lg px-4 py-2" />
                    </div>
                    <div className="grid gap-2 md:col-span-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center"><span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>Lịch thanh toán</label>
                      <textarea rows={2} placeholder="VD: 30% khi ký, 70% nghiệm thu" value={summaryData?.paymentDetails?.schedule ?? ''} onChange={(e) => setSummaryData((prev: any) => ({ ...(prev || {}), paymentDetails: { ...(prev?.paymentDetails || {}), schedule: e.target.value } }))} className="border border-gray-200 rounded-lg px-4 py-2" />
                    </div>
                    <div className="grid gap-2 md:col-span-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center"><span className="w-3 h-3 bg-lime-500 rounded-full mr-2"></span>Phương thức thanh toán</label>
                      <input placeholder="VD: Chuyển khoản" value={summaryData?.paymentDetails?.paymentMethod ?? ''} onChange={(e) => setSummaryData((prev: any) => ({ ...(prev || {}), paymentDetails: { ...(prev?.paymentDetails || {}), paymentMethod: e.target.value } }))} className="border border-gray-200 rounded-lg px-4 py-2" />
                    </div>
                  </div>
                </div>

                {/* Các bên & điều khoản - dạng bảng chỉnh sửa, không hiển thị JSON thuần */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-violet-50 to-purple-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Thông tin các bên</h2>
                    <span className="px-3 py-1 bg-violet-100 text-violet-700 text-xs font-medium rounded-full">Các bên</span>
                  </div>
                  <div className="p-6">
                    <EditableArrayTable
                      data={summaryData?.parties || []}
                      setData={(rows) => setSummaryData((prev: any) => ({ ...(prev || {}), parties: rows }))}
                      columns={[
                        { key: 'role', label: 'Vai trò' },
                        { key: 'name', label: 'Tên' },
                        { key: 'representative', label: 'Đại diện' },
                        { key: 'taxCode', label: 'MST' },
                        { key: 'contact', label: 'Liên hệ' },
                        { key: 'address', label: 'Địa chỉ' }
                      ]}
                      addRowTemplate={{ role: '', name: '', representative: '', taxCode: '', contact: '', address: '' }}
                    />
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-cyan-50 to-blue-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Các điều khoản nổi bật</h2>
                    <span className="px-3 py-1 bg-cyan-100 text-cyan-700 text-xs font-medium rounded-full">Điều khoản</span>
                  </div>
                  <div className="p-6 grid gap-8">
                    <EditableArrayTable
                      title="Điều khoản chính"
                      data={summaryData?.keyClauses || []}
                      setData={(rows) => setSummaryData((prev: any) => ({ ...(prev || {}), keyClauses: rows }))}
                      columns={[
                        { key: 'name', label: 'Tên' },
                        { key: 'description', label: 'Mô tả' },
                        { key: 'source', label: 'Nguồn/Điều khoản' }
                      ]}
                      addRowTemplate={{ name: '', description: '', source: '' }}
                    />
                    <EditableArrayTable
                      title="Điều khoản có lợi"
                      data={summaryData?.favorableClauses || []}
                      setData={(rows) => setSummaryData((prev: any) => ({ ...(prev || {}), favorableClauses: rows }))}
                      columns={[
                        { key: 'name', label: 'Tên' },
                        { key: 'description', label: 'Mô tả' },
                        { key: 'benefitTo', label: 'Có lợi cho' }
                      ]}
                      addRowTemplate={{ name: '', description: '', benefitTo: '' }}
                    />
                    <EditableArrayTable
                      title="Điều khoản bất lợi"
                      data={summaryData?.unfavorableClauses || []}
                      setData={(rows) => setSummaryData((prev: any) => ({ ...(prev || {}), unfavorableClauses: rows }))}
                      columns={[
                        { key: 'name', label: 'Tên' },
                        { key: 'description', label: 'Mô tả' },
                        { key: 'riskTo', label: 'Bất lợi cho' }
                      ]}
                      addRowTemplate={{ name: '', description: '', riskTo: '' }}
                    />
                  </div>
                </div>

                {/* Rủi ro */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-rose-50 to-pink-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Đánh giá rủi ro</h2>
                    <span className="px-3 py-1 bg-rose-100 text-rose-700 text-xs font-medium rounded-full">Rủi ro</span>
                  </div>
                  <div className="p-6 grid gap-6">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center"><span className="w-3 h-3 bg-rose-500 rounded-full mr-2"></span>Mức độ rủi ro</label>
                      <select value={summaryData?.riskAssessment?.riskLevel ?? 'MEDIUM'} onChange={(e) => setSummaryData((prev: any) => ({ ...(prev || {}), riskAssessment: { ...(prev?.riskAssessment || {}), riskLevel: e.target.value } }))} className="border border-gray-200 rounded-lg px-4 py-2">
                        <option value="LOW">LOW</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="HIGH">HIGH</option>
                      </select>
                    </div>
                    <EditableArrayTable
                      title="Yếu tố rủi ro"
                      data={summaryData?.riskAssessment?.riskFactors || []}
                      setData={(rows) => setSummaryData((prev: any) => ({ ...(prev || {}), riskAssessment: { ...(prev?.riskAssessment || {}), riskFactors: rows } }))}
                      columns={[{ key: 'text', label: 'Nội dung' }]}
                      addRowTemplate={{ text: '' }}
                    />
                    <EditableArrayTable
                      title="Biện pháp giảm thiểu"
                      data={summaryData?.riskAssessment?.mitigationMeasures || []}
                      setData={(rows) => setSummaryData((prev: any) => ({ ...(prev || {}), riskAssessment: { ...(prev?.riskAssessment || {}), mitigationMeasures: rows } }))}
                      columns={[{ key: 'text', label: 'Nội dung' }]}
                      addRowTemplate={{ text: '' }}
                    />
                  </div>
                </div>

                {/* Tuân thủ */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-slate-50 to-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Trạng thái tuân thủ</h2>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">Tuân thủ</span>
                  </div>
                  <div className="p-6 grid gap-6">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center"><span className="w-3 h-3 bg-gray-500 rounded-full mr-2"></span>Trạng thái</label>
                      <select value={summaryData?.complianceStatus?.status ?? 'REVIEW_REQUIRED'} onChange={(e) => setSummaryData((prev: any) => ({ ...(prev || {}), complianceStatus: { ...(prev?.complianceStatus || {}), status: e.target.value } }))} className="border border-gray-200 rounded-lg px-4 py-2">
                        <option value="COMPLIANT">COMPLIANT</option>
                        <option value="NON_COMPLIANT">NON_COMPLIANT</option>
                        <option value="REVIEW_REQUIRED">REVIEW_REQUIRED</option>
                      </select>
                    </div>
                    <EditableArrayTable
                      title="Vấn đề"
                      data={summaryData?.complianceStatus?.issues || []}
                      setData={(rows) => setSummaryData((prev: any) => ({ ...(prev || {}), complianceStatus: { ...(prev?.complianceStatus || {}), issues: rows } }))}
                      columns={[{ key: 'text', label: 'Mô tả' }]}
                      addRowTemplate={{ text: '' }}
                    />
                    <EditableArrayTable
                      title="Khuyến nghị"
                      data={summaryData?.complianceStatus?.recommendations || []}
                      setData={(rows) => setSummaryData((prev: any) => ({ ...(prev || {}), complianceStatus: { ...(prev?.complianceStatus || {}), recommendations: rows } }))}
                      columns={[{ key: 'text', label: 'Mô tả' }]}
                      addRowTemplate={{ text: '' }}
                    />
                  </div>
                </div>

                {/* Sticky control panel */}
                <div className="fixed bottom-4 right-4 sm:right-6 lg:right-8 bg-white/90 backdrop-blur border border-gray-200 p-2 z-50 rounded-xl shadow-lg w-auto">
                  <div className="flex items-center justify-end gap-3">
                    <div className="flex gap-3">
                      <button
                        onClick={() => setSummaryData(null)
                        }
                        className="inline-flex items-center px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 text-sm"
                      >
                        Làm trống dữ liệu
                      </button>
                      <button
                        onClick={() => {
                          toast.success('Đã lưu và tải lên hệ thống (demo)')
                        }}
                        className="inline-flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-md hover:from-blue-700 hover:to-indigo-700 text-sm"
                      >
                        Lưu và tải lên hệ thống
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
      {/* OCR Result Modal */}
      {isOcrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsOcrModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-3xl mx-4 rounded-2xl shadow-2xl border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Kết quả trích xuất</h3>
              <button onClick={() => setIsOcrModalOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {extractedText ? (
                <pre className="text-sm text-gray-800 whitespace-pre-wrap">{extractedText}</pre>
              ) : (
                <p className="text-gray-500">Không có dữ liệu.</p>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
              <button onClick={() => setIsOcrModalOpen(false)} className="btn-secondary">Đóng</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
