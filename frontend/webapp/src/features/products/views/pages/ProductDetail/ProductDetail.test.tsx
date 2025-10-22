import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProductDetail } from './ProductDetail';

const queryClient = new QueryClient();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: '1' }),
}));

describe('ProductDetail', () => {
  it('renders product detail', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ProductDetail />
        </BrowserRouter>
      </QueryClientProvider>
    );
    expect(screen.getByText('Back to Products')).toBeInTheDocument();
  });
});
