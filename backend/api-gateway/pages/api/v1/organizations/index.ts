import { NextApiRequest, NextApiResponse } from 'next'
import { Config } from '../../../../lib/config'
import { generateRequestId } from '../../../../lib/utils/errorHandler'

const USER_MANAGEMENT_SERVICE_URL = process.env.USER_MANAGEMENT_SERVICE_URL || 'http://user-management-service:8001'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    const corsOrigin = Config.getCorsOrigins()[0]
    res.setHeader('Access-Control-Allow-Origin', corsOrigin)
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    res.setHeader('Access-Control-Max-Age', '86400')
    return res.status(200).end()
  }

  // Set CORS headers for all responses
  const corsOrigin = Config.getCorsOrigins()[0]
  res.setHeader('Access-Control-Allow-Origin', corsOrigin)
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
  res.setHeader('Access-Control-Allow-Credentials', 'true')

  const requestId = generateRequestId()

  try {
    // Get authorization token from request
    const authHeader = req.headers.authorization
    
    // Build query string for GET requests
    const queryParams = new URLSearchParams()
    if (req.query) {
      Object.entries(req.query).forEach(([key, value]) => {
        if (value) queryParams.append(key, String(value))
      })
    }
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ''
    
    // Forward request to user-management-service
    const backendUrl = `${USER_MANAGEMENT_SERVICE_URL}/api/v1/user-management-service/organizations${queryString}`
    
    console.log(`[Organizations Proxy] ${req.method} ${backendUrl}`)
    
    const backendResponse = await fetch(backendUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader }),
      },
      ...(req.method !== 'GET' && req.method !== 'HEAD' && { body: JSON.stringify(req.body) }),
    })

    const data = await backendResponse.json()
    
    return res.status(backendResponse.status).json(data)

  } catch (error: any) {
    console.error('[Organizations Proxy] Error:', error)
    
    return res.status(500).json({
      apiVersion: 'v1',
      statusCode: 500,
      shortMessage: 'Internal Server Error',
      description: error.message || 'Failed to connect to backend service',
      data: null,
      timestamp: new Date().toISOString(),
      requestId,
      path: req.url || '/api/v1/organizations'
    })
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
}
