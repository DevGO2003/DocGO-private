import React from 'react'

export const FilePreview: React.FC<{ fileInfo: any }> = ({ fileInfo }) => {
  if (!fileInfo) {
    return <div className="text-sm text-gray-500">Chưa có file để xem trước.</div>
  }

  const name: string = fileInfo.name || fileInfo.originalName || fileInfo.file?.name || `File ${fileInfo.id}`
  const mime = fileInfo.mimeType || fileInfo.type || fileInfo.file?.type
  const isPdf = typeof mime === 'string' && mime.includes('pdf')

  return (
    <div className="space-y-3">
      <div className="text-sm text-gray-600">{name} ({mime || 'unknown'})</div>
      <div className="border rounded-lg overflow-hidden min-h-[240px] flex items-center justify-center bg-gray-50">
        {isPdf ? (
          <div className="text-gray-500 text-sm p-6">Xem trước PDF sẽ hiển thị sau khi có URL ký hoặc viewer.</div>
        ) : (
          <div className="text-gray-500 text-sm p-6">Chưa hỗ trợ xem trước loại file này.</div>
        )}
      </div>
    </div>
  )
}
