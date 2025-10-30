import { Card, CardContent } from '@shared/components';
import { Database } from 'lucide-react';

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
            <Database className="w-5 h-5 mr-2 text-indigo-600" />
            Thông tin File System
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500">Tên file gốc</label>
              <p className="text-sm font-medium text-gray-900">
                {fileSystemMetadata.originalFilename || 'Chưa xác định'}
              </p>
            </div>
            <div>
              <label className="text-xs text-gray-500">Kích thước</label>
              <p className="text-sm font-medium text-gray-900">
                {fileSystemMetadata.originalFileSize
                  ? `${(fileSystemMetadata.originalFileSize / 1024).toFixed(2)} KB`
                  : 'Chưa xác định'}
              </p>
            </div>
            <div>
              <label className="text-xs text-gray-500">Loại MIME</label>
              <p className="text-sm font-medium text-gray-900">
                {fileSystemMetadata.originalMimeType || 'Chưa xác định'}
              </p>
            </div>
            <div>
              <label className="text-xs text-gray-500">MD5 Checksum</label>
              <p className="text-sm font-medium text-gray-900 font-mono text-xs">
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
                  <label className="text-xs text-gray-500">DC Title</label>
                  <p className="text-sm font-medium text-gray-900">
                    {originalDocMetadata.dcTitle}
                  </p>
                </div>
              )}
              {originalDocMetadata.dcCreator && (
                <div>
                  <label className="text-xs text-gray-500">DC Creator</label>
                  <p className="text-sm font-medium text-gray-900">
                    {originalDocMetadata.dcCreator}
                  </p>
                </div>
              )}
              {originalDocMetadata.dcFormat && (
                <div>
                  <label className="text-xs text-gray-500">DC Format</label>
                  <p className="text-sm font-medium text-gray-900">
                    {originalDocMetadata.dcFormat}
                  </p>
                </div>
              )}
              {originalDocMetadata.xmpCreatorTool && (
                <div>
                  <label className="text-xs text-gray-500">Creator Tool</label>
                  <p className="text-sm font-medium text-gray-900">
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
