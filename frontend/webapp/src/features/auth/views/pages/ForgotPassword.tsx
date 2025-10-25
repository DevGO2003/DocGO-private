import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@shared/components';
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
                animated
              >
                Send reset link
              </Button>
            </form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-6 text-center"
            >
              <Link
                to={LOGIN_PATH}
                className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
              >
                Back to sign in
              </Link>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
