import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@shared/components';
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              Create your account
            </CardTitle>
          </CardHeader>

          <CardContent>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-4 p-3 bg-red-50 border-2 border-red-200 rounded text-red-700 text-sm"
              >
                {error}
              </motion.div>
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

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-6 text-center"
            >
              <div className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  to={LOGIN_PATH}
                  className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Sign in
                </Link>
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
