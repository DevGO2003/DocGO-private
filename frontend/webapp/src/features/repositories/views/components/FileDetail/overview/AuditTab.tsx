import { Card, CardContent } from '@shared/components';
import { CommonIcon } from '@shared/components/UIComponents/Icon/CommonIcon';

interface AuditTabProps {
  fileData: any;
}

export function AuditTab({ fileData }: AuditTabProps) {
  const audit = fileData?.audit || {};
  const history = audit.history || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getActionIcon = (action: string) => {
    switch (action?.toLowerCase()) {
      case 'create':
        return <CommonIcon name="user" className="w-4 h-4" />;
      case 'delete':
        return <CommonIcon name="trash" className="w-4 h-4" />;
      case 'update':
        return <CommonIcon name="clock" className="w-4 h-4" />;
      default:
        return <CommonIcon name="user" className="w-4 h-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action?.toLowerCase()) {
      case 'create':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'delete':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'update':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Audit Summary */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <CommonIcon name="clock" className="w-5 h-5 mr-2" style={{ color: '#4f46e5' }} />
            Thông tin kiểm toán
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Created */}
            <div className="border-l-4 pl-4" style={{ borderColor: '#22c55e' }} >
              <label className="text-xs" style={{ color: '#6b7280' }} >Tạo bởi</label>
              <p className="text-sm font-medium mt-1" style={{ color: '#111827' }} >
                {audit.createdBy || 'System'}
              </p>
              <p className="text-xs mt-1" style={{ color: '#6b7280' }} >
                {audit.createdAt ? formatDate(audit.createdAt) : 'Chưa xác định'}
              </p>
            </div>

            {/* Updated */}
            {audit.updatedAt && (
              <div className="border-l-4 pl-4" style={{ borderColor: '#3b82f6' }} >
                <label className="text-xs" style={{ color: '#6b7280' }} >Cập nhật bởi</label>
                <p className="text-sm font-medium mt-1" style={{ color: '#111827' }} >
                  {audit.updatedBy || 'System'}
                </p>
                <p className="text-xs mt-1" style={{ color: '#6b7280' }} >
                  {formatDate(audit.updatedAt)}
                </p>
              </div>
            )}

            {/* Deleted */}
            {audit.deletedAt && (
              <div className="border-l-4 pl-4" style={{ borderColor: '#ef4444' }} >
                <label className="text-xs" style={{ color: '#6b7280' }} >Xóa bởi</label>
                <p className="text-sm font-medium mt-1" style={{ color: '#111827' }} >
                  {audit.deletedBy || 'System'}
                </p>
                <p className="text-xs mt-1" style={{ color: '#6b7280' }} >
                  {formatDate(audit.deletedAt)}
                </p>
              </div>
            )}

            {/* Status */}
            <div className="border-l-4 pl-4" style={{ borderColor: '#6b7280' }} >
              <label className="text-xs" style={{ color: '#6b7280' }} >Trạng thái</label>
              <p className="text-sm font-medium mt-1" style={{ color: '#111827' }} >
                {audit.isDeleted ? (
                  <span style={{ color: '#dc2626' }} >Đã xóa</span>
                ) : (
                  <span style={{ color: '#16a34a' }} >Hoạt động</span>
                )}
              </p>
              {audit.version && (
                <p className="text-xs mt-1" style={{ color: '#6b7280' }} >Version: {audit.version}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit History */}
      {history.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <CommonIcon name="clock" className="w-5 h-5 mr-2" style={{ color: '#9333ea' }} />
              Lịch sử kiểm toán ({history.length})
            </h3>
            <div className="space-y-4">
              {history.map((entry: any, idx: number) => (
                <div
                  key={idx}
                  className={`flex gap-4 p-4 rounded-lg border ${getActionColor(entry.action)}`}
                >
                  <div className="flex-shrink-0 mt-1">
                    {getActionIcon(entry.action)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">
                        {entry.action?.toUpperCase() || 'ACTION'}
                      </p>
                      <p className="text-xs" style={{ color: '#6b7280' }} >
                        {entry.timestamp ? formatDate(entry.timestamp) : 'N/A'}
                      </p>
                    </div>
                    {entry.user && (
                      <p className="text-xs mt-1" style={{ color: '#4b5563' }} >
                        Bởi: {entry.user}
                      </p>
                    )}
                    {entry.description && (
                      <p className="text-xs mt-2" style={{ color: '#4b5563' }} >
                        {entry.description}
                      </p>
                    )}
                    {entry.changes && (
                      <div className="mt-2 text-xs">
                        <p className="font-medium mb-1">Thay đổi:</p>
                        <pre className="p-2 rounded" style={{ backgroundColor: '#ffffff' }} >
                          {JSON.stringify(entry.changes, null, 2)}
                        </pre>
                      </div>
                    )}
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
