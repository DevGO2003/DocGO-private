import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { handleServiceError } from './handleServiceError';

function setCorsHeaders(res: NextApiResponse, req: NextApiRequest) {
  // Get allowed origins from environment
  const corsOrigins = process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:8000';
  const allowedOrigins = corsOrigins.split(',').map(origin => origin.trim());
  
  // Get request origin
  const requestOrigin = req.headers.origin;
  
  // Check if request origin is allowed
  const allowedOrigin = allowedOrigins.includes(requestOrigin || '') ? requestOrigin : allowedOrigins[0];
  
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-Correlation-Id, X-Actor');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
}

export function withApiHandler(handler: NextApiHandler): NextApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Set CORS headers for all responses
    setCorsHeaders(res, req);
    
    try {
      await handler(req, res);
    } catch (err: any) {
      const { httpStatus, body } = handleServiceError(err, req);
      return res.status(httpStatus).json(body);
    }
  };
}



















































