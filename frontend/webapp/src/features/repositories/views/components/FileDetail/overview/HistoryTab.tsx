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
          <CommonIcon name="clock" className="w-5 h-5 mr-2" style={ color: '#4f46e5' } />
          Lịch sử thay đổi
        </h3>
        {history.length > 0 ? (
          <div className="space-y-4">
            {history.map((item: any, idx: number) => (
              <div key={idx} className="flex gap-4 pb-4 border-b last:border-0" style={ borderColor: '#e5e7eb' }>
                <div className="flex-shrink-0">
                  <div className="rounded-full mt-2" style={ backgroundColor: '#4f46e5' }></div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium" style={ color: '#111827' }>{item.action || item.type}</p>
                  <p className="text-xs" style={ color: '#6b7280' }>{item.user || 'Hệ thống'}</p>
                  <p className="text-xs mt-1" style={ color: '#9ca3af' }>
                    {formatDate(item.timestamp || item.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-8" style={ color: '#6b7280' }>Chưa có lịch sử thay đổi</p>
        )}
      </CardContent>
    </Card>
  );
}
