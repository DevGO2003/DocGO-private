import { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { store } from '@features/auth/models/store';
import { logout, setTokens } from '@features/auth/models/state/authSlice';

export interface TokenRefreshResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export class TokenManager {
  private static instance: TokenManager;
  private refreshPromise: Promise<string> | null = null;

  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    // Try Redux store first
    const state = store.getState();
    if (state.auth.token) {
      return state.auth.token;
    }

    // Fallback to localStorage
    return localStorage.getItem('auth_token');
  }

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    // Try Redux store first
    const state = store.getState();
    if (state.auth.tokenData?.refreshToken) {
      return state.auth.tokenData.refreshToken;
    }

    // Fallback to localStorage
    return localStorage.getItem('refresh_token');
  }

  setTokens(tokens: TokenRefreshResponse): void {
    // Update Redux store
    store.dispatch(setTokens({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn
    }));

    // Update localStorage for backward compatibility
    localStorage.setItem('auth_token', tokens.accessToken);
    localStorage.setItem('refresh_token', tokens.refreshToken);
  }

  clearTokens(): void {
    // Clear Redux store
    store.dispatch(logout());

    // Clear localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('docgo_auth_v1');
  }

  async refreshToken(): Promise<string> {
    // Prevent multiple simultaneous refresh attempts
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performTokenRefresh();
    
    try {
      const newToken = await this.refreshPromise;
      return newToken;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async performTokenRefresh(): Promise<string> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/user-management-service/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken })
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.data) {
        throw new Error('Invalid refresh response');
      }

      const tokens: TokenRefreshResponse = {
        accessToken: data.data.accessToken,
        refreshToken: data.data.refreshToken || refreshToken,
        expiresIn: data.data.expiresIn || 3600
      };

      this.setTokens(tokens);
      return tokens.accessToken;

    } catch (error) {
      console.error('[TokenManager] Refresh failed:', error);
      this.clearTokens();
      throw error;
    }
  }

  isTokenExpired(token?: string): boolean {
    const tokenToCheck = token || this.getAuthToken();
    if (!tokenToCheck) return true;

    try {
      const payload = JSON.parse(atob(tokenToCheck.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      const bufferTime = 5 * 60; // 5 minutes buffer
      
      return now >= (payload.exp - bufferTime);
    } catch (error) {
      console.error('[TokenManager] Token parsing error:', error);
      return true;
    }
  }
}

export const tokenManager = TokenManager.getInstance();


