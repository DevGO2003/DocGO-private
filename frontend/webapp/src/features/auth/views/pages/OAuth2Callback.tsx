import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch } from '@store/hooks';
import { setCredentials } from '../../models/state/authSlice';
import { HOME_PATH, LOGIN_PATH } from '@constants';

export const OAuth2Callback = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      // Get token from URL params (backend should redirect with token)
      const token = searchParams.get('token');
      const error = searchParams.get('error');

      if (error) {
        console.error('OAuth2 error:', error);
        navigate(LOGIN_PATH, { 
          state: { error: 'Google login failed. Please try again.' } 
        });
        return;
      }

      if (token) {
        try {
          // Store token
          localStorage.setItem('token', token);
          
          // Get user info using the token
          const response = await fetch(`${process.env.VITE_API_BASE_URL}/api/v1/user-management-service/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const result = await response.json();
            
            if (result.data) {
              // Store user info and token in Redux
              dispatch(setCredentials({ 
                user: result.data.user, 
                token: result.data.accessToken || token 
              }));

              // Store refresh token if available
              if (result.data.refreshToken) {
                localStorage.setItem('refreshToken', result.data.refreshToken);
              }

              // Redirect to home
              navigate(HOME_PATH);
            } else {
              throw new Error('Invalid response format');
            }
          } else {
            throw new Error('Failed to get user info');
          }
        } catch (error) {
          console.error('Failed to process OAuth2 callback:', error);
          localStorage.removeItem('token');
          navigate(LOGIN_PATH, { 
            state: { error: 'Authentication failed. Please try again.' } 
          });
        }
      } else {
        // No token found, redirect to login
        navigate(LOGIN_PATH);
      }
    };

    handleCallback();
  }, [searchParams, navigate, dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Processing login...</p>
      </div>
    </div>
  );
};
