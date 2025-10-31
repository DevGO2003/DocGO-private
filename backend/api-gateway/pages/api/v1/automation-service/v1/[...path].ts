// Load environment variables first
import '@/lib/env-loader';

import { NextApiRequest, NextApiResponse } from 'next';
import serviceManager from '@/lib/services';
import logger from '@/lib/logger';
import { withApiHandler } from '@/lib/http/withApiHandler';

export const config = {
  api: {
    bodyParser: false, // important for streaming multipart/form-data
  },
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const pathArray = (req.query.path as string[]) || [];
  const resourcePath = pathArray.join('/');
  const method = req.method || 'GET';

  const fullPath = `/api/v1/automation-service/${resourcePath}`;
  logger.info(`🔄 Automation Service Proxy: ${method} ${fullPath}`);

  // Require Authorization for all non-public endpoints
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.toString().startsWith('Bearer ')) {
    logger.warn(`❌ Missing or invalid Authorization header for ${fullPath}`);
    return res.status(401).json({
      apiVersion: 'v1',
      statusCode: 401,
      shortMessage: 'Unauthorized',
      description: 'Missing or invalid authorization header',
      data: null,
      timestamp: new Date().toISOString(),
      requestId: (req.headers['x-request-id'] as string) || 'unknown',
      path: fullPath,
    });
  }

  const service = serviceManager.getService('automation');
  if (!service) {
    return res.status(503).json({
      error: 'Service unavailable',
      message: 'Automation Service is not available',
    });
  }

  try {
    // Forward headers
    const headers: Record<string, string> = {
      'User-Agent': 'API-Gateway/1.0.0',
    };

    if (req.headers['authorization']) headers['Authorization'] = String(req.headers['authorization']);
    if (req.headers['x-correlation-id']) headers['X-Correlation-Id'] = String(req.headers['x-correlation-id']);
    if (req.headers['x-actor']) headers['X-Actor'] = String(req.headers['x-actor']);

    // Identity headers from middleware
    if (req.headers['x-user-token']) headers['X-User-Token'] = String(req.headers['x-user-token']);
    if (req.headers['x-user-id']) headers['X-User-Id'] = String(req.headers['x-user-id']);
    if (req.headers['x-user-roles']) headers['X-User-Roles'] = String(req.headers['x-user-roles']);
    if (req.headers['x-username']) headers['X-Username'] = String(req.headers['x-username']);
    if (req.headers['x-user-email']) headers['X-User-Email'] = String(req.headers['x-user-email']);

    // Preserve content headers (especially for multipart/form-data streaming)
    if (req.headers['content-type']) headers['Content-Type'] = String(req.headers['content-type']);
    if (req.headers['content-length']) headers['Content-Length'] = String(req.headers['content-length']);

    // Sanitize query params
    const sanitizedParams: Record<string, any> = {};
    Object.keys(req.query).forEach((key) => {
      if (key !== 'path') {
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

    // For streaming (multipart/form-data), pass the incoming request stream directly
    // Axios supports streams in node as request body
    const data = req as any;

    const response = await service.request({
      method: method as any,
      url: fullPath,
      data,
      headers,
      params: sanitizedParams,
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      responseType: 'stream',
      validateStatus: () => true,
    });

    // Pipe the response stream and set headers/status
    res.status(response.status);
    Object.entries(response.headers || {}).forEach(([key, value]) => {
      if (value && typeof value === 'string') {
        // skip hop-by-hop headers if any
        if (!['transfer-encoding', 'content-encoding'].includes(key.toLowerCase())) {
          res.setHeader(key, value);
        }
      }
    });
    response.data.pipe(res);
  } catch (error: any) {
    logger.error('❌ Automation Service Error:', error);
    return res.status(503).json({
      error: 'Service unavailable',
      message: 'Automation Service is not available',
    });
  }
}

export default withApiHandler(handler);
