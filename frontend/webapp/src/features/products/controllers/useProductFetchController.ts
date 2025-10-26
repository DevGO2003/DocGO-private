import { useState } from 'react';
import { useProducts } from '../models/api/productApi';
import { ProductFilters } from '../models/types/product.types';

export const useProductFetchController = (initialFilters: ProductFilters = {}) => {
  const [filters, setFilters] = useState<ProductFilters>(initialFilters);
  const [page, setPage] = useState(1);

  const { data, isLoading, error, refetch } = useProducts({ ...filters, page });

  const handleFilterChange = (newFilters: ProductFilters) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return {
    products: data?.products || [],
    total: data?.total || 0,
    totalPages: data?.totalPages || 0,
    currentPage: page,
    isLoading,
    error,
    filters,
    handleFilterChange,
    handlePageChange,
    refetch,
  };
};
