import { useNavigate } from 'react-router-dom';
import { useLogin } from '../models/api/authApi';
import { useAppDispatch } from '@store/hooks';
import { setCredentials, setLoading, setError } from '../models/state/authSlice';
import { LoginCredentials } from '../models/types/auth.types';
import { DASHBOARD_PATH } from '@constants';

export const useLoginController = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const loginMutation = useLogin();

  const handleLogin = async (credentials: LoginCredentials) => {
    console.log('[LoginController] Starting login process...');
    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      console.log('[LoginController] Calling login API...');
      const authResponse = await loginMutation.mutateAsync(credentials);
      console.log('[LoginController] Login API response:', {
        hasAccessToken: !!authResponse.accessToken,
        hasUser: !!authResponse.user,
        expiresIn: authResponse.expiresIn
      });

      if (authResponse.accessToken && authResponse.user) {
        console.log('[LoginController] Login successful, setting credentials...');
        
        // Calculate token expiration
        const expiresAt = Date.now() + (authResponse.expiresIn * 1000);
        
        dispatch(setCredentials({
          user: authResponse.user,
          token: authResponse.accessToken,
          tokenData: {
            accessToken: authResponse.accessToken,
            refreshToken: authResponse.refreshToken,
            expiresAt,
            tokenType: authResponse.tokenType || 'Bearer'
          }
        }));
        
        console.log('[LoginController] Navigating to dashboard...');
        navigate(DASHBOARD_PATH);
      } else {
        console.error('[LoginController] Invalid response - missing token or user');
        dispatch(setError('Invalid response from server'));
      }
    } catch (error: any) {
      console.error('[LoginController] Login error:', error);
      const errorMessage = error?.response?.data?.description || 
                          error?.message || 
                          'Đăng nhập thất bại. Vui lòng thử lại.';
      dispatch(setError(errorMessage));
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
