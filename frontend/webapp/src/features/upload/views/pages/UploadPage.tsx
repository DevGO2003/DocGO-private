import React, { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { REPOSITORY_ROUTES, buildPath } from '@shared/constants/routes'
import UploadLayout from '../../layouts/UploadLayout'
import VersioningPanel from '../components/VersioningPanel'
import PreviewFactory from '../components/previews/PreviewFactory'
import SystemInfoPanel from '../components/SystemInfoPanel'
import UploadSuccessNotification from '../components/UploadSuccessNotification'
import RepositoryPicker from '../components/RepositoryPicker'
import RecentUploadsPanel from '../components/RecentUploadsPanel'
import { automationFileApi } from '../../models/api/automationFileApi'
import { Button, Text, Modal, PreviewPanel, RefreshButton } from '@shared/components'
import env from '@shared/config/env';
import { uploadBus } from '@shared/lib/upload/uploadBus'
import { useQueryClient } from '@tanstack/react-query'

export default function UploadPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [ocrLoading, setOcrLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [createFromOldVersion, setCreateFromOldVersion] = useState(false)
  const [baseContractId, setBaseContractId] = useState('')
  const [newVersionName, setNewVersionName] = useState('')
  const ocrFileInputRef = useRef<HTMLInputElement>(null)

  const [selectedRepositoryId, setSelectedRepositoryId] = useState<string>('')
  const [selectedRepositoryName, setSelectedRepositoryName] = useState<string>('')
  const [recentRefreshKey, setRecentRefreshKey] = useState<number>(0)

  // Prefill repository from URL query params if present
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const repoId = params.get('repositoryId') || ''
    const repoName = params.get('repositoryName') || ''
    if (repoId) setSelectedRepositoryId(repoId)
    if (repoName) setSelectedRepositoryName(decodeURIComponent(repoName))
  }, [location.search])

  const [showSuccess, setShowSuccess] = useState(false)
  const [successInfo, setSuccessInfo] = useState<{
    fileName: string
    fileSize?: string
    fileType?: string
    fileId?: string
    fileUrl?: string
    repositoryId?: string
  } | null>(null)
  const [showError, setShowError] = useState(false)
  const [errorInfo, setErrorInfo] = useState<{ message: string; status?: number } | null>(null)

  // Consume files from global drop (set first file similar to selecting in panel)
  useEffect(() => {
    const pending = uploadBus.consumePendingFiles()
    if (pending && pending.length > 0) {
      setSelectedFile(pending[0])
    }
  }, [location.key])


  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const repoId = params.get('repositoryId') || ''
    const repoName = params.get('repositoryName') || ''
    if (repoId) setSelectedRepositoryId(repoId)
    if (repoName) setSelectedRepositoryName(decodeURIComponent(repoName))
  }, [location.search])

  const handleOcrFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      console.log('File selected:', file.name)
    }
  }

  const handleOcrExtract = async () => {
    if (!selectedFile) return
    if (!selectedRepositoryId) {
      setShowError(true)
      setErrorInfo({ message: 'Vui lòng chọn repository trước khi upload' })
      return
    }

    setOcrLoading(true)
    try {
      const response = await automationFileApi.uploadFile(selectedFile, selectedRepositoryId)
      const name = selectedFile.name
      const sizeStr = `${(selectedFile.size / 1024).toFixed(2)} KB`
      const type = selectedFile.type
      const uploadData = response.data

      setSuccessInfo({
        fileName: name,
        fileSize: sizeStr,
        fileType: type,
        fileId: uploadData?.fileId,
        fileUrl: uploadData?.fileUrl,
        repositoryId: selectedRepositoryId,
      })
      setShowSuccess(true)
      setSelectedFile(null)
      setRecentRefreshKey((k) => k + 1)
    } catch (err: any) {
      const message = err?.body?.description || err?.message || 'Tải lên thất bại'
      const status = err?.status || undefined
      setErrorInfo({ message, status })
      setShowError(true)
      console.error('Upload error:', err)
    } finally {
      setOcrLoading(false)
    }
  }

  const handleRefresh = async () => {
    console.log('[UploadPage] Refreshing data...');
    setIsRefreshing(true);
    try {
      // Reset form state
      setSelectedFile(null);
      setCreateFromOldVersion(false);
      setBaseContractId('');
      setNewVersionName('');

      // Invalidate and refetch queries
      await queryClient.invalidateQueries({ queryKey: ['files'] });
      await queryClient.invalidateQueries({ queryKey: ['my-repositories'] });
      await queryClient.refetchQueries({ queryKey: ['files'] });
      await queryClient.refetchQueries({ queryKey: ['my-repositories'] });

      // Refresh recent uploads panel
      setRecentRefreshKey(prev => prev + 1);

      console.log('[UploadPage] Refresh completed');
    } catch (error) {
      console.error('[UploadPage] Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <UploadLayout
      title="Upload tài liệu"
      subtitle="Sử dụng AI để trích xuất nội dung từ tài liệu hợp đồng một cách chính xác"
      breadcrumbs={[{ label: 'Upload', href: '/upload' }]}
      onRefresh={handleRefresh}
      headerRight={<RefreshButton onClick={handleRefresh} loading={isRefreshing} />}
      extra={(
        <>
          {/* Success Modal */}
          {showSuccess && successInfo && (
            <UploadSuccessNotification
              fileName={successInfo.fileName}
              fileSize={successInfo.fileSize}
              fileType={successInfo.fileType}
              onClose={() => setShowSuccess(false)}
              onUploadMore={() => setShowSuccess(false)}
              onViewDetails={() => {
                if (successInfo.fileId && successInfo.repositoryId) {
                  navigate(buildPath(REPOSITORY_ROUTES.FILE_DETAIL, {
                    id: successInfo.repositoryId,
                    fileId: successInfo.fileId,
                  }))
                  setShowSuccess(false)
                }
              }}
              onViewFile={async () => {
                if (!successInfo?.fileId) return;
                try {
                  const response = await fetch(`${env.apiGatewayUrl}/api/storage/files/${successInfo.fileId}/signed-url`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({}), // or { disposition: 'inline' } if needed for preview
                  });
                  if (!response.ok) throw new Error('Failed to get signed URL');
                  const { data } = await response.json();
                  if (data?.signedUrl) {
                    window.open(data.signedUrl, '_blank');
                  }
                } catch (error) {
                  console.error('Error opening file preview:', error);
                  // Optional: alert or toast error
                }
              }}
              showActions={true}
            />
          )}

          {/* Error Modal */}
          <Modal
            isOpen={showError}
            onClose={() => setShowError(false)}
            title="Tải lên thất bại"
            size="sm"
          >
            <div className="p-4">
              <p className="text-sm text-gray-700">{errorInfo?.message || 'Đã xảy ra lỗi khi tải tệp lên.'}</p>
              {errorInfo?.status && (
                <p className="text-xs text-gray-500 mt-2">Mã lỗi: {errorInfo.status}</p>
              )}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setShowError(false)}
                  className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50"
                >
                  Đóng
                </button>
              </div>
            </div>
          </Modal>
        </>
      )}
    >
        {/* Top: Recent Uploads */}
        <div className="lg:col-span-3">
          <RecentUploadsPanel key={recentRefreshKey} limit={5} />
        </div>
        {/* Left Column: Upload Controls */}
        <div className="lg:col-span-1 space-y-6 flex flex-col">
              {/* Repository Picker */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex-none">
                <RepositoryPicker
                  value={selectedRepositoryId}
                  onChange={(id: string, name: string) => { setSelectedRepositoryId(id); setSelectedRepositoryName(name) }}
                />
              </div>
              {/* Versioning + Upload - Same Row */}
              {/* TODO: Refactor Grid bằng UI Kit nếu có */}
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
                    <h3 className="text-base font-semibold text-gray-900">Tải tệp lên</h3>
                    <p className="text-xs text-gray-500 mt-1">Repository: {selectedRepositoryName || 'Chưa chọn'}</p>
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
                        {/* File selected UI */}
                        <div className="grid grid-cols-[40px_1fr] gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="min-w-0 w-full">
                            <Text as="h4" className="text-sm font-semibold text-gray-900 break-words" title={selectedFile.name}>{selectedFile.name}</Text>
                            <Text as="p" className="text-xs text-gray-600">
                              {(selectedFile.size / 1024).toFixed(2)} KB • {selectedFile.type || 'Không xác định'}
                            </Text>
                          </div>
                          <div className="col-span-2 grid grid-cols-2 gap-2">
                            <Button
                              variant="outline"
                              onClick={() => setSelectedFile(null)}
                              className="w-full text-xs"
                            >
                              Chọn file khác
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => ocrFileInputRef.current?.click()}
                              className="w-full text-xs"
                            >
                              Thay đổi
                            </Button>
                          </div>
                        </div>
                        <Button
                          style={{ width: '100%' }}
                          variant="outline"
                          onClick={handleOcrExtract}
                          disabled={!selectedFile || !selectedRepositoryId || ocrLoading}
                          className="inline-flex items-center justify-center"
                        >
                          {ocrLoading ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Đang tải lên...
                            </>
                          ) : (
                            <>
                              Xác nhận tải tệp lên
                            </>
                          )}
                        </Button>
                        {!selectedRepositoryId && (
                          <p className="text-xs text-red-600 mt-2">Vui lòng chọn repository trước khi tải lên.</p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          Lưu ý: Sẽ mất vài phút để tải và phân tích file.
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        {/* TODO: Refactor icon & text layout bằng UI Kit */}
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <Text as="h4" className="text-base font-semibold text-gray-900 mb-2">Kéo thả file vào đây để upload</Text>
                        <Text as="p" className="text-sm text-gray-600 mb-3">Hỗ trợ mọi loại file • Tối đa 50MB</Text>
                        <Button
                          onClick={() => ocrFileInputRef.current?.click()}
                          className="inline-flex items-center"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Chọn file
                        </Button>
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
              <PreviewPanel
                selectedFile={selectedFile}
                placeholder="Chọn file để xem trước"
                supportedFormats="Hỗ trợ PDF, hình ảnh, tài liệu, Excel, audio, video"
                showOfficeWarning={true}
              >
                {selectedFile && <PreviewFactory file={selectedFile} />}
              </PreviewPanel>
            </div>

      </UploadLayout>
  )
}
