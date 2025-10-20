'use client'

import React from 'react'

interface DocumentsFiltersProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  activeTab: string
  onTabChange: (tab: string) => void
  pageSize: number
  onPageSizeChange: (size: number) => void
  sortBy: string
  sortDirection: 'ASC' | 'DESC'
  onSortChange: (options: { sortBy: string; sortDirection: 'ASC' | 'DESC' }) => void
}

export default function DocumentsFilters({
  searchTerm,
  onSearchChange,
  activeTab,
  onTabChange,
  pageSize,
  onPageSizeChange,
  sortBy,
  sortDirection,
  onSortChange
}: DocumentsFiltersProps) {
  return (
    <div className="flex items-center gap-4">
      <input
        type="text"
        placeholder="Tìm kiếm tài liệu..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <select
        value={pageSize}
        onChange={(e) => onPageSizeChange(Number(e.target.value))}
        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
      >
        <option value={10}>10 / trang</option>
        <option value={20}>20 / trang</option>
        <option value={50}>50 / trang</option>
      </select>
    </div>
  )
}
