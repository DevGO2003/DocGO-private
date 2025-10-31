import React from 'react'
import { PreviewPanel } from '@shared/components'

interface FilePreviewProps {
  selectedFile: File | null
}

export default function FilePreview({ selectedFile }: FilePreviewProps) {
  return (
    <PreviewPanel
      selectedFile={selectedFile}
      title={selectedFile ? `Xem trước • ${selectedFile.name}` : undefined}
      placeholder="Chọn file để xem trước"
      supportedFormats="Hỗ trợ PDF, DOCX, hình ảnh, video, audio, và nhiều định dạng khác"
      showOfficeWarning={false}
      className="flex-1 overflow-auto p-6 flex items-center justify-center"
    >
      {selectedFile && (
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-700 font-medium">{selectedFile.name}</p>
          <p className="text-sm text-gray-500 mt-2">
            {(selectedFile.size / 1024).toFixed(2)} KB • {selectedFile.type || 'Unknown type'}
          </p>
          <p className="text-xs text-gray-400 mt-4">
            Preview sẽ hiển thị khi file được upload
          </p>
        </div>
      )}
    </PreviewPanel>
  )
}
