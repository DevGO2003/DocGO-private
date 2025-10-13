'use client'

import React, { useState } from 'react'
import { ArrowPathIcon, DocumentTextIcon, ExclamationTriangleIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface OCRTabProps {
  documentData: any
}

export function OCRTab({ documentData }: OCRTabProps) {
  const [isRetrying, setIsRetrying] = useState(false)
  
  // Get OCR data from document
  const ocrText = documentData?.ocrText || ''
  const ocrStatus = documentData?.ocrStatus || 'PENDING'
  const processingStatus = documentData?.processingStatus || 'PENDING'
  const processingError = documentData?.processingError || ''
  
  const handleRetryOCR = async () => {
    if (!documentData?.id) {
      toast.error('Không tìm thấy ID tài liệu')
      return
    }
    
    setIsRetrying(true)
    try {
      const response = await fetch(`/api/documents/${documentData.id}/retry-ocr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const result = await response.json()
      
      if (response.ok) {
        toast.success('Đã gửi yêu cầu retry OCR thành công!')
        // TODO: Refresh document data to show updated status
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        throw new Error(result.description || 'Có lỗi xảy ra khi retry OCR')
      }
    } catch (error) {
      console.error('Retry OCR error:', error)
      toast.error('Có lỗi xảy ra khi retry OCR')
    } finally {
      setIsRetrying(false)
    }
  }
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />
      case 'PROCESSING':
        return <ClockIcon className="w-5 h-5 text-blue-500 animate-spin" />
      case 'FAILED':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
      default:
        return <ClockIcon className="w-5 h-5 text-gray-400" />
    }
  }
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'Hoàn thành'
      case 'PROCESSING':
        return 'Đang xử lý'
      case 'FAILED':
        return 'Thất bại'
      default:
        return 'Chờ xử lý'
    }
  }
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-700 bg-green-50 border-green-200'
      case 'PROCESSING':
        return 'text-blue-700 bg-blue-50 border-blue-200'
      case 'FAILED':
        return 'text-red-700 bg-red-50 border-red-200'
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200'
    }
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Nội dung OCR</h3>
          <p className="text-sm text-gray-600">Văn bản được trích xuất từ tài liệu bằng công nghệ OCR</p>
        </div>
        
        {/* Status Badge */}
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(ocrStatus)}`}>
          {getStatusIcon(ocrStatus)}
          {getStatusText(ocrStatus)}
        </div>
      </div>
      
      {/* Processing Status */}
      {processingStatus && processingStatus !== 'COMPLETED' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <ClockIcon className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Trạng thái xử lý</span>
          </div>
          <p className="text-sm text-blue-700">
            Tài liệu đang được xử lý OCR và phân loại tự động. Quá trình này có thể mất vài phút.
          </p>
        </div>
      )}
      
      {/* Error Message */}
      {processingError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />
            <span className="text-sm font-medium text-red-800">Lỗi xử lý</span>
          </div>
          <p className="text-sm text-red-700">{processingError}</p>
        </div>
      )}
      
      {/* OCR Content */}
      {ocrText ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900">Văn bản đã trích xuất</h4>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <DocumentTextIcon className="w-4 h-4" />
              {ocrText.length.toLocaleString()} ký tự
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 max-h-96 overflow-y-auto">
            <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono leading-relaxed">
              {ocrText}
            </pre>
          </div>
          
          {/* Copy Button */}
          <div className="flex justify-end">
            <button
              onClick={() => {
                navigator.clipboard.writeText(ocrText)
                toast.success('Đã sao chép văn bản OCR!')
              }}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Sao chép văn bản
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            {ocrStatus === 'PROCESSING' ? 'Đang xử lý OCR...' : 
             ocrStatus === 'FAILED' ? 'OCR thất bại' : 
             'Chưa có nội dung OCR'}
          </h4>
          <p className="text-sm text-gray-600 mb-6">
            {ocrStatus === 'PROCESSING' ? 'Tài liệu đang được xử lý OCR. Vui lòng chờ...' :
             ocrStatus === 'FAILED' ? 'Quá trình OCR gặp lỗi. Bạn có thể thử lại.' :
             'Tài liệu chưa được xử lý OCR hoặc không có văn bản để trích xuất.'}
          </p>
          
          {/* Retry Button */}
          {ocrStatus === 'FAILED' && (
            <button
              onClick={handleRetryOCR}
              disabled={isRetrying}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isRetrying ? (
                <>
                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                  Đang retry...
                </>
              ) : (
                <>
                  <ArrowPathIcon className="w-4 h-4" />
                  Retry OCR
                </>
              )}
            </button>
          )}
        </div>
      )}
      
      {/* Classification Result */}
      {documentData?.classificationResult && (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Kết quả phân loại</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-600">Loại tài liệu:</span>
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                {documentData.classificationResult.document_type || 'Không xác định'}
              </span>
            </div>
            {documentData.classificationResult.confidence && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-600">Độ tin cậy:</span>
                <span className="text-xs text-gray-700">
                  {(documentData.classificationResult.confidence * 100).toFixed(1)}%
                </span>
              </div>
            )}
            {documentData.classificationResult.reasoning && (
              <div className="flex items-start gap-2">
                <span className="text-xs font-medium text-gray-600">Lý do:</span>
                <span className="text-xs text-gray-700">{documentData.classificationResult.reasoning}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}


