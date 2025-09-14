import { NextApiRequest, NextApiResponse } from 'next'
import { authService, LoginRequest } from '../../../lib/services/authService'
import { createErrorResponse, generateRequestId, ValidationError } from '../../../lib/utils/errorHandler'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      apiVersion: 'v1',
      statusCode: 405,
      shortMessage: 'Method Not Allowed',
      description: 'Only POST method is allowed',
      data: null,
      timestamp: new Date().toISOString(),
      requestId: generateRequestId(),
      path: req.url || '/api/auth/login'
    })
  }

  try {
    // Validate request body
    const { username, password } = req.body

    if (!username || !password) {
      const requestId = generateRequestId()
      throw new ValidationError(
        'Username and password are required',
        requestId,
        '/api/auth/login'
      )
    }

    // Create login request
    const loginRequest: LoginRequest = {
      username,
      password
    }

    // Call auth service
    const result = await authService.login(loginRequest)

    // Return success response
    return res.status(200).json(result)

  } catch (error: any) {
    console.error('[Auth Login] Error:', error)
    
    if (error.name === 'ValidationError') {
      return res.status(200).json(createErrorResponse(error, req as any))
    }

    // Handle service errors
    const requestId = generateRequestId()
    const errorResponse = createErrorResponse(
      new Error(error.message || 'Login failed'),
      req as any,
      500
    )

    return res.status(200).json(errorResponse)
  }
}

// Disable body parsing for this route
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
}
