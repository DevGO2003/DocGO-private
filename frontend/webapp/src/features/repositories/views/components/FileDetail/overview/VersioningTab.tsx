import { Card, CardContent } from '@shared/components';
import { GitBranch, Clock, CheckCircle } from 'lucide-react';

interface VersioningTabProps {
  fileData: any;
}

export function VersioningTab({ fileData }: VersioningTabProps) {
  const versioning = fileData?.versioning || {};
  const versions = versioning.versions || [];
  const history = versioning.history || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  return (
    <div className="space-y-6">
      {/* Versioning Status */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <GitBranch className="w-5 h-5 mr-2 text-indigo-600" />
            Thông tin phiên bản
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-gray-500">Trạng thái</label>
              <p className="text-sm font-medium text-gray-900 mt-2">
                {versioning.enabled ? (
                  <span className="text-green-600">✓ Bật</span>
                ) : (
                  <span className="text-gray-600">Tắt</span>
                )}
              </p>
            </div>
            <div>
              <label className="text-xs text-gray-500">Phiên bản hiện tại</label>
              <p className="text-sm font-medium text-gray-900 mt-2">
                v{versioning.currentVersion || 1}
              </p>
            </div>
            <div>
              <label className="text-xs text-gray-500">Tổng phiên bản</label>
              <p className="text-sm font-medium text-gray-900 mt-2">
                {versions.length || 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Latest Change */}
      {versioning.latestChange && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-blue-600" />
              Thay đổi gần nhất
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {versioning.latestChange.timestamp && (
                <div>
                  <label className="text-xs text-gray-500">Thời gian</label>
                  <p className="text-sm font-medium text-gray-900 mt-2">
                    {formatDate(versioning.latestChange.timestamp)}
                  </p>
                </div>
              )}
              {versioning.latestChange.changedBy && (
                <div>
                  <label className="text-xs text-gray-500">Người thay đổi</label>
                  <p className="text-sm font-medium text-gray-900 mt-2">
                    {versioning.latestChange.changedBy}
                  </p>
                </div>
              )}
              {versioning.latestChange.changeType && (
                <div>
                  <label className="text-xs text-gray-500">Loại thay đổi</label>
                  <p className="text-sm font-medium text-gray-900 mt-2">
                    {versioning.latestChange.changeType}
                  </p>
                </div>
              )}
              {versioning.latestChange.description && (
                <div className="md:col-span-2">
                  <label className="text-xs text-gray-500">Mô tả</label>
                  <p className="text-sm font-medium text-gray-900 mt-2">
                    {versioning.latestChange.description}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Version History */}
      {versions.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
              Lịch sử phiên bản
            </h3>
            <div className="space-y-3">
              {versions.map((version: any, idx: number) => (
                <div key={idx} className="flex gap-4 pb-3 border-b border-gray-200 last:border-0">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-semibold text-indigo-600">v{version.number || idx + 1}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {version.name || `Version ${version.number || idx + 1}`}
                    </p>
                    {version.description && (
                      <p className="text-xs text-gray-600 mt-1">{version.description}</p>
                    )}
                    <div className="flex gap-4 mt-2 text-xs text-gray-500">
                      {version.createdAt && (
                        <span>{formatDate(version.createdAt)}</span>
                      )}
                      {version.createdBy && (
                        <span>Bởi: {version.createdBy}</span>
                      )}
                      {version.size && (
                        <span>Kích thước: {(version.size / 1024).toFixed(2)} KB</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Change History */}
      {history.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Lịch sử thay đổi chi tiết</h3>
            <div className="space-y-3">
              {history.map((change: any, idx: number) => (
                <div key={idx} className="flex gap-4 pb-3 border-b border-gray-200 last:border-0">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2"></div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {change.changeType || change.action || 'Change'}
                    </p>
                    {change.description && (
                      <p className="text-xs text-gray-600 mt-1">{change.description}</p>
                    )}
                    <div className="flex gap-4 mt-2 text-xs text-gray-500">
                      {change.timestamp && (
                        <span>{formatDate(change.timestamp)}</span>
                      )}
                      {change.changedBy && (
                        <span>Bởi: {change.changedBy}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
