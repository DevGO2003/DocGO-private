import { Card, CardContent } from '@shared/components';
import { CommonIcon } from '@shared/components/UIComponents/Icon/CommonIcon';

interface SecurityTabProps {
  fileData: any;
}

export function SecurityTab({ fileData }: SecurityTabProps) {
  const security = fileData?.security || {};
  const encryption = security.encryption || {};
  const sharedWith = security.sharedWith || [];

  return (
    <div className="space-y-6">
      {/* Visibility & Access */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <CommonIcon name="user" className="w-5 h-5 mr-2 text-indigo-600" />
            Mức độ truy cập
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500">Tính khả kiến</label>
              <div className="mt-2">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  security.visibility === 'public' 
                    ? 'bg-green-100 text-green-700'
                    : security.visibility === 'shared'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {security.visibility?.toUpperCase() || 'PRIVATE'}
                </span>
              </div>
            </div>
            {security.accessControl && (
              <div>
                <label className="text-xs text-gray-500">Kiểm soát truy cập</label>
                <p className="text-sm font-medium text-gray-900 mt-2">{security.accessControl}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Encryption */}
      {encryption.enabled && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <CommonIcon name="lock" className="w-5 h-5 mr-2 text-green-600" />
              Mã hóa
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500">Trạng thái</label>
                <p className="text-sm font-medium text-green-600 mt-2">✓ Được mã hóa</p>
              </div>
              {encryption.algorithm && (
                <div>
                  <label className="text-xs text-gray-500">Thuật toán</label>
                  <p className="text-sm font-medium text-gray-900 mt-2">{encryption.algorithm}</p>
                </div>
              )}
              {encryption.keyId && (
                <div className="md:col-span-2">
                  <label className="text-xs text-gray-500">Key ID</label>
                  <p className="text-sm font-medium text-gray-900 font-mono text-xs mt-2">{encryption.keyId}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Shared With */}
      {sharedWith.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <CommonIcon name="send" className="w-5 h-5 mr-2 text-blue-600" />
              Chia sẻ với ({sharedWith.length})
            </h3>
            <div className="space-y-3">
              {sharedWith.map((share: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{share.name || share.email || 'Unknown'}</p>
                    {share.email && <p className="text-xs text-gray-500">{share.email}</p>}
                  </div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                    {share.permission || share.role || 'VIEWER'}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Permissions Summary */}
      {security.permissions?.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <CommonIcon name="shield" className="w-5 h-5 mr-2 text-purple-600" />
              Quyền hạn
            </h3>
            <div className="space-y-2">
              {security.permissions.map((perm: string, idx: number) => (
                <div key={idx} className="flex items-center text-sm text-gray-700">
                  <span className="w-2 h-2 bg-purple-600 rounded-full mr-2"></span>
                  {perm}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
