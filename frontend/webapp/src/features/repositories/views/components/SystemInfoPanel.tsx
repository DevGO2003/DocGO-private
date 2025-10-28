import React from 'react'

export const SystemInfoPanel: React.FC<{ fileInfo: any }> = ({ fileInfo }) => {
  const info = fileInfo || {}
  return (
    <div className="text-sm space-y-2">
      <div className="flex justify-between">
        <span className="text-gray-600">File ID</span>
        <span className="font-medium">{info.id || '-'}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">MIME Type</span>
        <span className="font-medium">{info.mimeType || info.type || '-'}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Kích thước</span>
        <span className="font-medium">{typeof info.fileSize === 'number' ? `${info.fileSize} bytes` : '-'}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Tải lên lúc</span>
        <span className="font-medium">{info.createdAt ? new Date(info.createdAt).toLocaleString('vi-VN') : '-'}</span>
      </div>
    </div>
  )
}
