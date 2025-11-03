import { Card, CardContent } from '@shared/components';
import { CommonIcon } from '@shared/components/UIComponents/Icon/CommonIcon';

interface PermissionsTabProps {
  fileData: any;
}

export function PermissionsTab({ fileData }: PermissionsTabProps) {
  const permissions = fileData?.permissions || [];

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <CommonIcon name="lock" className="w-5 h-5 mr-2" style={ color: '#4f46e5' } />
          Quyền truy cập
        </h3>
        {permissions.length > 0 ? (
          <div className="space-y-3">
            {permissions.map((perm: any, idx: number) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 rounded-lg border" style={ borderColor: '#e5e7eb' } style={ backgroundColor: '#f9fafb' }
              >
                <div>
                  <p className="text-sm font-medium" style={ color: '#111827' }>
                    {perm.user || perm.role}
                  </p>
                  <p className="text-xs" style={ color: '#6b7280' }>{perm.email}</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-medium" style={ backgroundColor: '#e0e7ff' }>
                  {perm.permission || perm.level}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-8" style={ color: '#6b7280' }>Chưa có quyền truy cập nào được thiết lập</p>
        )}
      </CardContent>
    </Card>
  );
}
