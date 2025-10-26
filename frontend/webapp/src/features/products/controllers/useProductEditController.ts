import { useNavigate } from 'react-router-dom';
import { useCreateProduct, useUpdateProduct } from '../models/api/productApi';
import { CreateProductRequest, UpdateProductRequest } from '../models/api/productApi.types';
import { PRODUCTS_PATH } from '@constants';

export const useProductEditController = (productId?: string) => {
  const navigate = useNavigate();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  const handleCreate = async (data: CreateProductRequest) => {
    try {
      await createMutation.mutateAsync(data);
      navigate(PRODUCTS_PATH);
    } catch (error) {
      console.error('Failed to create product:', error);
    }
  };

  const handleUpdate = async (data: UpdateProductRequest) => {
    if (!productId) return;
    try {
      await updateMutation.mutateAsync({ id: productId, data });
      navigate(PRODUCTS_PATH);
    } catch (error) {
      console.error('Failed to update product:', error);
    }
  };

  return {
    handleCreate,
    handleUpdate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    createError: createMutation.error,
    updateError: updateMutation.error,
  };
};
