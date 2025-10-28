'use client'

import React, { useState, useEffect } from 'react'
import JSZip from 'jszip'
import { PreviewProps } from '@/lib/preview/types'

interface ArchiveFile {
  name: string
  size: number
  isDirectory: boolean
  lastModified: Date
}

export default function ArchivePreview({ file, onError }: PreviewProps) {
  const [files, setFiles] = useState<ArchiveFile[]>([])
  const [loading, setLoading] = useState(true)
  const [totalSize, setTotalSize] = useState(0)
  const [fileCount, setFileCount] = useState(0)
  
  useEffect(() => {
    const processArchive = async () => {
      try {
        setLoading(true)
        
        // Chỉ hỗ trợ ZIP files hiện tại (JSZip)
        if (!file.name.toLowerCase().endsWith('.zip')) {
          throw new Error('Chỉ hỗ trợ file ZIP. File RAR và 7Z sẽ được hỗ trợ trong tương lai.')
        }
        
        const zip = await JSZip.loadAsync(file)
        const archiveFiles: ArchiveFile[] = []
        let total = 0
        let count = 0
        
        Object.keys(zip.files).forEach(filename => {
          const zipFile = zip.files[filename]
          if (!zipFile) return
          
          const isDirectory = zipFile.dir
          const size = (zipFile as any)._data?.uncompressedSize || 0
          
          archiveFiles.push({
            name: filename,
            size,
            isDirectory,
            lastModified: zipFile.date || new Date()
          })
          
          if (!isDirectory) {
            total += size
            count++
          }
        })
        
        // Sắp xếp: directories trước, sau đó theo tên
        archiveFiles.sort((a, b) => {
          if (a.isDirectory && !b.isDirectory) return -1
          if (!a.isDirectory && b.isDirectory) return 1
          return a.name.localeCompare(b.name)
        })
        
        setFiles(archiveFiles)
        setTotalSize(total)
        setFileCount(count)
        setLoading(false)
        
      } catch (error) {
        onError?.(error as Error)
        setLoading(false)
      }
    }
    
    processArchive()
  }, [file, onError])
  
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }
  
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Đang tải archive...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 text-white px-4 py-2 text-sm border-b border-gray-700">
        <div className="flex items-center justify-between">
          <span className="font-mono">{file.name}</span>
          <span className="text-gray-300">
            {fileCount} file{fileCount !== 1 ? 's' : ''} • {formatFileSize(totalSize)}
          </span>
        </div>
      </div>
      
      {/* File List */}
      <div className="flex-1 overflow-auto bg-white">
        {files.length > 0 ? (
          <div className="min-w-full">
            <table className="min-w-full border-collapse">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="border-b border-gray-200 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên file
                  </th>
                  <th className="border-b border-gray-200 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kích thước
                  </th>
                  <th className="border-b border-gray-200 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày sửa
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {files.map((archiveFile, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm">
                      <div className="flex items-center">
                        {archiveFile.isDirectory ? (
                          <svg className="w-4 h-4 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                          </svg>
                        )}
                        <span className={`${archiveFile.isDirectory ? 'text-blue-600 font-medium' : 'text-gray-900'}`}>
                          {archiveFile.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      {archiveFile.isDirectory ? '-' : formatFileSize(archiveFile.size)}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      {formatDate(archiveFile.lastModified)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <p className="text-sm">Không có file nào trong archive</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
