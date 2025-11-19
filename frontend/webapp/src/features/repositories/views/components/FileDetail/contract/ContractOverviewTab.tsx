import { CommonIcon } from '@shared/components/UIComponents/Icon/CommonIcon';
import { Card, CardContent } from '@shared/components';
import { useTranslation } from 'react-i18next';

interface ContractOverviewTabProps {
  data: any;
}

export function ContractOverviewTab({ data }: ContractOverviewTabProps) {
  const { t } = useTranslation();
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return t('contract.notDefined', { defaultValue: 'Chưa xác định' });
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatCurrency = (amount: number | null, currency: string = 'VND') => {
    if (!amount) return t('contract.notDefined', { defaultValue: 'Chưa xác định' });
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  // Translation function for priority levels
  const getPriorityLabel = (level: string) => {
    if (!level) return t('contract.notDefined', { defaultValue: 'Chưa xác định' });
    const key = level.toUpperCase();
    switch(key) {
      case 'HIGH': return t('contract.priority.high', { defaultValue: 'Cao' });
      case 'MEDIUM': return t('contract.priority.medium', { defaultValue: 'Trung bình' });
      case 'LOW': return t('contract.priority.low', { defaultValue: 'Thấp' });
      default: return level;
    }
  };

  // Translation function for confidentiality levels
  const getConfidentialityLabel = (level: string) => {
    if (!level) return t('contract.notDefined', { defaultValue: 'Chưa xác định' });
    const key = level.toUpperCase();
    switch(key) {
      case 'CONFIDENTIAL': return t('contract.confidentiality.confidential', { defaultValue: 'Bí mật' });
      case 'INTERNAL': return t('contract.confidentiality.internal', { defaultValue: 'Nội bộ' });
      case 'PUBLIC': return t('contract.confidentiality.public', { defaultValue: 'Công khai' });
      case 'RESTRICTED': return t('contract.confidentiality.restricted', { defaultValue: 'Hạn chế' });
      default: return level;
    }
  };

  const priorityColors: Record<string, string> = {
    HIGH: 'bg-red-100 text-red-800',
    MEDIUM: 'bg-yellow-100 text-yellow-800',
    LOW: 'bg-green-100 text-green-800',
  };

  const confidentialityColors: Record<string, string> = {
    CONFIDENTIAL: 'bg-red-100 text-red-800',
    INTERNAL: 'bg-yellow-100 text-yellow-800',
    PUBLIC: 'bg-green-100 text-green-800',
    RESTRICTED: 'bg-orange-100 text-orange-800',
  };

  return (
    <div className="space-y-4">
      {/* Contract Dates & Value */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Card className="border-indigo-100" style={{ backgroundImage: 'linear-gradient(to bottom right, ...)' /* MANUAL FIX NEEDED */ }} >
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <CommonIcon name="calendar" className="w-4 h-4" style={{ color: '#4f46e5' }} />
              <h3 className="text-sm font-semibold" style={{ color: '#111827' }} >{t('contract.duration', { defaultValue: 'Thời hạn hợp đồng' })}</h3>
            </div>
            <div className="space-y-2">
              <div>
                <label className="text-xs" style={{ color: '#6b7280' }} >{t('contract.effectiveDate', { defaultValue: 'Ngày hiệu lực' })}</label>
                <p className="text-base font-semibold" style={{ color: '#111827' }} >{formatDate(data?.effectiveDate)}</p>
              </div>
              <div>
                <label className="text-xs" style={{ color: '#6b7280' }} >{t('contract.expiryDate', { defaultValue: 'Ngày hết hạn' })}</label>
                <p className="text-base font-semibold" style={{ color: '#111827' }} >{formatDate(data?.expiryDate)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={{ borderColor: '#dcfce7', backgroundImage: 'linear-gradient(to bottom right, ...)' /* MANUAL FIX NEEDED */ }} >
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <CommonIcon name="dollar-sign" style={{ color: '#16a34a' }} />
              <h3 className="text-sm font-semibold" style={{ color: '#111827' }} >{t('contract.totalValue', { defaultValue: 'Giá trị hợp đồng' })}</h3>
            </div>
            <div className="text-center py-2">
              <p className="text-2xl font-bold" style={{ color: '#16a34a' }} >
                {formatCurrency(data?.totalValue, data?.currency)}
              </p>
              <p className="text-xs mt-1" style={{ color: '#6b7280' }} >{t('contract.total', { defaultValue: 'Tổng giá trị' })}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Info & Classification */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CommonIcon name="briefcase" style={{ color: '#2563eb' }} />
                <h3 className="text-sm font-semibold" style={{ color: '#111827' }} >{t('contract.projectInfo', { defaultValue: 'Thông tin dự án' })}</h3>
              </div>
              <div className="space-y-2">
                <div>
                  <label className="text-xs" style={{ color: '#6b7280' }} >{t('contract.project', { defaultValue: 'Dự án' })}</label>
                  <p className="text-sm font-medium" style={{ color: '#111827' }} >{data?.project || t('contract.notDefined', { defaultValue: 'Chưa xác định' })}</p>
                </div>
                <div>
                  <label className="text-xs" style={{ color: '#6b7280' }} >{t('contract.department', { defaultValue: 'Phòng ban' })}</label>
                  <p className="text-sm font-medium" style={{ color: '#111827' }} >{data?.department || t('contract.notDefined', { defaultValue: 'Chưa xác định' })}</p>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <CommonIcon name="shield" className="w-4 h-4" style={{ color: '#9333ea' }} />
                <h3 className="text-sm font-semibold" style={{ color: '#111827' }} >{t('contract.classification', { defaultValue: 'Phân loại' })}</h3>
              </div>
              <div className="space-y-2">
                <div>
                  <label className="text-xs" style={{ color: '#6b7280' }} >{t('contract.priorityLabel', { defaultValue: 'Độ ưu tiên' })}</label>
                  <div className="mt-1">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${priorityColors[data?.priority || ''] || 'bg-gray-100 text-gray-800'}`}>
                      {getPriorityLabel(data?.priority)}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-xs" style={{ color: '#6b7280' }} >{t('contract.confidentialityLabel', { defaultValue: 'Độ bảo mật' })}</label>
                  <div className="mt-1">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${confidentialityColors[data?.confidentiality || ''] || 'bg-gray-100 text-gray-800'}`}>
                      {getConfidentialityLabel(data?.confidentiality)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      {data?.summary && (
        <Card style={{ backgroundImage: 'linear-gradient(to bottom right, ...)' /* MANUAL FIX NEEDED */ }} >
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold mb-2" style={{ color: '#111827' }} >{t('contract.summary', { defaultValue: 'Tóm tắt hợp đồng' })}</h3>
            <p className="text-sm" style={{ color: '#374151' }} >{data.summary}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
