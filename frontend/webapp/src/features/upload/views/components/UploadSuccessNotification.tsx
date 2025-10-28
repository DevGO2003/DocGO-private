import React from 'react'
import { Modal, Card, CardContent, Button, Text } from '@shared/components'
import { Flex, Stack } from '@shared/components'

interface UploadSuccessNotificationProps {
  fileName: string
  fileSize?: string
  fileType?: string
  onViewFile?: () => void
  onDownloadFile?: () => void
  onUploadMore?: () => void
  onViewDetails?: () => void
  onViewList?: () => void
  onClose?: () => void
  showActions?: boolean
}

const UploadSuccessNotification: React.FC<UploadSuccessNotificationProps> = ({
  fileName,
  fileSize,
  fileType,
  onViewFile,
  onDownloadFile,
  onUploadMore,
  onViewDetails,
  onViewList,
  onClose,
  showActions = true
}) => {
  const formatFileSize = (size?: string) => (size ? ` (${size})` : '')

  return (
    <Modal isOpen onClose={onClose} title="Tải lên thành công">
      <Card>
        <CardContent>
          <Flex align="center" justify="between" style={{ marginBottom: 12 }}>
            <Flex align="center" gap={8}>
              <div style={{ width: 32, height: 32, color: '#16a34a', fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✅</div>
              <Stack gap={2}>
                <Text as="h3" className="text-lg font-semibold text-gray-900">Tải lên thành công</Text>
                <Text as="p" className="text-sm text-gray-500">Tệp đã được lưu vào hệ thống</Text>
              </Stack>
            </Flex>
            {onClose && (
              <Button variant="ghost" onClick={onClose}>Đóng</Button>
            )}
          </Flex>

          <Flex align="center" gap={8} style={{ marginBottom: 12 }}>
            <div style={{ width: 20, height: 20, color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📄</div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <Text className="text-sm font-medium text-gray-900" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{fileName}</Text>
              <Text className="text-xs text-gray-500">{fileType?.toUpperCase()}{formatFileSize(fileSize)}</Text>
            </div>
          </Flex>

          {showActions && (
            <Stack gap={8}>
              <Flex gap={8}>
                {onViewFile && <Button onClick={onViewFile}>Xem tệp</Button>}
                {onViewDetails && <Button variant="secondary" onClick={onViewDetails}>Chi tiết</Button>}
                {onViewList && <Button variant="secondary" onClick={onViewList}>Xem danh sách</Button>}
              </Flex>
              <Flex gap={8}>
                {onDownloadFile && <Button variant="outline" onClick={onDownloadFile}>Tải xuống</Button>}
                {onUploadMore && <Button variant="outline" onClick={onUploadMore}>Tải thêm</Button>}
              </Flex>
            </Stack>
          )}
        </CardContent>
      </Card>
    </Modal>
  )
}

export default UploadSuccessNotification
