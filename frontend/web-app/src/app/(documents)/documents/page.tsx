 use client

import React from 'react'
import TitlePanel from '@/components/ui/TitlePanel'
import EmptyState from '@/components/ui/EmptyState'
import DocumentControlPanel from '@/components/documents/DocumentControlPanel'
import CustomTable from '@/components/documents/CustomTable'
import TableSettings, { TableColumn } from '@/components/documents/TableSettings'

export default function DocumentsPage() {
  const [columns, setColumns] = React.useState<TableColumn[]>([
    { key: 'name', label: 'Tên tài liệu', visible: true },
    { key: 'type', label: 'Loại', visible: true },
    { key: 'status', label: 'Trạng thái', visible: true },
    { key: 'updatedAt', label: 'Cập nhật', visible: true },
  ])

  const [items] = React.useState<any[]>([])

  return (
    <div className=\px-4 py-6\>
      <TitlePanel title=\Tài liệu\ subtitle=\Quản lý tất cả tài liệu của bạn\ />

      <div className=\mt-4\>
        <DocumentControlPanel />
      </div>

      <div className=\mt-4\>
        <TableSettings columns={columns} onChange={setColumns} />
      </div>

      <div className=\mt-4\>
        {items.length === 0 ? (
          <EmptyState title=\Chưa có tài liệu\ description=\Hãy tải lên hoặc tạo tài liệu mới.\ />
        ) : (
          <CustomTable items={items} columns={columns} />
        )}
      </div>
    </div>
  )
}
