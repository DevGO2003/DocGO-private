import { useState } from 'react';
import { useOrders } from '../models/api/orderApi';

export const useOrderFetchController = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useOrders({ page });

  return {
    orders: data?.orders || [],
    total: data?.total || 0,
    isLoading,
    error,
    page,
    setPage,
  };
};
