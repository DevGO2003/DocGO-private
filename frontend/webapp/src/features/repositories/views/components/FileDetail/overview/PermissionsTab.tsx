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
          <CommonIcon name="lock" className="w-5 h-5 mr-2 text-indigo-600" />
          Quyền truy cập
        </h3>
        {permissions.length > 0 ? (
          <div className="space-y-3">
            {permissions.map((perm: any, idx: number) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {perm.user || perm.role}
                  </p>
                  <p className="text-xs text-gray-500">{perm.email}</p>
                </div>
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                  {perm.permission || perm.level}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">Chưa có quyền truy cập nào được thiết lập</p>
        )}
      </CardContent>
    </Card>
  );
}
