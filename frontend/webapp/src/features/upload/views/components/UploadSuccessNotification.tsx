import React from 'react'
import { Modal, Button, Text } from '@shared/components'
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
  onUploadMore,
  onViewDetails,
  onClose,
  showActions = true
}) => {
  return (
    <Modal 
      isOpen 
      onClose={onClose || (() => {})} 
      title="Tải lên thành công"
      footer={
        showActions && (
          <div className="flex justify-end gap-3 w-full">
            {onUploadMore && (
              <Button variant="outline" onClick={onUploadMore}>
                <span>📤</span> Tải thêm
              </Button>
            )}
            {onViewDetails && (
              <Button onClick={onViewDetails}>
                <span>📋</span> Xem chi tiết
              </Button>
            )}
          </div>
        )
      }
    >
      {/* Success Icon */}
      <div className="flex flex-col items-center text-center py-4">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <span className="text-3xl">✅</span>
        </div>
        <Text as="p" className="text-sm mb-6" style={{ color: '#6b7280' }}>
          Tệp đã được lưu vào hệ thống thành công!
        </Text>
      </div>

      {/* File Info */}
      <div className="bg-gray-50 rounded-lg p-4 mb-2">
        <Flex align="center" gap={12}>
          <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">📄</span>
          </div>
          <Stack gap={2} style={{ minWidth: 0, flex: 1, textAlign: 'left' }}>
            <Text className="text-sm font-semibold truncate" style={{ color: '#111827' }} title={fileName}>
              {fileName}
            </Text>
            <Text className="text-xs" style={{ color: '#6b7280' }}>
              {fileType?.toUpperCase()} {fileSize && `• ${fileSize}`}
            </Text>
          </Stack>
        </Flex>
      </div>

      </Modal>
  )
}

export default UploadSuccessNotification
