import { Card, CardContent, CardHeader } from '@shared/components/Card';
import { formatCurrency, formatDate } from '@utils';
import { OrderItemProps } from './OrderItem.types';
import { orderItemStyles } from './OrderItem.styles';
import { OrderStatus } from '../../../models/types/order.types';
import { cn } from '@shared/lib/utils';

export const OrderItem = ({ order, onView }: OrderItemProps) => {
  const getStatusStyle = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return orderItemStyles.statusPending;
      case OrderStatus.PROCESSING:
        return orderItemStyles.statusProcessing;
      case OrderStatus.SHIPPED:
        return orderItemStyles.statusShipped;
      case OrderStatus.DELIVERED:
        return orderItemStyles.statusDelivered;
      case OrderStatus.CANCELLED:
        return orderItemStyles.statusCancelled;
      default:
        return '';
    }
  };

  return (
    <Card className={orderItemStyles.card} onClick={() => onView?.(order.id)}>
      <CardHeader className={orderItemStyles.header}>
        <span className={orderItemStyles.orderId}>Order #{order.id}</span>
        <span className={cn(orderItemStyles.status, getStatusStyle(order.status))}>
          {order.status}
        </span>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Total Amount:</span>
            <span className="font-semibold">{formatCurrency(order.totalAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Items:</span>
            <span>{order.items.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Date:</span>
            <span>{formatDate(order.createdAt)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
