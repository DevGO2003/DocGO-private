import React, { useEffect } from 'react';

interface UploadSuccessToastProps {
  fileName: string;
  fileSize?: string;
  isVisible: boolean;
  onClose: () => void;
  onViewFile?: () => void;
  onViewDetails?: () => void;
  autoHide?: boolean;
  duration?: number;
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
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, autoHide, duration, onClose]);

  if (!isVisible) return null;

  const formatFileSize = (size?: string) => {
    if (!size) return '';
    return ` (${size})`;
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 transform transition-all duration-300 ease-out">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 text-green-500 flex items-center justify-center text-xl">✅</div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">
                ✅ Tải lên thành công
              </h4>
              <p className="text-xs text-gray-500">
                Tệp đã được lưu vào hệ thống
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
          >
            <div className="w-5 h-5 flex items-center justify-center text-lg">✕</div>
          </button>
        </div>

        {/* File Info */}
        <div className="mb-4">
          <p className="text-sm text-gray-800 font-medium truncate">
            {fileName}{formatFileSize(fileSize)}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Tệp đã được xử lý và sẵn sàng sử dụng
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          {onViewFile && (
            <button
              onClick={onViewFile}
              className="flex-1 px-3 py-2 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              👁️ Xem tệp
            </button>
          )}
          {onViewDetails && (
            <button
              onClick={onViewDetails}
              className="flex-1 px-3 py-2 bg-gray-600 text-white text-xs rounded-md hover:bg-gray-700 transition-colors font-medium"
            >
              📄 Chi tiết
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mt-3 w-full bg-gray-200 rounded-full h-1">
          <div className="bg-green-500 h-1 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default UploadSuccessToast;