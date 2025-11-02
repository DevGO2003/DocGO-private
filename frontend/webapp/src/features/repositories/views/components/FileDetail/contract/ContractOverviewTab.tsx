import React from 'react';
import { CommonIcon } from '@shared/components/UIComponents/Icon/CommonIcon';
import { Card, CardContent } from '@shared/components';

interface ContractOverviewTabProps {
  data: any;
}

export function ContractOverviewTab({ data }: ContractOverviewTabProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Chưa xác định';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatCurrency = (amount: number | null, currency: string = 'VND') => {
    if (!amount) return 'Chưa xác định';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency,
    }).format(amount);
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
        <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <CommonIcon name="calendar" className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-semibold text-gray-900">Thời hạn hợp đồng</h3>
            </div>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-gray-500">Ngày hiệu lực</label>
                <p className="text-base font-semibold text-gray-900">{formatDate(data?.effectiveDate)}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500">Ngày hết hạn</label>
                <p className="text-base font-semibold text-gray-900">{formatDate(data?.expiryDate)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white border-green-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <CommonIcon name="dollar-sign" className="w-4 h-4 text-green-600" />
              <h3 className="text-sm font-semibold text-gray-900">Giá trị hợp đồng</h3>
            </div>
            <div className="text-center py-2">
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(data?.totalValue, data?.currency)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Tổng giá trị</p>
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
                <CommonIcon name="briefcase" className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-semibold text-gray-900">Thông tin dự án</h3>
              </div>
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-gray-500">Dự án</label>
                  <p className="text-sm font-medium text-gray-900">{data?.project || 'Chưa xác định'}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Phòng ban</label>
                  <p className="text-sm font-medium text-gray-900">{data?.department || 'Chưa xác định'}</p>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <CommonIcon name="shield" className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-semibold text-gray-900">Phân loại</h3>
              </div>
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-gray-500">Độ ưu tiên</label>
                  <div className="mt-1">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${priorityColors[data?.priority || ''] || 'bg-gray-100 text-gray-800'}`}>
                      {data?.priority || 'Chưa xác định'}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Độ bảo mật</label>
                  <div className="mt-1">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${confidentialityColors[data?.confidentiality || ''] || 'bg-gray-100 text-gray-800'}`}>
                      {data?.confidentiality || 'Chưa xác định'}
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
        <Card className="bg-gradient-to-br from-gray-50 to-white">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold mb-2 text-gray-900">Tóm tắt hợp đồng</h3>
            <p className="text-sm text-gray-700 leading-relaxed">{data.summary}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
