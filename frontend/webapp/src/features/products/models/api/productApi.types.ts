import { Product, ProductFilters } from '../types/product.types';

export interface GetProductsParams extends ProductFilters {
  page?: number;
  limit?: number;
}

export type GetProductsResponse = {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
};

export type GetProductResponse = Product;

export type CreateProductRequest = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateProductRequest = Partial<CreateProductRequest>;
