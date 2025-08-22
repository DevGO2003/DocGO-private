import { NextApiRequest, NextApiResponse } from 'next';
import { applyMiddleware } from '@/lib/middleware';
import serviceManager from '@/lib/services';
import kafkaService from '@/lib/kafka';
import logger from '@/lib/logger';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { path } = req.query;
    const fullPath = Array.isArray(path) ? path.join('/') : path || '';
    const method = req.method || 'GET';

    logger.info(`🔄 Proxying request: ${method} /${fullPath}`);

    // Determine which service to route to
    let serviceKey: string;
    let endpoint: string;

    if (fullPath.startsWith('authentication-identity-service')) {
      serviceKey = 'authentication';
      endpoint = `/${fullPath}`;
    } else if (fullPath.startsWith('user-management-service')) {
      serviceKey = 'user-management';
      endpoint = `/${fullPath}`;
    } else {
      return res.status(404).json({
        error: 'Service not found',
        message: `No service configured for path: ${fullPath}`
      });
    }

    // Get service instance
    const service = serviceManager.getService(serviceKey);
    if (!service) {
      return res.status(503).json({
        error: 'Service unavailable',
        message: `Service ${serviceKey} is not available`
      });
    }

    // Make request to microservice
    let response;
    try {
      switch (method.toUpperCase()) {
        case 'GET':
          response = await service.get(endpoint, { params: req.query });
          break;
        case 'POST':
          response = await service.post(endpoint, req.body, { params: req.query });
          break;
        case 'PUT':
          response = await service.put(endpoint, req.body, { params: req.query });
          break;
        case 'DELETE':
          response = await service.delete(endpoint, { params: req.query });
          break;
        default:
          return res.status(405).json({
            error: 'Method not allowed',
            message: `HTTP method ${method} is not supported`
          });
      }

      // Return response from microservice
      return res.status(response.status).json(response.data);

    } catch (error: any) {
      logger.error(`❌ Error calling ${serviceKey} service:`, error);

      // Return error response
      if (error.response) {
        return res.status(error.response.status).json(error.response.data);
      } else {
        return res.status(500).json({
          error: 'Service error',
          message: error.message || 'An error occurred while processing the request'
        });
      }
    }

  } catch (error: any) {
    logger.error('❌ Unhandled error in API gateway:', error);

    return res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
    responseLimit: false,
  },
};
