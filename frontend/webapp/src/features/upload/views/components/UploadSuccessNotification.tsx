import React from 'react'

interface UploadSuccessNotificationProps {
  fileName: string
  fileSize?: string
  fileType?: string
  onViewFile?: () => void
  onDownloadFile?: () => void
  onUploadMore?: () => void
  onViewDetails?: () => void
  onViewList?: () => void
  onClose?: () => void
  showActions?: boolean
}

const UploadSuccessNotification: React.FC<UploadSuccessNotificationProps> = ({
  fileName,
  fileSize,
  fileType,
  onViewFile,
  onDownloadFile,
  onUploadMore,
  onViewDetails,
  onViewList,
  onClose,
  showActions = true
}) => {
  const formatFileSize = (size?: string) => {
    if (!size) return ''
    return ` (${size})`
  }

  const getFileIcon = (type?: string) => {
    return (
      <div className="w-5 h-5 text-blue-500 flex items-center justify-center">
        📄
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 ease-out">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 text-green-500 flex items-center justify-center text-2xl">
                ✅
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Tải lên thành công
              </h3>
              <p className="text-sm text-gray-500">
                Tệp đã được lưu vào hệ thống
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <div className="w-6 h-6 flex items-center justify-center text-xl">✕</div>
            </button>
          )}
        </div>

        {/* File Info */}
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            {getFileIcon(fileType)}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {fileName}
              </p>
              <p className="text-xs text-gray-500">
                {fileType?.toUpperCase()}{formatFileSize(fileSize)}
              </p>
            </div>
          </div>

          {/* Success Message */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="w-5 h-5 text-green-500 mr-2 flex items-center justify-center">✅</div>
              <p className="text-sm text-green-800">
                Tệp <span className="font-medium">{fileName}</span> đã được tải lên và xử lý thành công.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          {showActions && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {onViewFile && (
                  <button
                    onClick={onViewFile}
                    className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <div className="w-4 h-4 mr-2">👁️</div>
                    Xem tệp
                  </button>
                )}
                
                {onViewDetails && (
                  <button
                    onClick={onViewDetails}
                    className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                  >
                    <div className="w-4 h-4 mr-2">📄</div>
                    Chi tiết
                  </button>
                )}
                {onViewList && (
                  <button
                    onClick={onViewList}
                    className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                  >
                    <div className="w-4 h-4 mr-2">📚</div>
                    Xem danh sách
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                {onDownloadFile && (
                  <button
                    onClick={onDownloadFile}
                    className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    <div className="w-4 h-4 mr-2">⬇️</div>
                    Tải xuống
                  </button>
                )}
                
                {onUploadMore && (
                  <button
                    onClick={onUploadMore}
                    className="flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                  >
                    <div className="w-4 h-4 mr-2">➕</div>
                    Tải thêm
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Close Button */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UploadSuccessNotification
