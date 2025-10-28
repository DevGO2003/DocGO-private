import React from 'react'

export const VersioningPanel: React.FC<{ fileInfo: any }> = ({ fileInfo }) => {
  return (
    <div className="space-y-3 text-sm">
      <div className="flex items-center gap-2">
        <input id="enable-versioning" type="checkbox" className="rounded" defaultChecked />
        <label htmlFor="enable-versioning">Bật versioning</label>
      </div>
      <div className="flex items-center gap-2">
        <label className="w-28">Version hiện tại</label>
        <input type="text" className="border rounded px-2 py-1 w-32" value={(fileInfo as any)?.version ?? ''} readOnly />
      </div>
      <div className="flex items-center gap-2">
        <label className="w-28">Ghi chú</label>
        <input type="text" className="border rounded px-2 py-1 flex-1" placeholder="Mô tả thay đổi" />
      </div>
    </div>
  )
}
