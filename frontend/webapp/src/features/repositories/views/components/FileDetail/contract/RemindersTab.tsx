import { CommonIcon } from '@shared/components/UIComponents/Icon/CommonIcon';
import { Card, CardContent } from '@shared/components';

interface RemindersTabProps {
  data: any;
}

export function RemindersTab({ data }: RemindersTabProps) {
  const reminders = data?.reminders;

  if (!reminders || reminders.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">Không có nhắc nhở nào</div>
    );
  }

  const typeColors: Record<string, string> = {
    PAYMENT_DUE: 'bg-green-100 text-green-800 border-green-300',
    MILESTONE_REVIEW: 'bg-blue-100 text-blue-800 border-blue-300',
    EXPIRY_WARNING: 'bg-red-100 text-red-800 border-red-300',
    CONTRACT_RENEWAL: 'bg-purple-100 text-purple-800 border-purple-300',
  };

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    SENT: 'bg-blue-100 text-blue-800',
    RESOLVED: 'bg-green-100 text-green-800',
    OVERDUE: 'bg-red-100 text-red-800',
  };

  const priorityColors: Record<string, string> = {
    HIGH: 'bg-red-100 text-red-800',
    MEDIUM: 'bg-yellow-100 text-yellow-800',
    LOW: 'bg-green-100 text-green-800',
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const typeLabels: Record<string, string> = {
    PAYMENT_DUE: 'Thanh toán',
    MILESTONE_REVIEW: 'Đánh giá mốc',
    EXPIRY_WARNING: 'Cảnh báo hết hạn',
    CONTRACT_RENEWAL: 'Gia hạn hợp đồng',
  };

  return (
    <div className="space-y-4">
      {reminders.map((reminder: any, idx: number) => (
        <Card
          key={reminder.id || idx}
          className={`border-2 ${typeColors[reminder.type] || 'bg-gray-100 text-gray-800 border-gray-300'}`}
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <CommonIcon name="alert-circle" className="w-6 h-6" />
                <div>
                  <span className="text-xs font-medium opacity-75">
                    {typeLabels[reminder.type] || reminder.type}
                  </span>
                  <h3 className="text-lg font-bold">{reminder.title}</h3>
                </div>
              </div>
              <div className="flex gap-2">
                {reminder.priority && (
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      priorityColors[reminder.priority] || 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {reminder.priority}
                  </span>
                )}
                {reminder.status && (
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      statusColors[reminder.status] || 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {reminder.status}
                  </span>
                )}
              </div>
            </div>

            <p className="text-sm mb-3">{reminder.description}</p>

            {reminder.content && (
              <div className="bg-white bg-opacity-50 p-3 rounded text-sm italic mb-3">
                {reminder.content}
              </div>
            )}

            {reminder.dueDate && (
              <div className="flex items-center gap-2 text-sm font-medium">
                <span className="opacity-75">Hạn chót:</span>
                <span>{formatDate(reminder.dueDate)}</span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
