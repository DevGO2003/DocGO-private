// Load environment variables first
import '@/lib/env-loader';

import { NextApiRequest, NextApiResponse } from 'next';
import serviceManager from '@/lib/services';
import logger from '@/lib/logger';
import { withApiHandler } from '@/lib/http/withApiHandler';
import { Buffer } from 'buffer';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    }
  }
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Extract path from dynamic route
  const pathArray = (req.query.path as string[]) || [];
  const resourcePath = pathArray.join('/');
  const method = req.method || 'GET';
  
  // Construct full path for repository-management-service
  const fullPath = `/api/v1/repository-management-service/${resourcePath}`;
  
  logger.info(`🔄 Repository Management Service Proxy: ${method} ${fullPath}`);

  // Get repository-management service
  const service = serviceManager.getService('repository-management');
  if (!service) {
    return res.status(503).json({
      error: 'Service unavailable',
      message: 'Repository Management Service is not available'
    });
  }

  try {
    // Prepare headers
    const headers: Record<string, string> = {
      'User-Agent': 'API-Gateway/1.0.0',
      'Content-Type': 'application/json; charset=utf-8'
    };

    // Forward critical headers
    if (req.headers['authorization']) {
      headers['Authorization'] = req.headers['authorization'] as string;
    }
    if (req.headers['x-correlation-id']) {
      headers['X-Correlation-Id'] = req.headers['x-correlation-id'] as string;
    }
    if (req.headers['x-actor']) {
      headers['X-Actor'] = req.headers['x-actor'] as string;
    }

    // Sanitize query params
    const sanitizedParams: Record<string, any> = {};
    Object.keys(req.query).forEach((key) => {
      if (key !== 'path') { // Exclude the path parameter
        const value = req.query[key];
        if (Array.isArray(value)) {
          const cleaned = value
            .map((v) => (typeof v === 'string' ? v.trim() : v))
            .filter((v) => v !== '' && v !== undefined && v !== null);
          if (cleaned.length > 0) sanitizedParams[key] = cleaned;
        } else if (typeof value === 'string') {
          const trimmed = value.trim();
          if (trimmed !== '') sanitizedParams[key] = trimmed;
        } else if (value !== undefined && value !== null) {
          sanitizedParams[key] = value;
        }
      }
    });

    // Handle request body
    let requestData = req.body;
    if (req.body && typeof req.body === 'object') {
      requestData = JSON.stringify(req.body);
      headers['Content-Length'] = Buffer.byteLength(requestData, 'utf8').toString();
    }

    // Make request to microservice
    const response = await service.request({
      method: method as any,
      url: fullPath,
      data: requestData,
      headers,
      params: sanitizedParams,
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      validateStatus: () => true
    });

    logger.info(`✅ Repository Management Service Response: ${response.status}`);
    return res.status(response.status).json(response.data);

  } catch (error: any) {
    logger.error('❌ Repository Management Service Error:', error);
    return res.status(503).json({
      error: 'Service unavailable',
      message: 'Repository Management Service is not available'
    });
  }
}

export default withApiHandler(handler);


