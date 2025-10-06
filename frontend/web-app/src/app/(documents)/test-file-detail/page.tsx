'use client'

import React, { useState } from 'react'
import { DashboardLayout } from '@/components/layout'
import FileDetailView from '@/components/FileDetailView'

export default function TestFileDetailPage() {
  const [showFileDetail, setShowFileDetail] = useState(false)

  const mockFile = {
    id: 'test-file-1',
    name: 'Hợp đồng mua bán xe ôtô.pdf',
    size: 1024 * 1024 * 2.5, // 2.5 MB
    type: 'application/pdf',
    uploadDate: '2024-01-15',
    lastModified: '2024-01-15',
    storagePath: 'documents/2024',
    tags: ['hợp đồng', 'mua bán', 'xe ôtô'],
    description: 'Hợp đồng mua bán xe ôtô giữa công ty ABC và khách hàng XYZ',
    metadata: {
      author: 'Nguyễn Văn A',
      department: 'Pháp chế',
      version: '1.0'
    }
  }

  const handleSave = (fileData: any) => {
    console.log('Save file:', fileData)
    setShowFileDetail(false)
  }

  const handleDiscard = () => {
    setShowFileDetail(false)
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Test File Detail View</h1>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Mock File Data</h2>
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">Name:</span> {mockFile.name}</div>
              <div><span className="font-medium">Size:</span> {(mockFile.size / 1024 / 1024).toFixed(2)} MB</div>
              <div><span className="font-medium">Type:</span> {mockFile.type}</div>
              <div><span className="font-medium">Upload Date:</span> {mockFile.uploadDate}</div>
              <div><span className="font-medium">Storage Path:</span> {mockFile.storagePath}</div>
              <div><span className="font-medium">Tags:</span> {mockFile.tags.join(', ')}</div>
            </div>
            
            <button
              onClick={() => setShowFileDetail(true)}
              className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Mở File Detail View
            </button>
          </div>
        </div>
      </div>

      {showFileDetail && (
        <FileDetailView
          file={mockFile}
          onClose={() => setShowFileDetail(false)}
          onSave={handleSave}
          onDiscard={handleDiscard}
        />
      )}
    </DashboardLayout>
  )
}

