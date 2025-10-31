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
              <Flex gap={8} style={{ flexWrap: 'wrap' }}>
                {onViewDetails && (
                  <Button 
                    onClick={onViewDetails}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 6,
                      minWidth: 140 
                    }}
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Xem chi tiết
                  </Button>
                )}
                {onViewFile && (
                  <Button 
                    variant="secondary" 
                    onClick={onViewFile}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 6,
                      minWidth: 140 
                    }}
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Xem preview
                  </Button>
                )}
              </Flex>
              <Flex gap={8} style={{ flexWrap: 'wrap' }}>
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
