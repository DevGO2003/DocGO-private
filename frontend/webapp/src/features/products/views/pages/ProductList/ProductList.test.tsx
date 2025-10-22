import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProductList } from './ProductList';

const queryClient = new QueryClient();

describe('ProductList', () => {
  it('renders product list', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ProductList />
        </BrowserRouter>
      </QueryClientProvider>
    );
    expect(screen.getByText('Products')).toBeInTheDocument();
  });
});
