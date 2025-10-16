// Load environment variables first
import '@/lib/env-loader';

import { NextApiRequest, NextApiResponse } from 'next';
import serviceManager from '@/lib/services';
import logger from '@/lib/logger';
import { withApiHandler } from '@/lib/http/withApiHandler';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    }
  }
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const method = req.method || 'GET';
  const fullPath = `/api/v1/file-management-service/v1/documents`;
  
  logger.info(`🔄 Documents API Proxy: ${method} ${fullPath}`);

  // Get document-management service
  const service = serviceManager.getService('document-management');
  if (!service) {
    return res.status(503).json({
      error: 'Service unavailable',
      message: 'Document Management Service is not available'
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
    });

    // Handle request body
    let requestData = req.body;
    if (req.body && typeof req.body === 'object') {
      requestData = JSON.stringify(req.body);
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

    logger.info(`✅ Documents API Response: ${response.status}`);
    return res.status(response.status).json(response.data);

  } catch (error: any) {
    logger.error('❌ Documents API Error:', error);
    return res.status(503).json({
      error: 'Service unavailable',
      message: 'Document Management Service is not available'
    });
  }
}

export default withApiHandler(handler);
