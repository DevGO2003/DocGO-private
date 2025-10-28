import React from 'react'
import { Input, Card, CardContent, Text, Switch } from '@shared/components'

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
    <Card>
      <CardContent className="pt-4">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <Text as="h4" className="text-base font-semibold text-gray-900">
              Tạo phiên bản từ hợp đồng cũ <span className="text-gray-500 font-normal">• Chọn hợp đồng đã có để tạo phiên bản mới</span>
            </Text>
            <Text as="p" className="text-xs text-amber-600" style={{ marginTop: 4 }}>Tính năng đang tạm thời vô hiệu hóa. Sẽ có ở phiên bản sau.</Text>
          </div>
          <div>
            <Switch checked={false} disabled onChange={() => {}} aria-label="Tạo phiên bản từ hợp đồng cũ (đang tạm tắt)" />
            <Text as="span" className="text-sm text-gray-700" style={{ marginLeft: 8 }}>Tạm tắt</Text>
          </div>
        </div>

        {false && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <Input
                label="ID hợp đồng gốc"
                type="text"
                value={baseContractId}
                onChange={(e) => setBaseContractId((e.target as any).value)}
                placeholder="VD: 1024"
                helperText="Nhập ID của hợp đồng cần tạo phiên bản mới."
                disabled
              />
            </div>
            <div>
              <Input
                label="Tên phiên bản mới (tùy chọn)"
                type="text"
                value={newVersionName}
                onChange={(e) => setNewVersionName((e.target as any).value)}
                placeholder="VD: v2 hoặc 2.0"
                helperText="Để trống để hệ thống tự đánh số tiếp theo."
                disabled
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
