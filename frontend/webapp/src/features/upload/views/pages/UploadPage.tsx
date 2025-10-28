import React, { useState, useRef } from 'react'
import { ControlMainLayout } from '@shared/layouts'
import UploadLayout from '../../layouts/UploadLayout'
import VersioningPanel from '../components/VersioningPanel'
import PreviewFactory from '../components/previews/PreviewFactory'
import SystemInfoPanel from '../components/SystemInfoPanel'

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [ocrLoading, setOcrLoading] = useState(false)
  const [createFromOldVersion, setCreateFromOldVersion] = useState(false)
  const [baseContractId, setBaseContractId] = useState('')
  const [newVersionName, setNewVersionName] = useState('')
  const ocrFileInputRef = useRef<HTMLInputElement>(null)

  const handleOcrFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      console.log('File selected:', file.name)
    }
  }

  const handleOcrExtract = async () => {
    if (!selectedFile) return

    setOcrLoading(true)
    try {
      console.log('Uploading file:', selectedFile.name)
      // TODO: Implement upload logic
      // const response = await uploadFile(selectedFile)

      // Simulate upload
      await new Promise(resolve => setTimeout(resolve, 2000))
      console.log('Upload completed')
      setSelectedFile(null)
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setOcrLoading(false)
    }
  }

  return (
    <ControlMainLayout
      title="Upload tài liệu"
      subtitle="Sử dụng AI để trích xuất nội dung từ tài liệu hợp đồng một cách chính xác"
      breadcrumbs={[{ label: 'Upload', href: '/upload' }]}
    >
      <UploadLayout>
        {/* Left Column: Upload Controls */}
        <div className="lg:col-span-1 space-y-6 flex flex-col">
              {/* Versioning + Upload - Same Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Versioning Panel */}
                <div>
                  <VersioningPanel
                    createFromOldVersion={createFromOldVersion}
                    setCreateFromOldVersion={setCreateFromOldVersion}
                    baseContractId={baseContractId}
                    setBaseContractId={setBaseContractId}
                    newVersionName={newVersionName}
                    setNewVersionName={setNewVersionName}
                  />
                </div>

                {/* Upload Panel - No scroll */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col min-h-fit">
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="text-base font-semibold text-gray-900">
                      Tải tệp lên <span className="text-gray-500 font-normal">• Chọn file để xử lý OCR và phân loại</span>
                    </h3>
                  </div>
                  <div className="p-4 flex-1">
                    <input
                      ref={ocrFileInputRef}
                      type="file"
                      onChange={handleOcrFileSelect}
                      className="hidden"
                    />

                    {selectedFile ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-[40px_1fr] gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="min-w-0 w-full">
                            <h4 className="text-sm font-semibold text-gray-900 break-words" title={selectedFile.name}>{selectedFile.name}</h4>
                            <p className="text-xs text-gray-600">
                              {(selectedFile.size / 1024).toFixed(2)} KB • {selectedFile.type || 'Không xác định'}
                            </p>
                          </div>
                          <div className="col-span-2 grid grid-cols-2 gap-2">
                            <button
                              onClick={() => setSelectedFile(null)}
                              className="inline-flex w-full justify-center px-3 py-1.5 text-xs border border-gray-300 text-gray-700 bg-transparent hover:bg-gray-50 rounded-lg transition-colors"
                            >
                              Chọn file khác
                            </button>
                            <button
                              onClick={() => ocrFileInputRef.current?.click()}
                              className="inline-flex w-full justify-center px-3 py-1.5 text-xs border border-blue-600 text-blue-600 bg-transparent hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              Thay đổi
                            </button>
                          </div>
                        </div>

                        <button
                          onClick={handleOcrExtract}
                          disabled={!selectedFile || ocrLoading}
                          className="w-full inline-flex items-center justify-center px-4 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md transition-all duration-200"
                        >
                          {ocrLoading ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                              Xác nhận tải tệp lên
                            </>
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <h4 className="text-base font-semibold text-gray-900 mb-2">Kéo thả file vào đây để upload</h4>
                        <p className="text-sm text-gray-600 mb-3">Hỗ trợ mọi loại file • Tối đa 50MB</p>
                        <button
                          onClick={() => ocrFileInputRef.current?.click()}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Chọn file
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* System Info Panel */}
              <SystemInfoPanel />
            </div>

            {/* Right Column: File Preview */}
            <div className="lg:col-span-2 lg:row-span-3">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col w-full h-full">
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex-shrink-0">
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedFile ? `Preview: ${selectedFile.name}` : 'Chọn file để xem trước'}
                  </p>
                </div>
<div className="p-4 overflow-visible">
                  {selectedFile ? (
                    <PreviewFactory file={selectedFile} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-gray-500 font-medium">Chọn file để xem trước</p>
                        <p className="text-sm text-gray-400 mt-1">Hỗ trợ PDF, hình ảnh, tài liệu, Excel, audio, video</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
      </UploadLayout>
    </ControlMainLayout>
  )
}
