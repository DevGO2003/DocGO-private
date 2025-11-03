import { Card, CardContent } from '@shared/components';
import { CommonIcon } from '@shared/components/UIComponents/Icon/CommonIcon';

interface MetadataTabProps {
  fileData: any;
}

export function MetadataTab({ fileData }: MetadataTabProps) {
  const fileSystemMetadata = fileData?.fileSystemMetadata || {};
  const originalDocMetadata = fileData?.originalDocumentMetadata || {};

  return (
    <div className="space-y-6">
      {/* File System Metadata */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <CommonIcon name="folder" className="w-5 h-5 mr-2" style={{ color: '#4f46e5' }} />
            Thông tin File System
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs" style={{ color: '#6b7280' }} >Tên file gốc</label>
              <p className="text-sm font-medium" style={{ color: '#111827' }} >
                {fileSystemMetadata.originalFilename || 'Chưa xác định'}
              </p>
            </div>
            <div>
              <label className="text-xs" style={{ color: '#6b7280' }} >Kích thước</label>
              <p className="text-sm font-medium" style={{ color: '#111827' }} >
                {fileSystemMetadata.originalFileSize
                  ? `${(fileSystemMetadata.originalFileSize / 1024).toFixed(2)} KB`
                  : 'Chưa xác định'}
              </p>
            </div>
            <div>
              <label className="text-xs" style={{ color: '#6b7280' }} >Loại MIME</label>
              <p className="text-sm font-medium" style={{ color: '#111827' }} >
                {fileSystemMetadata.originalMimeType || 'Chưa xác định'}
              </p>
            </div>
            <div>
              <label className="text-xs" style={{ color: '#6b7280' }} >MD5 Checksum</label>
              <p className="text-sm font-medium text-xs" style={{ color: '#111827' }} >
                {fileSystemMetadata.originalMD5 || 'Chưa xác định'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Metadata */}
      {Object.keys(originalDocMetadata).length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Metadata Tài liệu</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {originalDocMetadata.dcTitle && (
                <div>
                  <label className="text-xs" style={{ color: '#6b7280' }} >DC Title</label>
                  <p className="text-sm font-medium" style={{ color: '#111827' }} >
                    {originalDocMetadata.dcTitle}
                  </p>
                </div>
              )}
              {originalDocMetadata.dcCreator && (
                <div>
                  <label className="text-xs" style={{ color: '#6b7280' }} >DC Creator</label>
                  <p className="text-sm font-medium" style={{ color: '#111827' }} >
                    {originalDocMetadata.dcCreator}
                  </p>
                </div>
              )}
              {originalDocMetadata.dcFormat && (
                <div>
                  <label className="text-xs" style={{ color: '#6b7280' }} >DC Format</label>
                  <p className="text-sm font-medium" style={{ color: '#111827' }} >
                    {originalDocMetadata.dcFormat}
                  </p>
                </div>
              )}
              {originalDocMetadata.xmpCreatorTool && (
                <div>
                  <label className="text-xs" style={{ color: '#6b7280' }} >Creator Tool</label>
                  <p className="text-sm font-medium" style={{ color: '#111827' }} >
                    {originalDocMetadata.xmpCreatorTool}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
