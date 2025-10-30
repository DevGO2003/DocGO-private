import React from 'react';
import { Card, CardContent } from '@shared/components';

interface PaymentScheduleItem {
  milestone: string;
  percentage: number;
  amount: number;
  dueDate: string;
  status: string;
}

interface PaymentTabProps {
  data: any;
}

export function PaymentTab({ data }: PaymentTabProps) {
  const payment = data?.paymentDetails || data?.payment;
  const schedule: PaymentScheduleItem[] = payment?.schedule || [];

  if (!payment || schedule.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        Không có thông tin thanh toán
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    PAID: 'bg-green-100 text-green-800',
    OVERDUE: 'bg-red-100 text-red-800',
    CANCELLED: 'bg-gray-100 text-gray-800',
  };

  const formatCurrency = (amount: number, curr: string = 'VND') => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: curr,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Lịch thanh toán</h3>
          {payment.totalValue && (
            <div className="text-right">
              <p className="text-xs text-gray-500">Tổng giá trị</p>
              <p className="text-lg font-bold text-green-600">
                {formatCurrency(payment.totalValue, payment.currency || data?.currency)}
              </p>
            </div>
          )}
        </div>

        {payment.paymentMethod && (
          <div className="mb-3 p-2 bg-gradient-to-r from-blue-50 to-white rounded border border-blue-100">
            <span className="text-xs text-gray-600">Phương thức: </span>
            <span className="text-xs font-medium text-gray-900">{payment.paymentMethod}</span>
          </div>
        )}

        <div className="overflow-x-auto -mx-4 px-4">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-2 px-2 font-semibold text-gray-700">Mốc</th>
                <th className="text-right py-2 px-2 font-semibold text-gray-700">%</th>
                <th className="text-right py-2 px-2 font-semibold text-gray-700">Số tiền</th>
                <th className="text-center py-2 px-2 font-semibold text-gray-700">Hạn chót</th>
                <th className="text-center py-2 px-2 font-semibold text-gray-700">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-2 px-2 text-gray-900">{item.milestone}</td>
                  <td className="py-2 px-2 text-right font-semibold text-gray-900">{item.percentage}%</td>
                  <td className="py-2 px-2 text-right font-semibold text-gray-900">
                    {formatCurrency(item.amount, payment.currency || data?.currency)}
                  </td>
                  <td className="py-2 px-2 text-center text-gray-700">{formatDate(item.dueDate)}</td>
                  <td className="py-2 px-2 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        statusColors[item.status] || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
