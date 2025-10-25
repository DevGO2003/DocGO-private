import { NextApiRequest, NextApiResponse } from 'next';
import serviceManager from '../../../../lib/services';

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get the path after /api/v1/user-management-service/
    const { path } = req.query;
    const pathStr = Array.isArray(path) ? path.join('/') : path || '';
    
    console.log('[User-Management Proxy] Request:', {
      method: req.method,
      path: pathStr,
      body: req.body
    });

    // Forward request to user-management-service
    // serviceManager.proxyRequest(serviceKey, method, endpoint, data, headers)
    const data = await serviceManager.proxyRequest(
      'user-management',  // Key từ config
      req.method || 'GET',
      `/${pathStr}`,
      req.body,
      {
        ...req.headers,
        host: undefined,
      }
    );

    console.log('[User-Management Proxy] Success');

    // Return response
    return res.status(200).json(data);
  } catch (error: any) {
    console.error('[User-Management Proxy] Error:', error);
    
    // Return error in RestResponse format
    return res.status(error.response?.status || 500).json({
      apiVersion: 'v1',
      statusCode: error.response?.status || 500,
      shortMessage: 'Error',
      description: error.message || 'Internal server error',
      data: null,
      timestamp: new Date().toISOString(),
      requestId: Math.random().toString(36).slice(2),
      path: req.url
    });
  }
}
