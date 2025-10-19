import React from 'react'

interface File {
  id: string
  name: string
  description?: string
  category: string
  createdAt: string
  size: number
  mimeType?: string
}

interface FilesTableProps {
  files: File[]
  isLoading?: boolean
  totalPages: number
  currentPage: number
  onPageChange: (page: number) => void
  onFileClick?: (fileId: string) => void
}

export function FilesTable({
  files,
  isLoading,
  totalPages,
  currentPage,
  onPageChange,
  onFileClick
}: FilesTableProps) {
  if (isLoading) {
    return <div className="text-center py-8">Loading files...</div>
  }

  if (files.length === 0) {
    return <div className="text-center py-12 text-gray-500">No files found</div>
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Description
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Category
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Size
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {files.map((file) => (
            <tr 
              key={file.id}
              onClick={() => onFileClick?.(file.id)}
              className="cursor-pointer hover:bg-gray-50"
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {file.name}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {file.description || 'No description'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  {file.category}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(file.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {(file.size / 1024).toFixed(2)} KB
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">
              Page {currentPage + 1} of {totalPages}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="px-3 py-1 text-sm font-medium rounded-md disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
              className="px-3 py-1 text-sm font-medium rounded-md disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
