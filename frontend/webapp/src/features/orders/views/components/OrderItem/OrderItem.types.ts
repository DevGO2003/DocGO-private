import { Order } from '../../../models/types/order.types';

export interface OrderItemProps {
  order: Order;
  onView?: (id: string) => void;
}
