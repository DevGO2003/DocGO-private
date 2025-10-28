'use client'

import React from 'react'
import { useDocumentProgress, ProgressData } from '@/hooks/useDocumentProgress'

interface UploadProgressProps {
  documentId: string | null
  onComplete?: (result: any) => void
  onError?: (error: string) => void
  className?: string
}

const stageMessages: Record<string, string> = {
  'saving_document': 'Đang lưu tài liệu...',
  'uploading_to_storage': 'Đang tải lên storage...',
  'ocr_extracting': 'Đang trích xuất văn bản...',
  'ai_classifying': 'Đang phân loại tài liệu...',
  'ai_summarizing': 'Đang tóm tắt hợp đồng...',
  'processing_complete': 'Xử lý hoàn tất'
}

const stageIcons: Record<string, string> = {
  'saving_document': '💾',
  'uploading_to_storage': '☁️',
  'ocr_extracting': '📄',
  'ai_classifying': '🤖',
  'ai_summarizing': '📝',
  'processing_complete': '✅'
}

export function UploadProgress({ 
  documentId, 
  onComplete, 
  onError, 
  className = '' 
}: UploadProgressProps) {
  const {
    progress,
    stage,
    message,
    isComplete,
    error,
    isConnected,
    progressData
  } = useDocumentProgress(documentId)

  // Handle completion
  React.useEffect(() => {
    if (isComplete && progressData?.result && onComplete) {
      onComplete(progressData.result)
    }
  }, [isComplete, progressData, onComplete])

  // Handle error
  React.useEffect(() => {
    if (error && onError) {
      onError(error)
    }
  }, [error, onError])

  if (!documentId) {
    return null
  }

  const displayMessage = message || stageMessages[stage] || 'Đang xử lý...'
  const displayIcon = stageIcons[stage] || '⏳'

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">{displayIcon}</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Đang xử lý tài liệu
              </h3>
              <p className="text-sm text-gray-600">
                {displayMessage}
              </p>
            </div>
          </div>
          
          {/* Connection status */}
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-xs text-gray-500">
              {isConnected ? 'Đã kết nối' : 'Mất kết nối'}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tiến độ</span>
            <span className="text-gray-900 font-medium">{progress}%</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ease-out ${
                error ? 'bg-red-500' : 
                isComplete ? 'bg-green-500' : 
                'bg-blue-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Stage indicators */}
        <div className="grid grid-cols-5 gap-2">
          {[
            { key: 'saving_document', label: 'Lưu', icon: '💾' },
            { key: 'uploading_to_storage', label: 'Upload', icon: '☁️' },
            { key: 'ocr_extracting', label: 'OCR', icon: '📄' },
            { key: 'ai_classifying', label: 'AI', icon: '🤖' },
            { key: 'processing_complete', label: 'Hoàn tất', icon: '✅' }
          ].map((step, index) => {
            const isActive = stage === step.key
            const isCompleted = progress > (index * 20) + 20
            const isCurrent = isActive
            
            return (
              <div 
                key={step.key}
                className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-all ${
                  isCurrent ? 'bg-blue-50 border border-blue-200' :
                  isCompleted ? 'bg-green-50 border border-green-200' :
                  'bg-gray-50 border border-gray-200'
                }`}
              >
                <div className={`text-lg ${isCurrent ? 'animate-pulse' : ''}`}>
                  {step.icon}
                </div>
                <div className={`text-xs font-medium ${
                  isCurrent ? 'text-blue-700' :
                  isCompleted ? 'text-green-700' :
                  'text-gray-500'
                }`}>
                  {step.label}
                </div>
              </div>
            )
          })}
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <div className="text-red-500">⚠️</div>
              <div>
                <h4 className="text-sm font-medium text-red-800">Lỗi xử lý</h4>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Success message */}
        {isComplete && !error && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <div className="text-green-500">✅</div>
              <div>
                <h4 className="text-sm font-medium text-green-800">Xử lý hoàn tất</h4>
                <p className="text-sm text-green-600">
                  Tài liệu đã được xử lý thành công và sẵn sàng sử dụng.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Debug info (only in development) */}
        {process.env.NODE_ENV === 'development' && progressData && (
          <details className="text-xs text-gray-500">
            <summary className="cursor-pointer">Debug Info</summary>
            <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
              {JSON.stringify(progressData, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}

export default UploadProgress
