import { NextRequest } from 'next/server';

export interface UserProfile {
  userId: string;
  username: string;
  email: string;
  roles: string[];
  permissions: string[];
}

export class AuthService {
  private static instance: AuthService;
  private userServiceUrl: string;

  constructor() {
    this.userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:8080';
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.userServiceUrl}/api/v1/auth/validate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      return response.ok;
    } catch (error) {
      console.error('[AuthService] Token validation failed:', error);
      return false;
    }
  }

  async getProfile(token: string): Promise<UserProfile | null> {
    try {
      const response = await fetch(`${this.userServiceUrl}/api/v1/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('[AuthService] Profile fetch failed:', error);
      return null;
    }
  }

  async checkPermission(token: string, resource: string, action: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.userServiceUrl}/api/v1/auth/check-permission`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ resource, action })
      });

      return response.ok;
    } catch (error) {
      console.error('[AuthService] Permission check failed:', error);
      return false;
    }
  }
}

export const authService = AuthService.getInstance();


