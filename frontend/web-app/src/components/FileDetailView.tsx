'use client'

import React, { useState } from 'react'
import { 
  DocumentTextIcon, 
  ArrowUpTrayIcon, 
  TrashIcon, 
  ArrowDownTrayIcon, 
  EllipsisVerticalIcon, 
  XMarkIcon,
  EyeIcon,
  InformationCircleIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  ShieldCheckIcon,
  DocumentIcon
} from '@heroicons/react/24/outline'

interface FileDetailViewProps {
  file: {
    id: string
    name: string
    size: number
    type: string
    uploadDate: string
    lastModified: string
    storagePath: string
    tags: string[]
    description?: string
    metadata?: Record<string, any>
  }
  onClose: () => void
  onSave: (fileData: any) => void
  onDiscard: () => void
}

export default function FileDetailView({ file, onClose, onSave, onDiscard }: FileDetailViewProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'content' | 'metadata' | 'notes' | 'history' | 'permissions'>('details')
  const [fileData, setFileData] = useState(file)

  const getExtension = (fileName: string) => fileName.split('.').pop()?.toLowerCase() || ''
  const isPdf = () => fileData?.type?.toLowerCase() === 'application/pdf' || getExtension(fileData.name) === 'pdf'

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    switch (extension) {
      case 'pdf':
        return (
          <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
        )
      case 'doc':
      case 'docx':
        return (
          <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
        )
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return (
          <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z" />
          </svg>
        )
      case 'txt':
        return (
          <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
        )
      default:
        return (
          <svg className="w-8 h-8 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
        )
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const tabs = [
    { id: 'details', label: 'Details', icon: DocumentIcon },
    { id: 'content', label: 'Content', icon: EyeIcon },
    { id: 'metadata', label: 'Metadata', icon: InformationCircleIcon },
    { id: 'notes', label: 'Notes', icon: ChatBubbleLeftRightIcon },
    { id: 'history', label: 'History', icon: ClockIcon },
    { id: 'permissions', label: 'Permissions', icon: ShieldCheckIcon },
  ];

  return (
    <div className="fixed inset-0 z-50 flex bg-gray-900 bg-opacity-50">
      <div className="flex w-full h-full">
        {/* Left Panel - File Details */}
        <div className="w-2/5 bg-white border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <button className="p-1 hover:bg-gray-100 rounded">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button className="p-1 hover:bg-gray-100 rounded">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <h1 className="text-lg font-semibold text-gray-900 truncate">{fileData.name}</h1>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
              <XMarkIcon className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex space-x-2">
              <button
                onClick={onDiscard}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Discard
              </button>
              <button
                onClick={() => onSave(fileData)}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Save & close
              </button>
              <button
                onClick={() => onSave(fileData)}
                className="px-3 py-2 text-sm bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors"
              >
                Save
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-3 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-700'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'details' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={fileData.name}
                    onChange={(e) => setFileData({ ...fileData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Archive serial number
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Auto-generated"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <button className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                      +1
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date created
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="date"
                      value={fileData.uploadDate}
                      onChange={(e) => setFileData({ ...fileData, uploadDate: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <EllipsisVerticalIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correspondent
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Select correspondent"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <EllipsisVerticalIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Document type
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Select document type"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <EllipsisVerticalIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Storage path
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={fileData.storagePath}
                      onChange={(e) => setFileData({ ...fileData, storagePath: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <EllipsisVerticalIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Add tags"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <EllipsisVerticalIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'content' && (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">File Preview</h4>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        {getFileIcon(fileData.name)}
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900">{fileData.name}</h5>
                        <p className="text-sm text-gray-500">{formatFileSize(fileData.size)} • {fileData.type}</p>
                      </div>
                    </div>
                    
                    {/* Preview Area */}
                    <div className="border border-gray-200 rounded-lg bg-gray-50 min-h-[200px] flex items-stretch justify-center">
                      {isPdf() && fileData.storagePath ? (
                        <iframe
                          title="PDF Preview"
                          src={fileData.storagePath}
                          className="w-full h-[60vh] rounded"
                        />
                      ) : (
                        <div className="p-4 flex flex-1 items-center justify-center">
                          <div className="text-center">
                            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-3">
                              {getFileIcon(fileData.name)}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">Preview not available</p>
                            <button className="text-sm text-indigo-600 hover:text-indigo-800">
                              Download to view
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* File Actions */}
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Actions</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <button className="flex items-center justify-center px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                      <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                      Download
                    </button>
                    <button className="flex items-center justify-center px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                      <EyeIcon className="w-4 h-4 mr-2" />
                      Open
                    </button>
                    <button className="flex items-center justify-center px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                      <DocumentTextIcon className="w-4 h-4 mr-2" />
                      Convert
                    </button>
                    <button className="flex items-center justify-center px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                      <ArrowUpTrayIcon className="w-4 h-4 mr-2" />
                      Replace
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'metadata' && (
              <div className="space-y-4">
                {/* Basic File Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">File Information</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">Media filename:</span>
                      <span className="text-gray-900 font-medium">0000001.pdf</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">Original filename:</span>
                      <span className="text-gray-900">hop-dong-mua-ban-mau.pdf</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">Date added:</span>
                      <span className="text-gray-900">Oct 6, 2025</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">Date modified:</span>
                      <span className="text-gray-900">Oct 6, 2025</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Storage Path:</span>
                      <span className="text-gray-900">{fileData.storagePath}</span>
                    </div>
                  </div>
                </div>

                {/* File Checksums & Sizes */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">File Integrity</h4>
                  <div className="space-y-3 text-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h5 className="font-medium text-gray-700 text-xs uppercase tracking-wide">Original File</h5>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Size:</span>
                            <span className="text-gray-900">426 KB</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">MD5:</span>
                            <span className="text-gray-900 font-mono text-xs">f9b07506959649e35a7059e1ec72d6c8</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">MIME Type:</span>
                            <span className="text-gray-900">application/pdf</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h5 className="font-medium text-gray-700 text-xs uppercase tracking-wide">Archive File</h5>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Size:</span>
                            <span className="text-gray-900">360 KB</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">MD5:</span>
                            <span className="text-gray-900 font-mono text-xs">5bed7aced1c88d667bf8ba4c41bd114b</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Format:</span>
                            <span className="text-gray-900">application/pdf</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Original Document Metadata */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Original Document Metadata</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600">PDF Producer:</span>
                      <span className="text-gray-900">Microsoft® Word 2019</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600">Title:</span>
                      <span className="text-gray-900">HỢP ĐỒNG MUA BÁN</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600">Creator:</span>
                      <span className="text-gray-900">Ulysses R. Gotera</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600">Creator Tool:</span>
                      <span className="text-gray-900">Microsoft® Word 2019</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600">Create Date:</span>
                      <span className="text-gray-900">2021-05-15T15:12:28+07:00</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600">Modify Date:</span>
                      <span className="text-gray-900">2021-05-15T15:12:28+07:00</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600">Document ID:</span>
                      <span className="text-gray-900 font-mono text-xs">uuid:04DFD82F-510C-4565-B095-0AB3A07666C4</span>
                    </div>
                  </div>
                </div>

                {/* Archived Document Metadata */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Archived Document Metadata</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600">PDF Producer:</span>
                      <span className="text-gray-900">pikepdf 9.5.2</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600">Creator Tool:</span>
                      <span className="text-gray-900">OCRmyPDF 16.10.4 / Tesseract OCR-hOCR 5.3.0</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600">Metadata Date:</span>
                      <span className="text-gray-900">2025-10-06T02:08:18.881731+00:00</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600">Modify Date:</span>
                      <span className="text-gray-900">2025-10-06T02:08:18+00:00</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600">Create Date:</span>
                      <span className="text-gray-900">2021-05-15T15:12:28+07:00</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600">Document ID:</span>
                      <span className="text-gray-900 font-mono text-xs">uuid:df79416c-da75-11fb-0000-992aa399c760</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600">Format:</span>
                      <span className="text-gray-900">application/pdf</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600">Title:</span>
                      <span className="text-gray-900">HỢP ĐỒNG MUA BÁN</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600">Creator:</span>
                      <span className="text-gray-900">Ulysses R. Gotera</span>
                    </div>
                  </div>
                </div>

                {/* Custom Properties */}
                {fileData.metadata && Object.keys(fileData.metadata).length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Custom Properties</h4>
                    <div className="space-y-2 text-sm">
                      {Object.entries(fileData.metadata).map(([key, value]) => (
                        <div key={key} className="flex justify-between py-1">
                          <span className="text-gray-600 capitalize">{key}:</span>
                          <span className="text-gray-900">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">File Notes</h4>
                  <textarea
                    rows={6}
                    placeholder="Add notes about this file..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  />
                  <div className="mt-2 flex justify-between items-center text-xs text-gray-500">
                    <span>Private notes - only visible to you</span>
                    <span>0/500 characters</span>
                  </div>
                </div>

                {/* Existing Notes */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Recent Notes</h4>
                  <div className="space-y-2">
                    <div className="bg-white border border-gray-200 rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">Initial Review</span>
                        <span className="text-xs text-gray-500">2 hours ago</span>
                      </div>
                      <p className="text-sm text-gray-700">This document needs to be reviewed by legal team before final approval.</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">Updated Version</span>
                        <span className="text-xs text-gray-500">1 day ago</span>
                      </div>
                      <p className="text-sm text-gray-700">Updated with latest terms and conditions as per client request.</p>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Quick Actions</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <button className="flex items-center justify-center px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                      <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2" />
                      Add Comment
                    </button>
                    <button className="flex items-center justify-center px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                      <DocumentTextIcon className="w-4 h-4 mr-2" />
                      Create Summary
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Activity Timeline</h4>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">File uploaded</p>
                          <p className="text-xs text-gray-500">2 hours ago</p>
                        </div>
                        <p className="text-sm text-gray-600">Uploaded by John Doe</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">Metadata updated</p>
                          <p className="text-xs text-gray-500">1 hour ago</p>
                        </div>
                        <p className="text-sm text-gray-600">Updated by Jane Smith</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">File viewed</p>
                          <p className="text-xs text-gray-500">30 minutes ago</p>
                        </div>
                        <p className="text-sm text-gray-600">Viewed by Admin User</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">Downloaded</p>
                          <p className="text-xs text-gray-500">15 minutes ago</p>
                        </div>
                        <p className="text-sm text-gray-600">Downloaded by John Doe</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <EyeIcon className="h-8 w-8 text-blue-500" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-500">Views</p>
                        <p className="text-2xl font-semibold text-gray-900">12</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <ArrowDownTrayIcon className="h-8 w-8 text-green-500" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-500">Downloads</p>
                        <p className="text-2xl font-semibold text-gray-900">3</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Export History */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Export History</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                      <div className="flex items-center space-x-3">
                        <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">PDF Export</p>
                          <p className="text-xs text-gray-500">Generated 1 hour ago</p>
                        </div>
                      </div>
                      <button className="text-sm text-indigo-600 hover:text-indigo-800">Download</button>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                      <div className="flex items-center space-x-3">
                        <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Word Export</p>
                          <p className="text-xs text-gray-500">Generated 2 hours ago</p>
                        </div>
                      </div>
                      <button className="text-sm text-indigo-600 hover:text-indigo-800">Download</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'permissions' && (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Access Control</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-2 border-b border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-indigo-700">JD</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">John Doe</p>
                          <p className="text-xs text-gray-500">Owner</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">Full Access</span>
                        <button className="text-sm text-gray-400 hover:text-gray-600">
                          <EllipsisVerticalIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-700">JS</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Jane Smith</p>
                          <p className="text-xs text-gray-500">Editor</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">Edit</span>
                        <button className="text-sm text-gray-400 hover:text-gray-600">
                          <EllipsisVerticalIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">MT</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Marketing Team</p>
                          <p className="text-xs text-gray-500">Viewer</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 text-xs font-medium text-gray-800 bg-gray-100 rounded-full">View Only</span>
                        <button className="text-sm text-gray-400 hover:text-gray-600">
                          <EllipsisVerticalIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Permission Settings */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Permission Settings</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Public Access</p>
                        <p className="text-xs text-gray-500">Allow anyone with the link to view</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Download Permission</p>
                        <p className="text-xs text-gray-500">Allow users to download this file</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Comment Permission</p>
                        <p className="text-xs text-gray-500">Allow users to add comments</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Share Options */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Share Options</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <button className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                        </svg>
                        Copy Link
                      </button>
                      <button className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                        Invite People
                      </button>
                    </div>
                    <div className="text-xs text-gray-500">
                      <p>• Link sharing is currently disabled</p>
                      <p>• Only invited users can access this file</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Action Buttons */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <button
                onClick={onDiscard}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Discard
              </button>
              <button
                onClick={() => onSave(fileData)}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Save & close
              </button>
              <button
                onClick={() => onSave(fileData)}
                className="px-3 py-2 text-sm bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel - Document Preview */}
        <div className="flex-1 bg-white flex flex-col">
          {/* Top Bar */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Page 1 of 3</span>
              <div className="flex items-center space-x-2">
                <button className="p-1 hover:bg-gray-100 rounded">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">100%</span>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                <TrashIcon className="w-4 h-4 inline mr-1" />
                Delete
              </button>
              <button className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                <ArrowDownTrayIcon className="w-4 h-4 inline mr-1" />
                Download
              </button>
              <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                Actions
              </button>
              <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                Custom Fields
              </button>
              <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                Send
              </button>
            </div>
          </div>

          {/* Document Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
            <div className="mx-auto bg-white rounded-lg shadow-sm p-4">
              {isPdf() && fileData.storagePath ? (
                <iframe
                  title="PDF Viewer"
                  src={fileData.storagePath}
                  className="w-full h-[78vh] rounded"
                />
              ) : (
                <div className="text-center text-sm text-gray-600 py-16">
                  No preview available for this file type.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}



