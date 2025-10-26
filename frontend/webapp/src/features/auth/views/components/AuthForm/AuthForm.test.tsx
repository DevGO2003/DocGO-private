import { render, screen } from '@testing-library/react';
import { AuthForm } from './AuthForm';

describe('AuthForm', () => {
  it('renders form with title', () => {
    render(
      <AuthForm title="Login" onSubmit={() => {}}>
        <div>Form content</div>
      </AuthForm>
    );
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('shows error message', () => {
    render(
      <AuthForm title="Login" onSubmit={() => {}} error="Invalid credentials">
        <div>Form content</div>
      </AuthForm>
    );
    expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
  });
});
