import { Link } from 'react-router-dom';
import { Input } from '@shared/components/Input';
import { AuthForm } from '../../components/AuthForm';
import { useAuthFormController } from '../../../controllers/useAuthFormController';
import { useRegisterController } from '../../../controllers/useRegisterController';
import { LOGIN_PATH } from '@constants';

export const Register = () => {
  const { handleRegister, isLoading, error } = useRegisterController();
  const { values, errors, handleChange, handleBlur, handleSubmit } = useAuthFormController({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  return (
    <AuthForm
      title="Create your account"
      onSubmit={handleSubmit(handleRegister)}
      isLoading={isLoading}
      error={error?.message}
      footer={
        <div>
          Already have an account?{' '}
          <Link to={LOGIN_PATH} className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </div>
      }
    >
      <Input
        id="name"
        name="name"
        type="text"
        label="Full Name"
        value={values.name}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.name}
        placeholder="Enter your full name"
        autoComplete="name"
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
    </AuthForm>
  );
};
