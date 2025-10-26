import { render, screen } from '@testing-library/react';
import { ProductCard } from './ProductCard';
import { Product } from '../../../models/types/product.types';

const mockProduct: Product = {
  id: '1',
  name: 'Test Product',
  description: 'Test description',
  price: 100000,
  category: 'test',
  stock: 10,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

describe('ProductCard', () => {
  it('renders product information', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });
});
