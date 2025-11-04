import React from 'react'

interface UploadPanelProps {
  selectedFile: File | null
  setSelectedFile: (file: File | null) => void
  ocrFileInputRef: React.RefObject<HTMLInputElement>
  handleOcrFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleOcrExtract: () => void
  ocrLoading: boolean
}

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

export default function UploadPanel({
  selectedFile,
  setSelectedFile,
  ocrFileInputRef,
  handleOcrFileSelect,
  handleOcrExtract,
  ocrLoading
}: UploadPanelProps) {
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    switch (extension) {
      case 'pdf':
        return (
          <svg style={{ color: '#dc2626' }} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        )
      case 'docx':
        return (
          <svg style={{ color: '#2563eb' }} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        )
      default:
        return (
          <svg style={{ color: '#4b5563' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
    }
  }

  return (
    <div className="rounded-2xl border overflow-hidden flex flex-col" style={{ borderColor: '#e5e7eb', backgroundColor: '#ffffff', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }} >
      <div className="p-4 border-b" style={{ borderColor: '#f3f4f6' }} >
        <h3 className="text-base font-semibold" style={{ color: '#111827' }} >
          Upload file <span className="font-normal" style={{ color: '#6b7280' }} >• Chọn file để xử lý OCR và phân loại</span>
        </h3>
      </div>
      <div className="p-4 overflow-auto">
        <input
          ref={ocrFileInputRef}
          type="file"
          onChange={handleOcrFileSelect}
          className="hidden"
        />

        {selectedFile ? (
          // File Selected State
          <div className="space-y-3">
            <div className="grid grid-cols-[40px_1fr] gap-3 p-3 rounded-lg border" style={{ borderColor: '#bfdbfe', backgroundColor: '#eff6ff' }} >
              <div className="h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#dbeafe' }} >
                {getFileIcon(selectedFile.name)}
              </div>
              <div className="min-w-0 w-full col-start-2 row-start-1">
                <h4 className="text-sm font-semibold" style={{ color: '#111827' }} title={selectedFile.name}>{selectedFile.name}</h4>
                <p className="text-xs mb-2" style={{ color: '#4b5563' }} >
                  {formatFileSize(selectedFile.size)} • {selectedFile.type || 'Không xác định'}
                </p>
              </div>
              <div className="col-span-2 grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSelectedFile(null)}
                  className="inline-flex w-full justify-center px-3 py-1.5 text-xs border hover:bg-gray-50 rounded-lg transition-colors" style={{ borderColor: '#d1d5db', color: '#374151' }} >
                  Chọn file khác
                </button>
                <button
                  onClick={() => ocrFileInputRef.current?.click()}
                  className="inline-flex w-full justify-center px-3 py-1.5 text-xs border hover:bg-blue-50 rounded-lg transition-colors" style={{ borderColor: '#2563eb', color: '#2563eb' }} >
                  Thay đổi
                </button>
              </div>
            </div>

            {/* Upload Button */}
            <button
              onClick={handleOcrExtract}
              disabled={!selectedFile || ocrLoading}
              className="w-full inline-flex items-center justify-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md transition-all duration-200" style={{ backgroundColor: '#2563eb', color: '#ffffff', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }} >
              {ocrLoading ? (
                <>
                  <svg className="mr-2" style={{ color: '#ffffff' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang upload...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Xác nhận tải lên tài liệu
                </>
              )}
            </button>
          </div>
        ) : (
          // Empty State
          <div className="text-center py-6">
            <div className="h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundImage: 'linear-gradient(to bottom right, ...)' /* MANUAL FIX NEEDED */ }} >
              <svg className="h-8" style={{ color: '#2563eb' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h4 className="text-base font-semibold mb-2" style={{ color: '#111827' }} >Kéo thả file vào đây để upload</h4>
            <p className="text-sm mb-3" style={{ color: '#4b5563' }} >Hỗ trợ mọi loại file • Tối đa 50MB</p>
            <button
              onClick={() => ocrFileInputRef.current?.click()}
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors" style={{ backgroundColor: '#2563eb', color: '#ffffff' }} >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Chọn file
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
