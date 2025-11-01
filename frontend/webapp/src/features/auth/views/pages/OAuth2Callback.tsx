import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch } from '@store/hooks';
import { setCredentials, setTokens, setUser } from '../../models/state/authSlice';
import { HOME_PATH, LOGIN_PATH } from '@constants';
import env from '@shared/config/env';

export const OAuth2Callback = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      // Get token from URL params (backend should redirect with token)
      const token = searchParams.get('token');
      const refreshToken = searchParams.get('refreshToken');
      const username = searchParams.get('username');
      const error = searchParams.get('error');

      console.log('[OAuth2Callback] URL params:', { 
        hasToken: !!token, 
        hasRefreshToken: !!refreshToken, 
        username,
        error 
      });

      if (error) {
        console.error('[OAuth2Callback] OAuth2 error:', error);
        navigate(LOGIN_PATH, { 
          state: { error: 'Google login failed. Please try again.' } 
        });
        return;
      }

      if (token) {
        try {
          // Store tokens immediately
          localStorage.setItem('token', token);
          if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
          }
          
          console.log('[OAuth2Callback] Fetching user info from API...');
          
          // Get user info using the token
          const response = await fetch(`${env.apiBaseUrl}/api/v1/user-management-service/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          console.log('[OAuth2Callback] API response status:', response.status);

          if (response.ok) {
            const result = await response.json();
            console.log('[OAuth2Callback] API response data:', result);
            
            if (result.data && result.data.user) {
              // Extract token data from response
              const accessToken = result.data.token || token;
              const refresh = result.data.refreshToken || refreshToken;
              const expiresIn = result.data.expiresIn || 900; // Default 15 minutes
              
              console.log('[OAuth2Callback] Token info:', { 
                hasAccessToken: !!accessToken, 
                hasRefreshToken: !!refresh,
                expiresIn 
              });

              // Store tokens with expiration info in Redux
              if (refresh) {
                dispatch(setTokens({
                  accessToken,
                  refreshToken: refresh,
                  expiresIn
                }));
              } else {
                // Fallback if no refresh token
                dispatch(setCredentials({ 
                  user: result.data.user, 
                  token: accessToken,
                  tokenData: {
                    accessToken,
                    refreshToken: refresh || '',
                    expiresAt: Date.now() + (expiresIn * 1000),
                    tokenType: 'Bearer'
                  }
                }));
              }

              // Store user info
              dispatch(setUser(result.data.user));

              console.log('[OAuth2Callback] Login successful, redirecting to home...');
              // Redirect to home
              navigate(HOME_PATH);
            } else {
              throw new Error('Invalid response format: missing user data');
            }
          } else {
            const errorData = await response.text();
            console.error('[OAuth2Callback] API error response:', errorData);
            throw new Error(`Failed to get user info: ${response.status}`);
          }
        } catch (error) {
          console.error('[OAuth2Callback] Failed to process OAuth2 callback:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          navigate(LOGIN_PATH, { 
            state: { error: 'Authentication failed. Please try again.' } 
          });
        }
      } else {
        // No token found, redirect to login
        console.warn('[OAuth2Callback] No token found in URL params');
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
