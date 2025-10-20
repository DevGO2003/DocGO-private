'use client'

import React from 'react'

interface DocumentsTableProps {
  documents: any[]
  page: number
  pageSize: number
  totalElements: number
  onPageChange: (page: number) => void
  loading: boolean
  repositoryId?: string
  onReload: () => void
}

export default function DocumentsTable({
  documents,
  page,
  pageSize,
  totalElements,
  onPageChange,
  loading,
  repositoryId,
  onReload
}: DocumentsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tên tài liệu
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Loại
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Trạng thái
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ngày tạo
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Hành động
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {documents.map((doc) => (
            <tr key={doc.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{doc.title}</div>
                <div className="text-sm text-gray-500">{doc.description}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                  {doc.contractType || doc.category}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  doc.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                  doc.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {doc.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(doc.createdAt).toLocaleDateString('vi-VN')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <a
                  href={`/repositories/${repositoryId}/files/${doc.id}`}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  Xem chi tiết
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {documents.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          Không có tài liệu nào
        </div>
      )}
      
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        </div>
      )}
    </div>
  )
}
