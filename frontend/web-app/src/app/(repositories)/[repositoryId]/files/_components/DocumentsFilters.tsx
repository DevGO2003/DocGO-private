'use client'

import React from 'react'

interface DocumentsFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  sortBy: string
  onSortChange: (value: string) => void
  sortDirection: 'ASC' | 'DESC'
  onSortDirectionChange: (value: 'ASC' | 'DESC') => void
}

export default function DocumentsFilters({
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  sortDirection,
  onSortDirectionChange
}: DocumentsFiltersProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tìm kiếm
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm kiếm tài liệu..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sắp xếp theo
          </label>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="createdAt">Ngày tạo</option>
            <option value="title">Tên tài liệu</option>
            <option value="status">Trạng thái</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Thứ tự
          </label>
          <select
            value={sortDirection}
            onChange={(e) => onSortDirectionChange(e.target.value as 'ASC' | 'DESC')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="DESC">Giảm dần</option>
            <option value="ASC">Tăng dần</option>
          </select>
        </div>
      </div>
    </div>
  )
}
