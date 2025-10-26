import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { Config } from '../../../../../lib/config';
import { withCors } from '../../../../../lib/cors';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const requestId = Math.random().toString(36).slice(2);
  const timestamp = new Date().toISOString();
  const path = '/api/v1/user-management-service/auth/login';

  // Method validation
  if (req.method !== 'POST') {
    console.log(`[${requestId}] Method not allowed: ${req.method}`);
    return res.status(405).json({
      apiVersion: 'v1',
      statusCode: 405,
      shortMessage: 'Method Not Allowed',
      description: 'Chỉ hỗ trợ phương thức POST',
      data: null,
      timestamp,
      requestId,
      path
    });
  }

  try {
    console.log(`[${requestId}] Login request received:`, {
      username: req.body?.username ? '***' : 'missing',
      password: req.body?.password ? '***' : 'missing',
      bodyKeys: Object.keys(req.body || {})
    });
    
    // Validate request body
    if (!req.body || !req.body.username || !req.body.password) {
      console.log(`[${requestId}] Missing username or password`);
      return res.status(400).json({
        apiVersion: 'v1',
        statusCode: 400,
        shortMessage: 'Bad Request',
        description: 'Thiếu username hoặc password',
        data: null,
        timestamp,
        requestId,
        path
      });
    }
    
    // Get User Management Service URL from config
    const userMgmtUrl = Config.getUserManagementServiceUrl();
    const loginUrl = `${userMgmtUrl}/api/v1/user-management-service/auth/login`;
    
    console.log(`[${requestId}] Forwarding to: ${loginUrl}`);
    
    // Forward to user-management service
    const response = await axios.post(loginUrl, req.body, {
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': requestId
      },
      timeout: 10000
    });

    console.log(`[${requestId}] Login success - Status: ${response.status}`);
    return res.status(response.status).json(response.data);
  } catch (error: any) {
    console.error(`[${requestId}] Login error:`, {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    
    // Determine error status and message
    const statusCode = error.response?.status || 500;
    let shortMessage = 'Error';
    let description = 'Internal server error';
    
    if (error.response?.data) {
      shortMessage = error.response.data.shortMessage || 'Error';
      description = error.response.data.description || error.message;
    } else if (error.code === 'ECONNREFUSED') {
      shortMessage = 'Service Unavailable';
      description = 'Không thể kết nối đến User Management Service';
    } else if (error.code === 'ETIMEDOUT') {
      shortMessage = 'Request Timeout';
      description = 'Yêu cầu đăng nhập quá thời gian';
    } else {
      description = error.message || 'Internal server error';
    }
    
    return res.status(statusCode).json({
      apiVersion: 'v1',
      statusCode,
      shortMessage,
      description,
      data: null,
      timestamp,
      requestId,
      path
    });
  }
}

export default withCors(handler);
