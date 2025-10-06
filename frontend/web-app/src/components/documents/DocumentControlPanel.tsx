import React from  react
import { Button } from @/components/ui

interface DocumentControlPanelProps {
  onCreate?: () => void
  onRefresh?: () => void
}

export default function DocumentControlPanel({ onCreate, onRefresh }: DocumentControlPanelProps) {
  return (
    <div className=\flex items-center justify-between\>
      <div className=\text-sm text-gray-600\>Bộ lọc và thao tác nhanh</div>
      <div className=\flex items-center gap-2\>
        <Button onClick={onRefresh}>Làm mới</Button>
        <Button onClick={onCreate}>Tạo tài liệu</Button>
      </div>
    </div>
  )
}
