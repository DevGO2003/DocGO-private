import React, { useState, useRef } from 'react'
import { HeaderPanel, PrimaryContent } from '@shared/components'
import UploadPanel from '../components/UploadPanel'
import VersioningPanel from '../components/VersioningPanel'
import FilePreview from '../components/FilePreview'
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
    <div className="min-h-screen bg-gray-50">
      <div className="space-y-6">
        <HeaderPanel 
          title="Upload tài liệu"
          subtitle="Sử dụng AI để trích xuất nội dung từ tài liệu hợp đồng một cách chính xác"
          breadcrumbs={[{ label: 'Tài liệu', href: '/documents' }, { label: 'Upload', current: true }]}
        />

        <PrimaryContent>
          <div className="space-y-6">
            {/* Grid Layout: 5 columns, 2 rows */}
            <div className="grid grid-cols-1 lg:grid-cols-5 lg:grid-rows-2 gap-6">
              {/* Row 1 - Left Column: Versioning Panel (1x1) */}
              <div className="lg:col-span-1 lg:row-span-1">
                <VersioningPanel
                  createFromOldVersion={createFromOldVersion}
                  setCreateFromOldVersion={setCreateFromOldVersion}
                  baseContractId={baseContractId}
                  setBaseContractId={setBaseContractId}
                  newVersionName={newVersionName}
                  setNewVersionName={setNewVersionName}
                />
              </div>

              {/* Row 1 - Left Column: Upload Panel (1x1) */}
              <div className="lg:col-span-1 lg:row-span-1">
                <UploadPanel
                  selectedFile={selectedFile}
                  setSelectedFile={setSelectedFile}
                  ocrFileInputRef={ocrFileInputRef}
                  handleOcrFileSelect={handleOcrFileSelect}
                  handleOcrExtract={handleOcrExtract}
                  ocrLoading={ocrLoading}
                />
              </div>

              {/* Right Column: File Preview (3x2) */}
              <div className="lg:col-span-3 lg:row-span-2">
                <FilePreview selectedFile={selectedFile} />
              </div>

              {/* Row 2 - Left Column: System Info Panel (2x1) */}
              <div className="lg:col-span-2 lg:row-span-1">
                <SystemInfoPanel />
              </div>
            </div>
          </div>
        </PrimaryContent>
      </div>
    </div>
  )
}
