/**
 * Centralized configuration for API Gateway
 * Tất cả URL và cấu hình được quản lý tập trung với fallback values chuẩn hóa
 */

export interface ServiceConfig {
  name: string;
  url: string;
  port: number;
  healthCheck: string;
  timeout: number;
}

export interface GatewayConfig {
  services: Record<string, ServiceConfig>;
  redis: {
    url: string;
    host: string;
    port: number;
    password?: string;
  };
  kafka: {
    brokers: string;
  };
  logging: {
    level: string;
    environment: string;
  };
  cors: {
    origins: string[];
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
}

/**
 * Centralized configuration class
 */
export class Config {
  // ==========================================
  // ENVIRONMENT DETECTION
  // ==========================================
  static isDocker(): boolean {
    return process.env.ENVIRONMENT === 'docker' || 
           process.env.NODE_ENV === 'production' ||
           process.env.DOCKERIZED === '1' ||
           process.env.DOCKER_CONTAINER === '1' ||
           (process.env.HOSTNAME && process.env.HOSTNAME.length === 12);
  }

  // ==========================================
  // SERVICE CONFIGURATION
  // ==========================================
  static readonly ENVIRONMENT: string = process.env.ENVIRONMENT || 'development';
  static readonly NODE_ENV: string = process.env.NODE_ENV || 'development';
  static readonly PORT: number = parseInt(process.env.PORT || '8000');

  // ==========================================
  // INFRASTRUCTURE SERVICES (Shared from root .env)
  // ==========================================
  // Redis Configuration
  static readonly REDIS_URL: string = process.env.REDIS_URL || 'redis://redis:6379';
  static readonly REDIS_HOST: string = process.env.REDIS_HOST || 'redis';
  static readonly REDIS_PORT: number = parseInt(process.env.REDIS_PORT || '6379');
  static readonly REDIS_PASSWORD: string = process.env.REDIS_PASSWORD || '';

  // Kafka Configuration
  static readonly KAFKA_BROKERS: string = process.env.KAFKA_BROKERS || 'kafka:9092';

  // ==========================================
  // SERVICE URLS (Smart URL building)
  // ==========================================
  static getApiGatewayUrl(): string {
    return process.env.API_GATEWAY_URL || 'http://localhost:8000';
  }

  static getUserManagementServiceUrl(): string {
    return process.env.USER_MANAGEMENT_SERVICE_URL || 
           (this.isDocker() ? 'http://user-management-service:8001' : 'http://localhost:8001');
  }

  static getDocumentManagementServiceUrl(): string {
    return process.env.DOCUMENT_MANAGEMENT_SERVICE_URL || 
           (this.isDocker() ? 'http://document-management-service:8002' : 'http://localhost:8002');
  }

  static getAutomationServiceUrl(): string {
    return process.env.AUTOMATION_SERVICE_URL || 
           (this.isDocker() ? 'http://automation-service:8003' : 'http://localhost:8003');
  }

  static getFileServiceUrl(): string {
    return process.env.FILE_SERVICE_URL || 
           (this.isDocker() ? 'http://file-storage-service:8000' : 'http://localhost:8000');
  }

  // ==========================================
  // CORS CONFIGURATION
  // ==========================================
  static getCorsOrigins(): string[] {
    const origins = process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:8000';
    return origins.split(',').map(origin => origin.trim());
  }

  // ==========================================
  // RATE LIMITING
  // ==========================================
  static readonly RATE_LIMIT_WINDOW_MS: number = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'); // 15 minutes
  static readonly RATE_LIMIT_MAX_REQUESTS: number = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100');

  // ==========================================
  // LOGGING CONFIGURATION
  // ==========================================
  static readonly LOG_LEVEL: string = process.env.LOG_LEVEL || 'info';

  // ==========================================
  // SERVICE CONFIGURATION OBJECT
  // ==========================================
  static getServices(): Record<string, ServiceConfig> {
    return {
      'api-gateway': {
        name: 'api-gateway',
        url: this.getApiGatewayUrl(),
        port: 8000,
        healthCheck: '/health',
        timeout: 10000
      },
      
      'user-management': {
        name: 'user-management-service',
        url: this.getUserManagementServiceUrl(),
        port: 8001,
        healthCheck: '/api/v1/user-management-service/v1/health',
        timeout: 15000
      },
      
      'document-management': {
        name: 'document-management-service',
        url: this.getDocumentManagementServiceUrl(),
        port: 8002,
        healthCheck: '/api/v1/document-management-service/v1/health',
        timeout: 10000
      },
      
      'automation': {
        name: 'automation-service',
        url: this.getAutomationServiceUrl(),
        port: 8003,
        healthCheck: '/api/v1/automation-service/v1/health',
        timeout: 15000
      }
    };
  }

  // ==========================================
  // FULL CONFIGURATION OBJECT
  // ==========================================
  static getConfig(): GatewayConfig {
    return {
      services: this.getServices(),
      redis: {
        url: this.REDIS_URL,
        host: this.REDIS_HOST,
        port: this.REDIS_PORT,
        password: this.REDIS_PASSWORD
      },
      kafka: {
        brokers: this.KAFKA_BROKERS
      },
      logging: {
        level: this.LOG_LEVEL,
        environment: this.NODE_ENV
      },
      cors: {
        origins: this.getCorsOrigins()
      },
      rateLimit: {
        windowMs: this.RATE_LIMIT_WINDOW_MS,
        maxRequests: this.RATE_LIMIT_MAX_REQUESTS
      }
    };
  }
}

/**
 * Legacy configuration object for backward compatibility
 */
export const config: GatewayConfig = Config.getConfig();

/**
 * Helper function to get service config
 */
export function getServiceConfig(serviceName: string): ServiceConfig | null {
  return config.services[serviceName] || null;
}

/**
 * Helper function to get service URL
 */
export function getServiceUrl(serviceName: string): string | null {
  const serviceConfig = getServiceConfig(serviceName);
  return serviceConfig?.url || null;
}

/**
 * Check if running in Docker
 */
export function isDocker(): boolean {
  return Config.isDocker();
}

export default config;
