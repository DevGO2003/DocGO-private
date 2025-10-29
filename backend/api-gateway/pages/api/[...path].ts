// Load environment variables first
import '@/lib/env-loader';

import { NextApiRequest, NextApiResponse } from 'next';
import serviceManager from '@/lib/services';
import logger from '@/lib/logger';
import { withApiHandler } from '@/lib/http/withApiHandler';
import { withCors } from '@/lib/cors';
// Note: Use global Buffer if needed; avoid importing 'buffer' to prevent build issues

export const config = {
  api: {
    // Enable bodyParser for JSON, disable for multipart
    bodyParser: {
      sizeLimit: '10mb',
      json: {
        limit: '10mb'
      },
      text: {
        limit: '10mb'
      },
      // Disable for raw/multipart to handle file uploads
      raw: false,
      urlEncoded: {
        extended: true,
        limit: '10mb'
      }
    }
  }
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Explicit CORS handling to ensure correct headers on proxied responses
    const origin = (req.headers.origin as string) || process.env.WEB_APP_URL || 'http://localhost:3000';
    const allowHeaders = 'Content-Type, Authorization, X-Requested-With, X-User-Token, X-User-Id, X-User-Roles, X-Username, X-User-Email, X-Correlation-Id, X-Actor';
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', allowHeaders);
    res.setHeader('Vary', 'Origin');

    // Handle preflight quickly
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    // Get the path from req.query.path (Next.js dynamic route parameter)
    const pathArray = req.query.path as string[] || [];
    const fullPath = pathArray.join('/');
    const method = req.method || 'GET';

  // Reconstruct full API path
  const fullApiPath = fullPath.startsWith('api/') ? `/${fullPath}` : `/api/${fullPath}`;
  
  logger.info(`🔄 Proxy request: ${method} ${fullApiPath}`);

  // Determine service key and keep original endpoint
  const parts = fullPath.split('/').filter(Boolean);
  
  logger.info(`🔍 [DEBUG] Path parsing:`, {
    fullPath,
    parts,
    partsLength: parts.length,
    originalUrl: req.url,
    pathArray,
    queryPath: req.query.path
  });

  // Map of tokens to service keys - ONLY full service names allowed
  const tokenToService: Record<string, string> = {
    // user-management service
    'user-management-service': 'user-management',
    // repository-management service
    'repository-management-service': 'repository-management',
    // automation service
    'automation-service': 'automation'
  };

  // Handle path structure - ONLY accept /api/v1/service-name/... format
  let serviceKey = '';
  
  // Use the reconstructed fullApiPath (which always includes /api prefix)
  const serviceParts = fullApiPath.split('/').filter(Boolean); // ['api','v1','service-name',...]
  if (serviceParts.length >= 3 && serviceParts[0] === 'api' && serviceParts[1] === 'v1') {
    const serviceName = serviceParts[2];
    serviceKey = tokenToService[serviceName] || '';
  }
  
  // If service not found, return 400 error
  if (!serviceKey) {
    logger.error(`❌ Invalid service path: ${fullPath}`);
    return res.status(400).json({
      error: 'Bad Request',
      message: `Invalid API path. Expected format: /api/v1/{service-name}/{resource}. Valid services: user-management-service, repository-management-service, automation-service`
    });
  }
  
  logger.info(`🎯 [DEBUG] Service key determined:`, {
    serviceKey,
    fullPath,
    parts
  });

  // Keep original endpoint including /api/v1/...
  // For repository-management service, add service name to path only if not already present
  let endpoint = fullApiPath;
  if (serviceKey === 'repository-management') {
    // Check if repository-management-service is already in the path
    const parts = endpoint.split('/');
    if (parts[1] === 'api' && parts[2] === 'v1' && parts[3] !== 'repository-management-service') {
      // Only insert if not already present
      parts.splice(3, 0, 'repository-management-service');
      endpoint = parts.join('/');
    }
  }

    // Get service instance
    const service = serviceManager.getService(serviceKey);
    if (!service) {
      return res.status(503).json({
        error: 'Service unavailable',
        message: `Service ${serviceKey} is not available`
      });
    }

  // Build target URL
  const targetUrl = `${service.defaults.baseURL}${endpoint}`;
  logger.info(`🎯 Target URL: ${targetUrl}`);

  try {
    // Prepare headers
    const headers: Record<string, string> = {
      'User-Agent': 'API-Gateway/1.0.0'
    };

    // Forward critical headers
    if (req.headers['authorization']) {
      headers['Authorization'] = req.headers['authorization'] as string;
    }
    if (req.headers['content-length']) {
      headers['Content-Length'] = req.headers['content-length'] as string;
    }
    if (req.headers['content-type']) {
      headers['Content-Type'] = req.headers['content-type'] as string;
    }

    // Forward identity headers injected by middleware (if any)
    if (req.headers['x-user-token']) headers['X-User-Token'] = req.headers['x-user-token'] as string;
    if (req.headers['x-user-id']) headers['X-User-Id'] = req.headers['x-user-id'] as string;
    if (req.headers['x-user-roles']) headers['X-User-Roles'] = req.headers['x-user-roles'] as string;
    if (req.headers['x-username']) headers['X-Username'] = req.headers['x-username'] as string;
    if (req.headers['x-user-email']) headers['X-User-Email'] = req.headers['x-user-email'] as string;

    // Inject identity headers for repository-management-service by validating token with UMS
    if (serviceKey === 'repository-management' && req.headers['authorization']) {
      try {
        const ums = serviceManager.getService('user-management');
        const validateResp = await ums.get('/api/v1/user-management-service/auth/validate', {
          headers: { Authorization: req.headers['authorization'] as string },
          validateStatus: () => true
        });
        if (validateResp.status === 200) {
          const bearer = (req.headers['authorization'] as string) || '';
          const token = bearer.startsWith('Bearer ') ? bearer.substring(7) : bearer;
          try {
            const parts = token.split('.');
            if (parts.length === 3) {
              const payloadStr = Buffer.from(parts[1], 'base64url').toString('utf8');
              const claims = JSON.parse(payloadStr);
              if (!headers['X-User-Token']) headers['X-User-Token'] = token;
              if (claims.userId && !headers['X-User-Id']) headers['X-User-Id'] = String(claims.userId);
              if (claims.sub && !headers['X-Username']) headers['X-Username'] = String(claims.sub);
              if (claims.email && !headers['X-User-Email']) headers['X-User-Email'] = String(claims.email);
              if (Array.isArray(claims.roles) && !headers['X-User-Roles']) headers['X-User-Roles'] = claims.roles.join(',');
            }
          } catch (e) {
            logger.warn('⚠️ Failed to decode JWT payload for identity injection');
          }
        } else {
          logger.info(`🔒 UMS validate failed: ${validateResp.status}`);
        }
      } catch (e) {
        logger.warn('⚠️ Token validation via UMS failed, proceeding without identity injection');
      }

      // Fallback: still try to decode and inject identity from JWT without validate (dev resilience)
      if (!headers['X-User-Id']) {
        try {
          const bearer = (req.headers['authorization'] as string) || '';
          const token = bearer.startsWith('Bearer ') ? bearer.substring(7) : bearer;
          const parts = token.split('.');
          if (parts.length === 3) {
            const payloadStr = Buffer.from(parts[1], 'base64url').toString('utf8');
            const claims = JSON.parse(payloadStr);
            if (!headers['X-User-Token']) headers['X-User-Token'] = token;
            if (claims.userId && !headers['X-User-Id']) headers['X-User-Id'] = String(claims.userId);
            if (claims.sub && !headers['X-Username']) headers['X-Username'] = String(claims.sub);
            if (claims.email && !headers['X-User-Email']) headers['X-User-Email'] = String(claims.email);
            if (Array.isArray(claims.roles) && !headers['X-User-Roles']) headers['X-User-Roles'] = claims.roles.join(',');
          }
        } catch {}
      }
    }

    // Forward correlation headers
    if (req.headers['x-correlation-id']) {
      headers['X-Correlation-Id'] = req.headers['x-correlation-id'] as string;
    }
    if (req.headers['x-actor']) {
      headers['X-Actor'] = req.headers['x-actor'] as string;
    }

    // Sanitize query params: remove internal "path" and trim string values
    const rawQuery = { ...req.query } as Record<string, any>;
    delete (rawQuery as any).path;

    const sanitizedParams: Record<string, any> = {};
    Object.keys(rawQuery).forEach((key) => {
      const value = rawQuery[key];
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

    // Handle raw body for multipart and JSON requests
    let requestData: any;
    
    // Debug logging for request body processing
    logger.debug('🔍 [DEBUG] Request body processing:', {
      bodyType: typeof req.body,
      bodyStringified: req.body ? JSON.stringify(req.body) : 'null',
      contentType: headers['Content-Type']
    });
    
    // Ensure we don't send a body for GET/DELETE; let axios handle JSON for others
    const methodUpper = method.toUpperCase();
    if (methodUpper === 'GET' || methodUpper === 'DELETE') {
      // Do not send body or content headers for GET/DELETE
      requestData = undefined;
      if ('Content-Type' in headers) delete headers['Content-Type'];
      if ('Content-Length' in headers) delete headers['Content-Length'];
    } else {
      // For POST/PUT/PATCH, forward the parsed body
      requestData = req.body;
    }

    // Make request to microservice
    const requestConfig: any = {
      method: method as any,
      url: endpoint,
      data: requestData,
      headers,
      params: sanitizedParams,
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      validateStatus: () => true // Don't throw on non-2xx status codes
    };

    // For multipart requests, prevent axios from serializing the body
    if (headers['Content-Type'] && headers['Content-Type'].includes('multipart/form-data')) {
      requestConfig.transformRequest = [(data: any) => data];
    }

    const response = await service.request(requestConfig);

    // Ensure CORS headers on proxied response (override any upstream wildcard)
    res.setHeader('Access-Control-Allow-Origin', req.headers['origin'] || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-User-Token, X-User-Id, X-User-Roles, X-Username, X-User-Email, X-Correlation-Id, X-Actor');

    // Handle preflight request
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    logger.info(`✅ Proxy response: ${response.status}`);
      // Send through raw response body to support both JSON and text
      return res.status(response.status).send(response.data as any);

  } catch (error: any) {
    logger.error('❌ Proxy error:', error);
    
    // CORS headers are handled centrally in middleware
    
    return res.status(503).json({
      error: 'Service unavailable',
      message: `Service ${serviceKey} is not available`
    });
  }
}

export default withCors(handler);