import { Link } from 'react-router-dom';
import { useRef, useEffect } from 'react';
import anime from 'animejs';
import { Button, Input, Card, CardHeader, CardTitle, CardContent, CommonFont } from '@shared/components';
import { useAuthFormController } from '../../../controllers/useAuthFormController';
import { useRegisterController } from '../../../controllers/useRegisterController';
import { useAppSelector } from '@store/hooks';
import { LOGIN_PATH } from '@constants';

export const Register = () => {
  const { handleRegister, isLoading } = useRegisterController();
  const error = useAppSelector((state) => state.auth.error);
  const { values, errors, handleChange, handleBlur, handleSubmit } = useAuthFormController({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const onSubmit = (vals: typeof values) => {
    // Map form values to RegisterData (firstName/lastName optional defaults)
    handleRegister({
      username: vals.username,
      email: vals.email,
      password: vals.password,
      confirmPassword: vals.confirmPassword,
      firstName: '',
      lastName: '',
    });
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      anime({
        targets: containerRef.current,
        opacity: [0, 1],
        scale: [0.9, 1],
        duration: 500,
        easing: 'easeOutQuad',
      });
    }
  }, []);

  useEffect(() => {
    if (error && errorRef.current) {
      anime({
        targets: errorRef.current,
        opacity: [0, 1],
        maxHeight: [0, 100],
        duration: 300,
        easing: 'easeOutQuad',
      });
    }
  }, [error]);

  return (
    <CommonFont className="min-h-screen flex items-center justify-center py-12 px-4" style={{ background: 'linear-gradient(to bottom right, #dbeafe, #faf5ff)' }}>
      <div ref={containerRef} className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              Create your account
            </CardTitle>
          </CardHeader>

          <CardContent>
            {error && (
              <div ref={errorRef} className="mb-4 p-3 border-2 rounded text-sm" style={{ borderColor: '#fecaca', backgroundColor: '#fef2f2' }} >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Input
                id="username"
                name="username"
                type="text"
                label="Username"
                value={values.username}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.username}
                placeholder="Choose a username"
                autoComplete="username"
              />

              <Input
                id="email"
                name="email"
                type="email"
                label="Email address"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.email}
                placeholder="Enter your email"
                autoComplete="email"
              />

              <Input
                id="password"
                name="password"
                type="password"
                label="Password"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.password}
                placeholder="Enter your password"
                autoComplete="new-password"
              />

              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                label="Confirm Password"
                value={values.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.confirmPassword}
                placeholder="Confirm your password"
                autoComplete="new-password"
              />

              <Button
                type="submit"
                variant="outline"
                isLoading={isLoading}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Creating account...' : 'Sign up'}
              </Button>
            </form>

            <div className="mt-6 text-center"
            >
              <div className="text-sm" style={{ color: '#4b5563' }} >
                Already have an account?{' '}
                <Link
                  to={LOGIN_PATH}
                  className="font-medium hover: hover:underline" style={{ color: '#2563eb' }} >
                  Sign in
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </CommonFont>
  );
};
