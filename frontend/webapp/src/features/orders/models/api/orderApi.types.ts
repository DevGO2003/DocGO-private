import { Order } from '../types/order.types';

export interface GetOrdersParams {
  page?: number;
  limit?: number;
  status?: string;
}

export type GetOrdersResponse = {
  orders: Order[];
  total: number;
  page: number;
  totalPages: number;
};

export type GetOrderResponse = Order;
