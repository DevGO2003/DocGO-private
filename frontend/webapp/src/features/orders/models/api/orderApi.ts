import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '@constants';
import { GetOrdersParams, GetOrdersResponse, GetOrderResponse } from './orderApi.types';

const orderApi = {
  getOrders: async (params: GetOrdersParams): Promise<GetOrdersResponse> => {
    const queryString = new URLSearchParams(params as any).toString();
    const response = await fetch(`${API_BASE_URL}/orders?${queryString}`);
    if (!response.ok) throw new Error('Failed to fetch orders');
    return response.json();
  },

  getOrder: async (id: string): Promise<GetOrderResponse> => {
    const response = await fetch(`${API_BASE_URL}/orders/${id}`);
    if (!response.ok) throw new Error('Failed to fetch order');
    return response.json();
  },
};

export const useOrders = (params: GetOrdersParams = {}) => {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => orderApi.getOrders(params),
  });
};

export const useOrder = (id: string) => {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => orderApi.getOrder(id),
    enabled: !!id,
  });
};

export default orderApi;
