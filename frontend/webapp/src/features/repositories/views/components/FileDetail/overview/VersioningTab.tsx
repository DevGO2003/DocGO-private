import { Card, CardContent } from '@shared/components';
import { CommonIcon } from '@shared/components/UIComponents/Icon/CommonIcon';

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
            <CommonIcon name="file" className="w-5 h-5 mr-2" style={ color: '#4f46e5' } />
            Thông tin phiên bản
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs" style={ color: '#6b7280' }>Trạng thái</label>
              <p className="text-sm font-medium mt-2" style={ color: '#111827' }>
                {versioning.enabled ? (
                  <span style={ color: '#16a34a' }>✓ Bật</span>
                ) : (
                  <span style={ color: '#4b5563' }>Tắt</span>
                )}
              </p>
            </div>
            <div>
              <label className="text-xs" style={ color: '#6b7280' }>Phiên bản hiện tại</label>
              <p className="text-sm font-medium mt-2" style={ color: '#111827' }>
                v{versioning.currentVersion || 1}
              </p>
            </div>
            <div>
              <label className="text-xs" style={ color: '#6b7280' }>Tổng phiên bản</label>
              <p className="text-sm font-medium mt-2" style={ color: '#111827' }>
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
              <CommonIcon name="clock" className="mr-2" style={ color: '#2563eb' } />
              Thay đổi gần nhất
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {versioning.latestChange.timestamp && (
                <div>
                  <label className="text-xs" style={ color: '#6b7280' }>Thời gian</label>
                  <p className="text-sm font-medium mt-2" style={ color: '#111827' }>
                    {formatDate(versioning.latestChange.timestamp)}
                  </p>
                </div>
              )}
              {versioning.latestChange.changedBy && (
                <div>
                  <label className="text-xs" style={ color: '#6b7280' }>Người thay đổi</label>
                  <p className="text-sm font-medium mt-2" style={ color: '#111827' }>
                    {versioning.latestChange.changedBy}
                  </p>
                </div>
              )}
              {versioning.latestChange.changeType && (
                <div>
                  <label className="text-xs" style={ color: '#6b7280' }>Loại thay đổi</label>
                  <p className="text-sm font-medium mt-2" style={ color: '#111827' }>
                    {versioning.latestChange.changeType}
                  </p>
                </div>
              )}
              {versioning.latestChange.description && (
                <div className="md:col-span-2">
                  <label className="text-xs" style={ color: '#6b7280' }>Mô tả</label>
                  <p className="text-sm font-medium mt-2" style={ color: '#111827' }>
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
              <CommonIcon name="check" className="mr-2" style={ color: '#16a34a' } />
              Lịch sử phiên bản
            </h3>
            <div className="space-y-3">
              {versions.map((version: any, idx: number) => (
                <div key={idx} className="flex gap-4 pb-3 border-b last:border-0" style={ borderColor: '#e5e7eb' }>
                  <div className="flex-shrink-0">
                    <div className="h-8 rounded-full flex items-center justify-center" style={ backgroundColor: '#e0e7ff' }>
                      <span className="text-xs font-semibold" style={ color: '#4f46e5' }>v{version.number || idx + 1}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={ color: '#111827' }>
                      {version.name || `Version ${version.number || idx + 1}`}
                    </p>
                    {version.description && (
                      <p className="text-xs mt-1" style={ color: '#4b5563' }>{version.description}</p>
                    )}
                    <div className="flex gap-4 mt-2 text-xs" style={ color: '#6b7280' }>
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
                <div key={idx} className="flex gap-4 pb-3 border-b last:border-0" style={ borderColor: '#e5e7eb' }>
                  <div className="flex-shrink-0">
                    <div className="rounded-full mt-2" style={ backgroundColor: '#4f46e5' }></div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={ color: '#111827' }>
                      {change.changeType || change.action || 'Change'}
                    </p>
                    {change.description && (
                      <p className="text-xs mt-1" style={ color: '#4b5563' }>{change.description}</p>
                    )}
                    <div className="flex gap-4 mt-2 text-xs" style={ color: '#6b7280' }>
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
