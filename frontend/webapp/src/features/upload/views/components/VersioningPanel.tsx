import React from 'react'
import { Input } from '@shared/components'

interface VersioningPanelProps {
  createFromOldVersion: boolean
  setCreateFromOldVersion: (value: boolean) => void
  baseContractId: string
  setBaseContractId: (value: string) => void
  newVersionName: string
  setNewVersionName: (value: string) => void
}

export default function VersioningPanel({
  createFromOldVersion,
  setCreateFromOldVersion,
  baseContractId,
  setBaseContractId,
  newVersionName,
  setNewVersionName
}: VersioningPanelProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm h-80 overflow-hidden flex flex-col">
      <div className="p-4 overflow-auto">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="text-base font-semibold text-gray-900">
              Tạo phiên bản từ hợp đồng cũ <span className="text-gray-500 font-normal">• Chọn hợp đồng đã có để tạo phiên bản mới</span>
            </h4>
          </div>
          <label className="inline-flex items-center cursor-pointer select-none">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={createFromOldVersion} 
              onChange={(e) => setCreateFromOldVersion(e.target.checked)} 
              aria-checked={createFromOldVersion} 
              aria-label="Tạo phiên bản từ hợp đồng cũ" 
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-indigo-600 transition-colors relative">
              <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 shadow peer-checked:translate-x-[20px]" />
            </div>
            <span className="ml-3 text-sm text-gray-700">{createFromOldVersion ? 'Bật' : 'Tắt'}</span>
          </label>
        </div>

        {createFromOldVersion && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                label="ID hợp đồng gốc"
                type="text"
                value={baseContractId}
                onChange={(e) => setBaseContractId(e.target.value)}
                placeholder="VD: 1024"
                helperText="Nhập ID của hợp đồng cần tạo phiên bản mới."
              />
            </div>
            <div>
              <Input
                label="Tên phiên bản mới (tùy chọn)"
                type="text"
                value={newVersionName}
                onChange={(e) => setNewVersionName(e.target.value)}
                placeholder="VD: v2 hoặc 2.0"
                helperText="Để trống để hệ thống tự đánh số tiếp theo."
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
