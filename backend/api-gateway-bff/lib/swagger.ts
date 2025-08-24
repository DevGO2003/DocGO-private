import swaggerJSDoc from 'swagger-jsdoc';

/**
 * Swagger configuration cho API Gateway BFF
 * Tuân thủ cursor rules: Base path `/api/v1/{service-name}/...`
 */

const swaggerOptions = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'DocGO - API Gateway BFF',
      version: '1.0.0',
      description: `
## 🚀 API Gateway BFF - DocGO

API Gateway Backend for Frontend (BFF) sử dụng Next.js và Kafka để kết nối và quản lý các microservice của hệ thống DocGO.

### 🔗 **Service Discovery & Routing**
- Tự động định tuyến request đến microservice phù hợp
- Hỗ trợ tất cả HTTP methods (GET, POST, PUT, DELETE)
- Xử lý query parameters và request body

### 📡 **Kafka Integration**
- Publish events khi có thay đổi từ các service
- Subscribe và xử lý events từ các topic
- Logging và monitoring real-time

### 🔐 **Authentication & Authorization**
- JWT-based security với middleware
- Rate limiting (100 requests/15 minutes)
- CORS handling và security headers

### 📊 **Health Monitoring**
- Kiểm tra trạng thái tất cả microservice
- Monitoring Kafka connection
- Uptime tracking và performance metrics

---

**Base URL**: \`/api/v1/{service-name}/...\`

**Available Services**:
- \`authentication-identity-service\` (Port 8001) - Spring Boot
- \`user-management-service\` (Port 8002) - FastAPI  
- \`contract-management-service\` (Port 8003) - Spring Boot
- \`ai-processing-service\` (Port 8017) - FastAPI
- \`file-storage-asset-service\` (Port 8012) - FastAPI

**Port Mapping**:
- API Gateway BFF: 8000
- Authentication Service: 8001
- User Management Service: 8002
- Contract Management Service: 8003
- AI Processing Service: 8017
- File Storage Service: 8012
      `,
      contact: {
        name: 'devgo2003',
        email: 'devgo2003@gmail.com'
      },
      license: {
        name: 'DocGO License',
        url: 'https://github.com/DevGO2003/DocGO'
      }
    },
    servers: [
      {
        url: 'http://localhost:8000',
        description: 'Development Server'
      },
      {
        url: 'https://api.docgo.com',
        description: 'Production Server'
      }
    ],
    tags: [
      {
        name: 'API Gateway BFF',
        description: 'Health check và monitoring endpoints'
      },
      {
        name: 'Authentication Service',
        description: 'Xác thực và quản lý người dùng'
      },
      {
        name: 'User Management Service',
        description: 'Quản lý thông tin người dùng và approvals'
      },
      {
        name: 'Contract Management Service',
        description: 'Quản lý hợp đồng và workflow'
      },
      {
        name: 'AI Processing Service',
        description: 'Xử lý AI cho tài liệu và văn bản'
      },
      {
        name: 'File Storage Service',
        description: 'Quản lý file và tài sản số'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token từ authentication service'
        }
      },
      schemas: {
        RestResponse: {
          type: 'object',
          properties: {
            apiVersion: {
              type: 'string',
              example: 'v1'
            },
            statusCode: {
              type: 'integer',
              example: 200
            },
            shortMessage: {
              type: 'string',
              example: 'Success'
            },
            description: {
              type: 'string',
              example: 'Mô tả kết quả'
            },
            data: {
              type: 'object',
              description: 'Dữ liệu response'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2025-08-23T11:00:00.000Z'
            },
            requestId: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000'
            },
            path: {
              type: 'string',
              example: '/api/v1/authentication-identity-service/auth/login'
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              example: 'Bad Request'
            },
            message: {
              type: 'string',
              example: 'Chi tiết lỗi'
            },
            statusCode: {
              type: 'integer',
              example: 400
            }
          }
        },
        HealthStatus: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['healthy', 'degraded', 'unhealthy'],
              example: 'healthy'
            },
            service: {
              type: 'string',
              example: 'API Gateway BFF'
            },
            timestamp: {
              type: 'string',
              format: 'date-time'
            },
            uptime: {
              type: 'number',
              example: 3600.5
            },
            services: {
              type: 'object',
              description: 'Trạng thái các microservice'
            },
            kafka: {
              type: 'boolean',
              example: true
            },
            version: {
              type: 'string',
              example: '1.0.0'
            }
          }
        }
      }
    },
    security: [
      {
        BearerAuth: []
      }
    ]
  },
  apis: [
    './pages/api/*.ts',
    './lib/*.ts',
    './types/*.ts'
  ]
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);
