import { useNavigate } from 'react-router-dom';
import { OrderItem } from '../components/OrderItem';
import { useOrderFetchController } from '../../controllers/useOrderFetchController';

export const OrderList = () => {
  const navigate = useNavigate();
  const { orders, isLoading } = useOrderFetchController();

  const handleView = (id: string) => {
    navigate(`/orders/${id}`);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Orders</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.map((order) => (
          <OrderItem key={order.id} order={order} onView={handleView} />
        ))}
      </div>

      {orders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No orders found</p>
        </div>
      )}
    </div>
  );
};
