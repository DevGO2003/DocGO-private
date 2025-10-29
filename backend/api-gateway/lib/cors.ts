import { NextApiRequest, NextApiResponse } from 'next';
import { Config } from './config';

/**
 * CORS middleware for API Gateway
 * Handles CORS headers and preflight requests
 * 
 * Usage:
 * export default withCors(async (req, res) => {
 *   // Your handler code
 * });
 */
export function withCors(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const origins = Config.getCorsOrigins();
      const requestOrigin = req.headers.origin || '';
      
      // Check if request origin is in allowed origins
      const allowedOrigin = origins.includes(requestOrigin) ? requestOrigin : origins[0];
      
      // Set CORS headers
      res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-User-Token, X-User-Id, X-User-Roles, X-Username, X-User-Email, X-Correlation-Id, X-Actor');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Max-Age', '86400');
      res.setHeader('Vary', 'Origin');
      
      // Handle CORS preflight
      if (req.method === 'OPTIONS') {
        return res.status(200).end();
      }
      
      // Call the actual handler
      return await handler(req, res);
    } catch (error: any) {
      console.error('[CORS Middleware] Error:', error);
      
      // Return error response
      return res.status(error.status || 500).json({
        apiVersion: 'v1',
        statusCode: error.status || 500,
        shortMessage: error.shortMessage || 'Error',
        description: error.message || 'Internal server error',
        data: null,
        timestamp: new Date().toISOString(),
        requestId: Math.random().toString(36).slice(2),
        path: req.url
      });
    }
  };
}
