import React from 'react'

interface PaymentScheduleItem {
  milestone: string
  percentage: number
  amount: number
  dueDate: string
  status: string
}

interface PaymentSectionProps {
  payment?: {
    schedule?: PaymentScheduleItem[]
    method?: string
    paymentMethod?: string
  }
  totalValue?: number
  currency?: string
}

export function PaymentSection({ payment, totalValue, currency }: PaymentSectionProps) {
  if (!payment || !payment.schedule || payment.schedule.length === 0) return null

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    PAID: 'bg-green-100 text-green-800',
    OVERDUE: 'bg-red-100 text-red-800',
    CANCELLED: 'bg-gray-100 text-gray-800',
  }

  const formatCurrency = (amount: number, curr: string = 'USD') => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: curr,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Lịch thanh toán</h3>
        {totalValue && (
          <div className="text-right">
            <p className="text-sm text-gray-600">Tổng giá trị</p>
            <p className="text-xl font-bold text-indigo-600">
              {formatCurrency(totalValue, currency)}
            </p>
          </div>
        )}
      </div>

      {payment.method && (
        <div className="mb-4 p-3 bg-gray-50 rounded">
          <span className="text-sm text-gray-600">Phương thức: </span>
          <span className="font-medium">{payment.paymentMethod || payment.method}</span>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Mốc</th>
              <th className="text-right py-2 px-3 text-sm font-semibold text-gray-700">%</th>
              <th className="text-right py-2 px-3 text-sm font-semibold text-gray-700">Số tiền</th>
              <th className="text-center py-2 px-3 text-sm font-semibold text-gray-700">Hạn chót</th>
              <th className="text-center py-2 px-3 text-sm font-semibold text-gray-700">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {payment.schedule.map((item, idx) => (
              <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-3 text-sm">{item.milestone}</td>
                <td className="py-3 px-3 text-sm text-right font-medium">{item.percentage}%</td>
                <td className="py-3 px-3 text-sm text-right font-medium">
                  {formatCurrency(item.amount, currency)}
                </td>
                <td className="py-3 px-3 text-sm text-center">{formatDate(item.dueDate)}</td>
                <td className="py-3 px-3 text-center">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${statusColors[item.status] || 'bg-gray-100 text-gray-800'}`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
