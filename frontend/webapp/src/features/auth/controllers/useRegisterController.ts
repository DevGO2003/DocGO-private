import { useNavigate } from 'react-router-dom';
import { useRegister } from '../models/api/authApi';
import { useAppDispatch } from '@store/hooks';
import { setLoading, setError } from '../models/state/authSlice';
import { RegisterData } from '../models/types/auth.types';
import { LOGIN_PATH } from '@constants';

export const useRegisterController = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const registerMutation = useRegister();

  const handleRegister = async (data: RegisterData) => {
    console.log('[RegisterController] Starting registration process...');
    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      console.log('[RegisterController] Calling register API...');
      const response = await registerMutation.mutateAsync(data);
      console.log('[RegisterController] Registration successful!', {
        hasUser: !!response.user,
        message: response.message
      });
      
      // Navigate to login page after successful registration
      navigate(LOGIN_PATH);
    } catch (error: any) {
      console.error('[RegisterController] Registration error:', error);
      const errorMessage = error?.response?.data?.description || 
                          error?.message || 
                          'Đăng ký thất bại. Vui lòng thử lại.';
      dispatch(setError(errorMessage));
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
