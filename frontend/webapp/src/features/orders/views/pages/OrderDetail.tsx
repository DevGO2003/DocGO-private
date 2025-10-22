import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/Card';
import { Button } from '@shared/components/Button';
import { useOrder } from '../../models/api/orderApi';
import { formatCurrency, formatDate } from '@utils';
import { ArrowLeft } from 'lucide-react';

export const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: order, isLoading, error } = useOrder(id!);

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (error || !order) {
    return <div className="flex justify-center items-center min-h-screen">Order not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button variant="ghost" onClick={() => navigate('/orders')} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Orders
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Order #{order.id}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
              <p className="mt-1 font-semibold">{order.status}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Total Amount</h3>
              <p className="mt-1 text-xl font-bold text-primary">
                {formatCurrency(order.totalAmount)}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Order Date</h3>
              <p className="mt-1">{formatDate(order.createdAt)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Last Updated</h3>
              <p className="mt-1">{formatDate(order.updatedAt)}</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Order Items</h3>
            <div className="space-y-2">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-4 border rounded">
                  <div>
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                  </div>
                  <p className="font-semibold">{formatCurrency(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
