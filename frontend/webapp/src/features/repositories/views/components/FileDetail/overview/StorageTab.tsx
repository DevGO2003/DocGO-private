import { Card, CardContent } from '@shared/components';
import { CommonIcon } from '@shared/components/UIComponents/Icon/CommonIcon';

interface StorageTabProps {
  fileData: any;
}

export function StorageTab({ fileData }: StorageTabProps) {
  const storage = fileData?.storage || {};
  const s3 = storage.s3 || {};
  const local = storage.local || {};

  const formatBytes = (bytes: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Storage Type */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <CommonIcon name="folder" className="w-5 h-5 mr-2 text-indigo-600" />
            Loại lưu trữ
          </h3>
          <div className="inline-block px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
            {storage.type?.toUpperCase() || 'UNKNOWN'}
          </div>
        </CardContent>
      </Card>

      {/* S3 Storage */}
      {s3.url && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <CommonIcon name="upload" className="w-5 h-5 mr-2 text-blue-600" />
              Amazon S3
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {s3.url && (
                <div>
                  <label className="text-xs text-gray-500">URL</label>
                  <p className="text-sm font-medium text-gray-900 break-all">{s3.url}</p>
                </div>
              )}
              {s3.bucket && (
                <div>
                  <label className="text-xs text-gray-500">Bucket</label>
                  <p className="text-sm font-medium text-gray-900">{s3.bucket}</p>
                </div>
              )}
              {s3.objectKey && (
                <div>
                  <label className="text-xs text-gray-500">Object Key</label>
                  <p className="text-sm font-medium text-gray-900 break-all">{s3.objectKey}</p>
                </div>
              )}
              {s3.region && (
                <div>
                  <label className="text-xs text-gray-500">Region</label>
                  <p className="text-sm font-medium text-gray-900">{s3.region}</p>
                </div>
              )}
              {s3.contentType && (
                <div>
                  <label className="text-xs text-gray-500">Content Type</label>
                  <p className="text-sm font-medium text-gray-900">{s3.contentType}</p>
                </div>
              )}
              {s3.size && (
                <div>
                  <label className="text-xs text-gray-500">Kích thước</label>
                  <p className="text-sm font-medium text-gray-900">{formatBytes(s3.size)}</p>
                </div>
              )}
              {s3.versionId && (
                <div>
                  <label className="text-xs text-gray-500">Version ID</label>
                  <p className="text-sm font-medium text-gray-900 font-mono text-xs">{s3.versionId}</p>
                </div>
              )}
              {s3.etag && (
                <div>
                  <label className="text-xs text-gray-500">ETag</label>
                  <p className="text-sm font-medium text-gray-900 font-mono text-xs">{s3.etag}</p>
                </div>
              )}
              {s3.checksum && (
                <div className="md:col-span-2">
                  <label className="text-xs text-gray-500">Checksum</label>
                  <pre className="text-xs bg-gray-50 p-2 rounded mt-1 overflow-x-auto">
                    {JSON.stringify(s3.checksum, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Local Storage */}
      {local.path && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <CommonIcon name="folder" className="w-5 h-5 mr-2 text-green-600" />
              Lưu trữ cục bộ
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {local.path && (
                <div>
                  <label className="text-xs text-gray-500">Đường dẫn</label>
                  <p className="text-sm font-medium text-gray-900 break-all">{local.path}</p>
                </div>
              )}
              {local.filename && (
                <div>
                  <label className="text-xs text-gray-500">Tên file</label>
                  <p className="text-sm font-medium text-gray-900">{local.filename}</p>
                </div>
              )}
              {local.mimeType && (
                <div>
                  <label className="text-xs text-gray-500">MIME Type</label>
                  <p className="text-sm font-medium text-gray-900">{local.mimeType}</p>
                </div>
              )}
              {local.size && (
                <div>
                  <label className="text-xs text-gray-500">Kích thước</label>
                  <p className="text-sm font-medium text-gray-900">{formatBytes(local.size)}</p>
                </div>
              )}
              {local.mtime && (
                <div>
                  <label className="text-xs text-gray-500">Thời gian sửa đổi</label>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(local.mtime).toLocaleString('vi-VN')}
                  </p>
                </div>
              )}
              {local.revision && (
                <div>
                  <label className="text-xs text-gray-500">Revision</label>
                  <p className="text-sm font-medium text-gray-900">{local.revision}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
