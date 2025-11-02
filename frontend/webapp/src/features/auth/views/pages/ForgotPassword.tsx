import { Link } from 'react-router-dom';
import { useRef, useEffect } from 'react';
import anime from 'animejs';
import { Button, Input, Card, CardHeader, CardTitle, CardContent, CommonFont } from '@shared/components';
import { useAuthFormController } from '../../controllers/useAuthFormController';
import { LOGIN_PATH } from '@constants';

export const ForgotPassword = () => {
  const { values, errors, handleChange, handleBlur, handleSubmit } = useAuthFormController({
    email: '',
  });

  const handleForgotPassword = (data: { email: string }) => {
    console.log('Forgot password:', data);
    // Implement forgot password logic
  };

  const containerRef = useRef<HTMLDivElement>(null);

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

  return (
    <CommonFont className="min-h-screen flex items-center justify-center py-12 px-4" style={{ background: 'linear-gradient(to bottom right, #dbeafe, #faf5ff)' }}>
      <div ref={containerRef} className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              Reset your password
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(handleForgotPassword)} className="space-y-6">
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
                helperText="We'll send you a link to reset your password"
              />

              <Button
                type="submit"
                variant="outline"
                className="w-full"
              >
                Send reset link
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                to={LOGIN_PATH}
                className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
              >
                Back to sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </CommonFont>
  );
};
