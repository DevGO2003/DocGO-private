import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ServiceConfig, RestResponse } from '@/types';
import logger from './logger';

class ServiceManager {
  private services: Map<string, AxiosInstance> = new Map();
  private serviceConfigs: Map<string, ServiceConfig> = new Map();

  constructor() {
    this.initializeServices();
  }

  private initializeServices(): void {
    // Authentication Service
    this.addService('authentication', {
      name: 'authentication-identity-service',
      url: process.env.AUTHENTICATION_SERVICE_URL || 'http://localhost:8001',
      healthCheck: '/api/v1/authentication-identity-service/auth/health',
      timeout: 10000
    });

    // User Management Service
    this.addService('user-management', {
      name: 'user-management-service',
      url: process.env.USER_MANAGEMENT_SERVICE_URL || 'http://localhost:8002',
      healthCheck: '/health',
      timeout: 10000
    });
  }

  private addService(key: string, config: ServiceConfig): void {
    const axiosInstance = axios.create({
      baseURL: config.url,
      timeout: config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'API-Gateway-BFF/1.0.0'
      }
    });

    // Add request interceptor for logging
    axiosInstance.interceptors.request.use(
      (config) => {
        logger.info(`🚀 ${config.method?.toUpperCase()} ${config.url}`, {
          service: key,
          headers: config.headers
        });
        return config;
      },
      (error) => {
        logger.error(`❌ Request error to ${key}:`, error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for logging
    axiosInstance.interceptors.response.use(
      (response) => {
        logger.info(`✅ Response from ${key}: ${response.status}`, {
          service: key,
          status: response.status,
          url: response.config.url
        });
        return response;
      },
      (error) => {
        logger.error(`❌ Response error from ${key}:`, {
          service: key,
          status: error.response?.status,
          message: error.message,
          url: error.config?.url
        });
        return Promise.reject(error);
      }
    );

    this.services.set(key, axiosInstance);
    this.serviceConfigs.set(key, config);
    logger.info(`🔗 Service ${key} initialized: ${config.url}`);
  }

  getService(key: string): AxiosInstance | undefined {
    return this.services.get(key);
  }

  getServiceConfig(key: string): ServiceConfig | undefined {
    return this.serviceConfigs.get(key);
  }

  async checkServiceHealth(key: string): Promise<boolean> {
    const service = this.services.get(key);
    const config = this.serviceConfigs.get(key);

    if (!service || !config) {
      return false;
    }

    try {
      const response = await service.get(config.healthCheck);
      return response.status === 200;
    } catch (error) {
      logger.error(`❌ Health check failed for ${key}:`, error);
      return false;
    }
  }

  async checkAllServicesHealth(): Promise<Record<string, boolean>> {
    const healthStatus: Record<string, boolean> = {};
    
    for (const [key] of this.services) {
      healthStatus[key] = await this.checkServiceHealth(key);
    }

    return healthStatus;
  }

  // Authentication Service Methods
  async authenticateUser(loginRequest: any): Promise<RestResponse<any>> {
    const service = this.getService('authentication');
    if (!service) {
      throw new Error('Authentication service not available');
    }

    try {
      const response: AxiosResponse<RestResponse<any>> = await service.get('/api/v1/authentication-identity-service/auth/login', {
        data: loginRequest
      });
      return response.data;
    } catch (error: any) {
      logger.error('❌ Authentication failed:', error.response?.data || error.message);
      throw error;
    }
  }

  async registerUser(authRequest: any): Promise<RestResponse<any>> {
    const service = this.getService('authentication');
    if (!service) {
      throw new Error('Authentication service not available');
    }

    try {
      const response: AxiosResponse<RestResponse<any>> = await service.post('/api/v1/authentication-identity-service/auth/register', authRequest);
      return response.data;
    } catch (error: any) {
      logger.error('❌ User registration failed:', error.response?.data || error.message);
      throw error;
    }
  }

  // User Management Service Methods
  async getUserProfile(userId: string): Promise<RestResponse<any>> {
    const service = this.getService('user-management');
    if (!service) {
      throw new Error('User management service not available');
    }

    try {
      const response: AxiosResponse<RestResponse<any>> = await service.get(`/api/v1/user-management-service/users/${userId}`);
      return response.data;
    } catch (error: any) {
      logger.error('❌ Get user profile failed:', error.response?.data || error.message);
      throw error;
    }
  }

  async updateUserProfile(userId: string, userData: any): Promise<RestResponse<any>> {
    const service = this.getService('user-management');
    if (!service) {
      throw new Error('User management service not available');
    }

    try {
      const response: AxiosResponse<RestResponse<any>> = await service.put(`/api/v1/user-management-service/users/${userId}`, userData);
      return response.data;
    } catch (error: any) {
      logger.error('❌ Update user profile failed:', error.response?.data || error.message);
      throw error;
    }
  }

  async getUserApprovals(userId: string): Promise<RestResponse<any>> {
    const service = this.getService('user-management');
    if (!service) {
      throw new Error('User management service not available');
    }

    try {
      const response: AxiosResponse<RestResponse<any>> = await service.get(`/api/v1/user-management-service/approvals/${userId}`);
      return response.data;
    } catch (error: any) {
      logger.error('❌ Get user approvals failed:', error.response?.data || error.message);
      throw error;
    }
  }

  // Generic proxy method for other endpoints
  async proxyRequest(serviceKey: string, method: string, endpoint: string, data?: any, headers?: any): Promise<any> {
    const service = this.getService(serviceKey);
    if (!service) {
      throw new Error(`Service ${serviceKey} not available`);
    }

    try {
      const config: any = { headers };
      let response: AxiosResponse;

      switch (method.toLowerCase()) {
        case 'get':
          response = await service.get(endpoint, config);
          break;
        case 'post':
          response = await service.post(endpoint, data, config);
          break;
        case 'put':
          response = await service.put(endpoint, data, config);
          break;
        case 'delete':
          response = await service.delete(endpoint, config);
          break;
        default:
          throw new Error(`Unsupported HTTP method: ${method}`);
      }

      return response.data;
    } catch (error: any) {
      logger.error(`❌ Proxy request failed for ${serviceKey}:`, error.response?.data || error.message);
      throw error;
    }
  }
}

// Singleton instance
const serviceManager = new ServiceManager();

export default serviceManager;
