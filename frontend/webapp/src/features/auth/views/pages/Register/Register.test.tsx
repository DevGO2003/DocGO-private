import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from '@store';
import { Register } from './Register';

const queryClient = new QueryClient();

describe('Register', () => {
  it('renders register form', () => {
    render(
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Register />
          </BrowserRouter>
        </QueryClientProvider>
      </Provider>
    );
    expect(screen.getByText('Create your account')).toBeInTheDocument();
  });
});
