import React, { useEffect } from 'react'

interface UploadSuccessToastProps {
  fileName: string
  fileSize?: string
  isVisible: boolean
  onClose: () => void
  onViewFile?: () => void
  onViewDetails?: () => void
  autoHide?: boolean
  duration?: number
}

const UploadSuccessToast: React.FC<UploadSuccessToastProps> = ({
  fileName,
  fileSize,
  isVisible,
  onClose,
  onViewFile,
  onViewDetails,
  autoHide = true,
  duration = 5000
}) => {
  useEffect(() => {
    if (isVisible && autoHide) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [isVisible, autoHide, duration, onClose])

  if (!isVisible) return null

  const formatFileSize = (size?: string) => {
    if (!size) return ''
    return ` (${size})`
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
      <div className="rounded-lg border p-4 transition-all duration-300" style={{ borderColor: '#e5e7eb', backgroundColor: '#ffffff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 flex items-center justify-center text-xl" style={{ color: '#22c55e' }} >✅</div>
            <div>
              <h4 className="text-sm font-semibold" style={{ color: '#111827' }} >
                ✅ Tải lên thành công
              </h4>
              <p className="text-xs" style={{ color: '#6b7280' }} >
                Tệp đã được lưu vào hệ thống
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="hover: transition-colors flex-shrink-0" style={{ color: '#9ca3af' }} >
            <div className="w-5 h-5 flex items-center justify-center text-lg">✕</div>
          </button>
        </div>

        {/* File Info */}
        <div className="mb-4">
          <p className="text-sm font-medium truncate" style={{ color: '#1f2937' }} >
            {fileName}{formatFileSize(fileSize)}
          </p>
          <p className="text-xs mt-1" style={{ color: '#4b5563' }} >
            Tệp đã được xử lý và sẵn sàng sử dụng
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          {onViewFile && (
            <button
              onClick={onViewFile}
              className="flex-1 px-3 py-2 text-xs rounded-md hover:bg-blue-700 transition-colors font-medium" style={{ backgroundColor: '#2563eb', color: '#ffffff' }} >
              👁️ Xem tệp
            </button>
          )}
          {onViewDetails && (
            <button
              onClick={onViewDetails}
              className="flex-1 px-3 py-2 text-xs rounded-md hover:bg-gray-700 transition-colors font-medium" style={{ backgroundColor: '#4b5563', color: '#ffffff' }} >
              📄 Chi tiết
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mt-3 w-full rounded-full" style={{ backgroundColor: '#e5e7eb' }} >
          <div className="bg-green-500 h-1 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}

export default UploadSuccessToast
