import { useNavigate } from 'react-router-dom';
import { useRegister } from '../models/api/authApi';
import { useAppDispatch } from '@store/hooks';
import { setCredentials, setLoading, setError } from '../models/state/authSlice';
import { RegisterData } from '../models/types/auth.types';
import { HOME_PATH } from '@constants';

export const useRegisterController = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const registerMutation = useRegister();

  const handleRegister = async (data: RegisterData) => {
    dispatch(setLoading(true));
    try {
      const response = await registerMutation.mutateAsync(data);
      dispatch(setCredentials({ user: response.user, token: response.token }));
      navigate(HOME_PATH);
    } catch (error) {
      dispatch(setError(error instanceof Error ? error.message : 'Registration failed'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  return {
    handleRegister,
    isLoading: registerMutation.isPending,
    error: registerMutation.error,
  };
};
