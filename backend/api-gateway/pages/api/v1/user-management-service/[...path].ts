import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { Config } from '../../../../lib/config';
import { withCors } from '../../../../lib/cors';

export const config = {
  api: {
    bodyParser: true,
  },
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const requestId = Math.random().toString(36).slice(2);
  
  try {
    // Get the path after /api/v1/user-management-service/
    const { path } = req.query;
    const pathStr = Array.isArray(path) ? path.join('/') : path || '';
    
    console.log(`[${requestId}] [User-Management Proxy] Request:`, {
      method: req.method,
      path: pathStr,
      hasBody: !!req.body
    });

    // Get User Management Service URL from config
    const userMgmtUrl = Config.getUserManagementServiceUrl();
    const targetUrl = `${userMgmtUrl}/api/v1/user-management-service/${pathStr}`;
    
    console.log(`[${requestId}] Forwarding to: ${targetUrl}`);

    // Forward request to user-management-service
    const response = await axios({
      method: req.method || 'GET',
      url: targetUrl,
      data: req.body,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.authorization || '',
        'X-Request-ID': requestId
      },
      timeout: 10000
    });

    console.log(`[${requestId}] [User-Management Proxy] Success - Status: ${response.status}`);

    // Return response
    return res.status(response.status).json(response.data);
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

export default withCors(handler);
