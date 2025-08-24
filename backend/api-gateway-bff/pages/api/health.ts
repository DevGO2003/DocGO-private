import { NextApiRequest, NextApiResponse } from 'next';
import serviceManager from '@/lib/services';
import kafkaService from '@/lib/kafka';
import logger from '@/lib/logger';

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Kiểm tra trạng thái sức khỏe của API Gateway và tất cả 19 microservices
 *     description: |
 *       ## 🔍 Health Check Endpoint
 *       
 *       Endpoint này kiểm tra trạng thái sức khỏe của:
 *       - API Gateway BFF (Port 8000)
 *       - Tất cả 19 microservices đã được cấu hình
 *       - Kết nối Kafka
 *       
 *       ### 🔹 Đầu vào
 *       🚫 Không có tham số đầu vào
 *       
 *       ### 🔹 Đầu ra
 *       📊 **HealthStatus**
 *       Loại: object
 *       Mô tả: Trạng thái tổng thể của hệ thống
 *       
 *       ### 📋 Response Codes
 *       - **200 OK**: Tất cả service đều khỏe mạnh
 *       - **503 Service Unavailable**: Một số service không khỏe mạnh
 *       - **500 Internal Server Error**: Lỗi trong quá trình kiểm tra
 *       
 *       ### 🔗 Related Endpoints
 *       - `GET /api/v1/{service-name}/health` - Health check từng service cụ thể
 *       
 *     tags: [API Gateway BFF]
 *     responses:
 *       200:
 *         description: Tất cả 19 microservices đều khỏe mạnh
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthStatus'
 *             example:
 *               status: "healthy"
 *               service: "API Gateway BFF"
 *               timestamp: "2025-08-23T11:00:00.000Z"
 *               uptime: 3600.5
 *               services:
 *                 "api-gateway-bff": true
 *                 "authentication": true
 *                 "user-management": true
 *                 "contract-management": true
 *                 "versioning-document-history": true
 *                 "commenting-collaboration": true
 *                 "approval-workflow": true
 *                 "reminder-scheduler": true
 *                 "esignature-integration": true
 *                 "notification": true
 *                 "reporting-analytics": true
 *                 "ocr-document-extraction": true
 *                 "file-storage": true
 *                 "audit-activity-log": true
 *                 "integration-connectors": true
 *                 "batch-etl": true
 *                 "health-monitoring-agent": true
 *                 "ai-processing": true
 *                 "general-file-management": true
 *               kafka: true
 *               version: "1.0.0"
 *       503:
 *         description: Một số microservices không khỏe mạnh
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthStatus'
 *             example:
 *               status: "degraded"
 *               service: "API Gateway BFF"
 *               timestamp: "2025-08-23T11:00:00.000Z"
 *               uptime: 3600.5
 *               services:
 *                 "api-gateway-bff": true
 *                 "authentication": true
 *                 "user-management": false
 *                 "contract-management": true
 *                 "versioning-document-history": true
 *                 "commenting-collaboration": true
 *                 "approval-workflow": true
 *                 "reminder-scheduler": true
 *                 "esignature-integration": true
 *                 "notification": true
 *                 "reporting-analytics": true
 *                 "ocr-document-extraction": true
 *                 "file-storage": true
 *                 "audit-activity-log": true
 *                 "integration-connectors": true
 *                 "batch-etl": true
 *                 "health-monitoring-agent": true
 *                 "ai-processing": true
 *                 "general-file-management": true
 *               kafka: true
 *               version: "1.0.0"
 *       500:
 *         description: Lỗi trong quá trình kiểm tra
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Internal Server Error"
 *               message: "Health check failed"
 *               statusCode: 500
 */

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check all services health
    const servicesHealth = await serviceManager.checkAllServicesHealth();
    
    // Check Kafka connection
    const kafkaHealth = kafkaService.isKafkaConnected();

    const healthStatus = {
      status: 'healthy',
      service: 'API Gateway BFF',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: servicesHealth,
      kafka: kafkaHealth,
      version: '1.0.0'
    };

    // Determine overall health
    const allServicesHealthy = Object.values(servicesHealth).every(healthy => healthy);
    const overallHealth = allServicesHealthy && kafkaHealth;

    if (!overallHealth) {
      healthStatus.status = 'degraded';
      return res.status(503).json(healthStatus);
    }

    logger.info('✅ Health check passed');
    return res.status(200).json(healthStatus);

  } catch (error) {
    logger.error('❌ Health check failed:', error);
    
    return res.status(500).json({
      status: 'unhealthy',
      service: 'API Gateway BFF',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
