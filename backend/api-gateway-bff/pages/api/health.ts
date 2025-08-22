import { NextApiRequest, NextApiResponse } from 'next';
import serviceManager from '@/lib/services';
import kafkaService from '@/lib/kafka';
import logger from '@/lib/logger';

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
