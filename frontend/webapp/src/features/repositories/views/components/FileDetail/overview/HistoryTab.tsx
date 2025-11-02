import { Card, CardContent } from '@shared/components';
import { CommonIcon } from '@shared/components/UIComponents/Icon/CommonIcon';

interface HistoryTabProps {
  fileData: any;
}

export function HistoryTab({ fileData }: HistoryTabProps) {
  const history = fileData?.history || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <CommonIcon name="clock" className="w-5 h-5 mr-2 text-indigo-600" />
          Lịch sử thay đổi
        </h3>
        {history.length > 0 ? (
          <div className="space-y-4">
            {history.map((item: any, idx: number) => (
              <div key={idx} className="flex gap-4 pb-4 border-b border-gray-200 last:border-0">
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2"></div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{item.action || item.type}</p>
                  <p className="text-xs text-gray-500">{item.user || 'Hệ thống'}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDate(item.timestamp || item.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">Chưa có lịch sử thay đổi</p>
        )}
      </CardContent>
    </Card>
  );
}
