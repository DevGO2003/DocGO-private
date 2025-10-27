import { NextApiRequest, NextApiResponse } from 'next';
import serviceManager from '../../../../../lib/services';
import { withCors } from '../../../../../lib/cors';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('[User-Management] Register request received:', req.body);
    
    // Forward to user-management service with full path
    const data = await serviceManager.proxyRequest(
      'user-management',
      'POST',
      '/api/v1/user-management-service/auth/register',
      req.body,
      req.headers
    );

    console.log('[User-Management] Register success');
    return res.status(200).json(data);
  } catch (error: any) {
    console.error('[User-Management] Register error:', error);
    
    return res.status(error.response?.status || 500).json({
      apiVersion: 'v1',
      statusCode: error.response?.status || 500,
      shortMessage: 'Error',
      description: error.response?.data?.description || error.message || 'Internal server error',
      data: null,
      timestamp: new Date().toISOString(),
      requestId: Math.random().toString(36).slice(2),
      path: '/api/v1/user-management-service/auth/register'
    });
  }
}

export default withCors(handler);
