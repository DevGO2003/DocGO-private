import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from '@store';
import { Login } from './Login';

const queryClient = new QueryClient();

describe('Login', () => {
  it('renders login form', () => {
    render(
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Login />
          </BrowserRouter>
        </QueryClientProvider>
      </Provider>
    );
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
  });
});
