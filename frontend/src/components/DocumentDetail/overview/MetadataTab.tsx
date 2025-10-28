'use client'

import React from 'react'
import { DocumentIcon, CalendarIcon, TagIcon, CogIcon } from '@heroicons/react/24/outline'

interface MetadataTabProps {
  documentData: any
}

function renderKV(label: string, value: any) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-100">
      <span className="text-sm text-gray-600 font-medium">{label}</span>
      <span className="text-sm text-gray-900 text-right max-w-[60%] break-words">{displayValue(value)}</span>
    </div>
  )
}

function displayValue(value: any) {
  if (value === null || value === undefined || value === '') return '—'
  if (Array.isArray(value)) return value.length ? value.join(', ') : '—'
  if (typeof value === 'string' && value.includes('T')) {
    try {
      return new Date(value).toLocaleString('vi-VN')
    } catch {
      return value
    }
  }
  return String(value)
}

export function MetadataTab({ documentData }: MetadataTabProps) {
  return (
    <div className="space-y-6">
      {/* File System Metadata */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <DocumentIcon className="w-6 h-6 text-blue-600 mr-2" />
          <h4 className="text-lg font-medium text-gray-900">🗃 Thông tin hệ thống file</h4>
        </div>
        <div className="bg-white rounded-lg p-4 space-y-1">
          {renderKV('Ngày sửa đổi', documentData?.fileSystemMetadata?.dateModified)}
          {renderKV('Ngày thêm', documentData?.fileSystemMetadata?.dateAdded)}
          {renderKV('Tên file media', documentData?.fileSystemMetadata?.mediaFilename)}
          {renderKV('Tên file gốc', documentData?.fileSystemMetadata?.originalFilename)}
          {renderKV('MD5 gốc', documentData?.fileSystemMetadata?.originalMD5)}
          {renderKV('Kích thước file gốc', documentData?.fileSystemMetadata?.originalFileSize ? `${(documentData.fileSystemMetadata.originalFileSize / 1024).toFixed(1)} KB` : '—')}
          {renderKV('Loại MIME gốc', documentData?.fileSystemMetadata?.originalMimeType)}
          {renderKV('MD5 lưu trữ', documentData?.fileSystemMetadata?.archiveMD5)}
          {renderKV('Kích thước lưu trữ', documentData?.fileSystemMetadata?.archiveFileSize ? `${(documentData.fileSystemMetadata.archiveFileSize / 1024).toFixed(1)} KB` : '—')}
        </div>
      </div>
      
      {/* Original Document Metadata */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <TagIcon className="w-6 h-6 text-green-600 mr-2" />
          <h4 className="text-lg font-medium text-gray-900">📄 Siêu dữ liệu tài liệu gốc</h4>
        </div>
        <div className="bg-white rounded-lg p-4 space-y-1">
          {renderKV('Định dạng DC', documentData?.originalDocumentMetadata?.dcFormat)}
          {renderKV('Tiêu đề DC', documentData?.originalDocumentMetadata?.dcTitle)}
          {renderKV('Tác giả DC', documentData?.originalDocumentMetadata?.dcCreator)}
          {renderKV('Mô tả DC', documentData?.originalDocumentMetadata?.dcDescription)}
          {renderKV('Chủ đề DC', documentData?.originalDocumentMetadata?.dcSubject)}
          {renderKV('Ngày tạo XMP', documentData?.originalDocumentMetadata?.xmpCreateDate)}
          {renderKV('Công cụ tạo XMP', documentData?.originalDocumentMetadata?.xmpCreatorTool)}
          {renderKV('Ngày sửa XMP', documentData?.originalDocumentMetadata?.xmpModifyDate)}
          {renderKV('Ngày metadata XMP', documentData?.originalDocumentMetadata?.xmpMetadataDate)}
          {renderKV('Từ khóa PDF', documentData?.originalDocumentMetadata?.pdfKeywords)}
          {renderKV('Nhà sản xuất PDF', documentData?.originalDocumentMetadata?.pdfProducer)}
          {renderKV('ID tài liệu XMP', documentData?.originalDocumentMetadata?.xmpDocumentID)}
          {renderKV('ID instance XMP', documentData?.originalDocumentMetadata?.xmpInstanceID)}
          {renderKV('Schemas mở rộng PDF/A', documentData?.originalDocumentMetadata?.pdfaExtensionSchemas)}
        </div>
      </div>

      {/* Archived Document Metadata */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <CogIcon className="w-6 h-6 text-purple-600 mr-2" />
          <h4 className="text-lg font-medium text-gray-900">🗂 Siêu dữ liệu tài liệu lưu trữ</h4>
        </div>
        <div className="bg-white rounded-lg p-4 space-y-1">
          {renderKV('Nhà sản xuất PDF lưu trữ', documentData?.archivedDocumentMetadata?.archivedPdfProducer)}
          {renderKV('Ngày metadata lưu trữ', documentData?.archivedDocumentMetadata?.archivedMetadataDate)}
          {renderKV('Ngày sửa lưu trữ', documentData?.archivedDocumentMetadata?.archivedModifyDate)}
          {renderKV('Ngày tạo lưu trữ', documentData?.archivedDocumentMetadata?.archivedCreateDate)}
          {renderKV('Công cụ tạo lưu trữ', documentData?.archivedDocumentMetadata?.archivedCreatorTool)}
          {renderKV('ID tài liệu lưu trữ', documentData?.archivedDocumentMetadata?.archivedDocumentID)}
          {renderKV('Định dạng DC lưu trữ', documentData?.archivedDocumentMetadata?.archivedDcFormat)}
          {renderKV('Tiêu đề DC lưu trữ', documentData?.archivedDocumentMetadata?.archivedDcTitle)}
          {renderKV('Tác giả DC lưu trữ', documentData?.archivedDocumentMetadata?.archivedDcCreator)}
        </div>
      </div>

      {/* Technical Information */}
      <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <CalendarIcon className="w-6 h-6 text-gray-600 mr-2" />
          <h4 className="text-lg font-medium text-gray-900">⚙️ Thông tin kỹ thuật</h4>
        </div>
        <div className="bg-white rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="text-sm font-medium text-gray-900 mb-3">Thông tin xử lý</h5>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Engine OCR:</span>
                  <span className="text-gray-900">Tesseract 5.0</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Ngôn ngữ:</span>
                  <span className="text-gray-900">Vietnamese + English</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Độ tin cậy OCR:</span>
                  <span className="text-gray-900">94.2%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Thời gian xử lý:</span>
                  <span className="text-gray-900">2.3 giây</span>
                </div>
              </div>
            </div>
            
            <div>
              <h5 className="text-sm font-medium text-gray-900 mb-3">Thông tin bảo mật</h5>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Mã hóa:</span>
                  <span className="text-gray-900">AES-256</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Chữ ký số:</span>
                  <span className="text-gray-900">Chưa có</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Watermark:</span>
                  <span className="text-gray-900">Có</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Quyền truy cập:</span>
                  <span className="text-gray-900">Hạn chế</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white border rounded-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Hành động nhanh</h4>
        <div className="flex flex-wrap gap-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm">
            📋 Sao chép metadata
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm">
            📄 Xuất metadata
          </button>
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm">
            🔍 Phân tích sâu
          </button>
          <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition text-sm">
            🔄 Làm mới metadata
          </button>
        </div>
      </div>
    </div>
  )
}
