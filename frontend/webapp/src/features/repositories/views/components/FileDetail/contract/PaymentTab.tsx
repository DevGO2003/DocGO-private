import React from 'react';
import { Card, CardContent } from '@shared/components';
import { CommonIcon } from '@shared/components/UIComponents/Icon/CommonIcon';

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
      <div className="py-8" style={{ color: '#6b7280' }} >
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
          <h3 className="text-sm font-semibold" style={{ color: '#111827' }} >Lịch thanh toán</h3>
          {payment.totalValue && (
            <div className="text-right">
              <p className="text-xs" style={{ color: '#6b7280' }} >Tổng giá trị</p>
              <p className="text-lg font-bold" style={{ color: '#16a34a' }} >
                <CommonIcon name="dollar-sign" />
                {formatCurrency(payment.totalValue, payment.currency || data?.currency)}
              </p>
            </div>
          )}
        </div>

        {payment.paymentMethod && (
          <div className="mb-3 p-2 bg-gradient-to-r from-blue-50 to-white rounded border" style={{ borderColor: '#dbeafe' }} >
            <span className="text-xs" style={{ color: '#4b5563' }} >Phương thức: </span>
            <span className="text-xs font-medium" style={{ color: '#111827' }} >{payment.paymentMethod}</span>
          </div>
        )}

        <div className="overflow-x-auto -mx-4 px-4">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b" style={{ borderColor: '#e5e7eb', backgroundColor: '#f9fafb' }} >
                <th className="py-2 px-2 font-semibold" style={{ color: '#374151' }} >Mốc</th>
                <th className="py-2 px-2 font-semibold" style={{ color: '#374151' }} >%</th>
                <th className="py-2 px-2 font-semibold" style={{ color: '#374151' }} >Số tiền</th>
                <th className="py-2 px-2 font-semibold" style={{ color: '#374151' }} >Hạn chót</th>
                <th className="py-2 px-2 font-semibold" style={{ color: '#374151' }} >Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((item, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: '#f3f4f6' }} >
                  <td className="py-2 px-2" style={{ color: '#111827' }} >{item.milestone}</td>
                  <td className="py-2 px-2 font-semibold" style={{ color: '#111827' }} >{item.percentage}%</td>
                  <td className="py-2 px-2 font-semibold" style={{ color: '#111827' }} >
                    <CommonIcon name="dollar-sign" />
                    {formatCurrency(item.amount, payment.currency || data?.currency)}
                  </td>
                  <td className="py-2 px-2" style={{ color: '#374151' }} >{formatDate(item.dueDate)}</td>
                  <td className="py-2 px-2 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        statusColors[item.status] || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <CommonIcon name="clock" />
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
