import React from 'react'

interface OverviewSectionProps {
  overview: {
    title?: string
    status?: string
    documentType?: string
    contractType?: string
    category?: string
    tags?: string[]
    ownerUserId?: string
    language?: string
    region?: string
    new?: boolean
  }
}

export function OverviewSection({ overview }: OverviewSectionProps) {
  if (!overview) return null

  const statusColors: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-800',
    DRAFT: 'bg-gray-100 text-gray-800',
    DELETED: 'bg-red-100 text-red-800',
    ARCHIVED: 'bg-yellow-100 text-yellow-800',
    INACTIVE: 'bg-gray-100 text-gray-600',
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold mb-4">Tổng quan</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-gray-600">Tiêu đề</label>
          <p className="font-medium">{overview.title || 'N/A'}</p>
        </div>

        <div>
          <label className="text-sm text-gray-600">Trạng thái</label>
          <div>
            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${statusColors[overview.status || ''] || 'bg-gray-100 text-gray-800'}`}>
              {overview.status || 'N/A'}
            </span>
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-600">Loại tài liệu</label>
          <p className="font-medium">{overview.documentType || 'N/A'}</p>
        </div>

        <div>
          <label className="text-sm text-gray-600">Loại hợp đồng</label>
          <p className="font-medium">{overview.contractType || 'N/A'}</p>
        </div>

        <div>
          <label className="text-sm text-gray-600">Danh mục</label>
          <p className="font-medium">{overview.category || 'N/A'}</p>
        </div>

        <div>
          <label className="text-sm text-gray-600">Chủ sở hữu</label>
          <p className="font-medium">{overview.ownerUserId || 'N/A'}</p>
        </div>

        <div>
          <label className="text-sm text-gray-600">Ngôn ngữ</label>
          <p className="font-medium">{overview.language?.toUpperCase() || 'N/A'}</p>
        </div>

        <div>
          <label className="text-sm text-gray-600">Khu vực</label>
          <p className="font-medium">{overview.region || 'N/A'}</p>
        </div>

        {overview.tags && overview.tags.length > 0 && (
          <div className="col-span-2">
            <label className="text-sm text-gray-600">Tags</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {overview.tags.map((tag, idx) => (
                <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
