import { Link } from 'react-router-dom';
import { Input } from '@shared/components/Input';
import { AuthForm } from '../components/AuthForm';
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
    <AuthForm
      title="Reset your password"
      onSubmit={handleSubmit(handleForgotPassword)}
      footer={
        <Link to={LOGIN_PATH} className="text-primary font-medium hover:underline">
          Back to sign in
        </Link>
      }
    >
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
    </AuthForm>
  );
};
