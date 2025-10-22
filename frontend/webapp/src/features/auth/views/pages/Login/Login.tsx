import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@shared/components';
import { useAuthFormController } from '../../../controllers/useAuthFormController';
import { useLoginController } from '../../../controllers/useLoginController';
import { REGISTER_PATH, FORGOT_PASSWORD_PATH } from '@constants';

export const Login = () => {
  const { handleLogin, isLoading, error } = useLoginController();
  const { values, errors, handleChange, handleBlur, handleSubmit } = useAuthFormController({
    email: '',
    password: '',
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card animated>
          <CardHeader>
            <CardTitle className="text-center">
              Sign in to your account
            </CardTitle>
          </CardHeader>

          <CardContent>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-4 p-3 bg-red-50 border-2 border-red-200 rounded text-red-700 text-sm"
              >
                {error.message}
              </motion.div>
            )}

            <form onSubmit={handleSubmit(handleLogin)} className="space-y-6">
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
                autoComplete="current-password"
              />

              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                disabled={isLoading}
                className="w-full"
                animated
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-6 text-center space-y-3"
            >
              <Link
                to={FORGOT_PASSWORD_PATH}
                className="block text-sm text-blue-600 hover:text-blue-800 hover:underline"
              >
                Forgot your password?
              </Link>
              <div className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link
                  to={REGISTER_PATH}
                  className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Sign up
                </Link>
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
