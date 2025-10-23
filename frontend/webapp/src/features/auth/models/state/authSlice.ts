import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User, TokenData } from '../types/auth.types';

const STORAGE_KEY = 'docgo_auth_v1';

// Helper functions for storage
const loadAuthFromStorage = (): Partial<AuthState> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      
      // Check if token is expired
      if (parsed.tokenData?.expiresAt) {
        const now = Date.now();
        const bufferTime = 5 * 60 * 1000; // 5 minutes buffer
        const isExpired = now >= (parsed.tokenData.expiresAt - bufferTime);
        
        if (isExpired) {
          console.log('[Auth] Token expired, clearing storage');
          clearAuthFromStorage();
          return { user: null, token: null, tokenData: null, isAuthenticated: false };
        }
      }
      
      return {
        user: parsed.user || null,
        token: parsed.tokenData?.accessToken || parsed.token || null,
        tokenData: parsed.tokenData || null,
        isAuthenticated: !!(parsed.tokenData?.accessToken || parsed.token),
      };
    }
  } catch (error) {
    console.error('Error loading auth from storage:', error);
  }
  return { user: null, token: null, tokenData: null, isAuthenticated: false };
};

const saveAuthToStorage = (state: AuthState) => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        user: state.user,
        token: state.token,
        tokenData: state.tokenData,
      })
    );
    
    // Also save to legacy keys for backward compatibility
    if (state.token) {
      localStorage.setItem('auth_token', state.token);
    }
    if (state.tokenData?.refreshToken) {
      localStorage.setItem('refresh_token', state.tokenData.refreshToken);
    }
    if (state.user) {
      localStorage.setItem('user_data', JSON.stringify(state.user));
    }
  } catch (error) {
    console.error('Error saving auth to storage:', error);
  }
};

const clearAuthFromStorage = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
  } catch (error) {
    console.error('Error clearing auth from storage:', error);
  }
};

const initialState: AuthState = {
  user: null,
  token: null,
  tokenData: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  ...loadAuthFromStorage(),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string; tokenData?: TokenData }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.tokenData = action.payload.tokenData || null;
      state.isAuthenticated = true;
      state.error = null;
      saveAuthToStorage(state);
    },
    setTokens: (
      state,
      action: PayloadAction<{ accessToken: string; refreshToken: string; expiresIn: number }>
    ) => {
      const { accessToken, refreshToken, expiresIn } = action.payload;
      const expiresAt = Date.now() + (expiresIn * 1000);
      
      state.token = accessToken;
      state.tokenData = {
        accessToken,
        refreshToken,
        expiresAt,
        tokenType: 'Bearer'
      };
      state.isAuthenticated = true;
      saveAuthToStorage(state);
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      saveAuthToStorage(state);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.tokenData = null;
      state.isAuthenticated = false;
      state.error = null;
      clearAuthFromStorage();
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setCredentials,
  setTokens,
  setUser,
  logout,
  setLoading,
  setError,
  clearError,
} = authSlice.actions;

export default authSlice.reducer;
