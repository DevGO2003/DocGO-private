import { useNavigate } from 'react-router-dom';
import { useLogin } from '../models/api/authApi';
import { useAppDispatch } from '@store/hooks';
import { setCredentials, setLoading, setError } from '../models/state/authSlice';
import { LoginCredentials } from '../models/types/auth.types';
import { HOME_PATH } from '@constants';

export const useLoginController = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const loginMutation = useLogin();

  const handleLogin = async (credentials: LoginCredentials) => {
    dispatch(setLoading(true));
    try {
      const response = await loginMutation.mutateAsync(credentials);
      dispatch(setCredentials({ user: response.user, token: response.token }));
      navigate(HOME_PATH);
    } catch (error) {
      dispatch(setError(error instanceof Error ? error.message : 'Login failed'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  return {
    handleLogin,
    isLoading: loginMutation.isPending,
    error: loginMutation.error,
  };
};
