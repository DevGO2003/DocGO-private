import { Card, CardContent } from '@shared/components';
import { Activity, User, Trash2, Eye } from 'lucide-react';

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
        return <Eye className="w-4 h-4" />;
      case 'delete':
        return <Trash2 className="w-4 h-4" />;
      case 'update':
        return <Activity className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
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
            <Activity className="w-5 h-5 mr-2 text-indigo-600" />
            Thông tin kiểm toán
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Created */}
            <div className="border-l-4 border-green-500 pl-4">
              <label className="text-xs text-gray-500">Tạo bởi</label>
              <p className="text-sm font-medium text-gray-900 mt-1">
                {audit.createdBy || 'System'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {audit.createdAt ? formatDate(audit.createdAt) : 'Chưa xác định'}
              </p>
            </div>

            {/* Updated */}
            {audit.updatedAt && (
              <div className="border-l-4 border-blue-500 pl-4">
                <label className="text-xs text-gray-500">Cập nhật bởi</label>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {audit.updatedBy || 'System'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatDate(audit.updatedAt)}
                </p>
              </div>
            )}

            {/* Deleted */}
            {audit.deletedAt && (
              <div className="border-l-4 border-red-500 pl-4">
                <label className="text-xs text-gray-500">Xóa bởi</label>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {audit.deletedBy || 'System'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatDate(audit.deletedAt)}
                </p>
              </div>
            )}

            {/* Status */}
            <div className="border-l-4 border-gray-500 pl-4">
              <label className="text-xs text-gray-500">Trạng thái</label>
              <p className="text-sm font-medium text-gray-900 mt-1">
                {audit.isDeleted ? (
                  <span className="text-red-600">Đã xóa</span>
                ) : (
                  <span className="text-green-600">Hoạt động</span>
                )}
              </p>
              {audit.version && (
                <p className="text-xs text-gray-500 mt-1">Version: {audit.version}</p>
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
              <Activity className="w-5 h-5 mr-2 text-purple-600" />
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
                      <p className="text-xs text-gray-500">
                        {entry.timestamp ? formatDate(entry.timestamp) : 'N/A'}
                      </p>
                    </div>
                    {entry.user && (
                      <p className="text-xs text-gray-600 mt-1">
                        Bởi: {entry.user}
                      </p>
                    )}
                    {entry.description && (
                      <p className="text-xs text-gray-600 mt-2">
                        {entry.description}
                      </p>
                    )}
                    {entry.changes && (
                      <div className="mt-2 text-xs">
                        <p className="font-medium mb-1">Thay đổi:</p>
                        <pre className="bg-white bg-opacity-50 p-2 rounded overflow-x-auto">
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
