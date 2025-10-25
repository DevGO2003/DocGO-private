import { NextApiRequest, NextApiResponse } from 'next'
import { Config } from '../../../../lib/config'
import { generateRequestId } from '../../../../lib/utils/errorHandler'

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
    if (req.method === 'POST') {
      // Mock create organization response
      const mockOrganization = {
        id: `org-${Date.now()}`,
        name: req.body.name || 'Test Organization',
        description: req.body.description || 'Test organization description',
        ownerUserId: req.body.ownerUserId || 'test-user-123',
        status: 'ACTIVE',
        memberCount: 1,
        userRole: 'owner',
        userRoleLevel: 0,
        userPermissions: ['ADMIN_ALL', 'MANAGE_ORGANIZATION', 'MANAGE_MEMBERS'],
        isOwner: true,
        isAdmin: true,
        joinedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      return res.status(201).json({
        apiVersion: 'v1',
        statusCode: 201,
        shortMessage: 'Created',
        description: 'Organization created successfully',
        data: mockOrganization,
        timestamp: new Date().toISOString(),
        requestId,
        path: req.url || '/api/v1/organizations'
      })
    }

    if (req.method === 'PUT') {
      // Mock update organization response
      const mockOrganization = {
        id: req.query.id || 'test-org-123',
        name: req.body.name || 'Updated Organization',
        description: req.body.description || 'Updated description',
        ownerUserId: 'test-user-123',
        status: 'ACTIVE',
        memberCount: 1,
        userRole: 'owner',
        userRoleLevel: 0,
        userPermissions: ['ADMIN_ALL', 'MANAGE_ORGANIZATION', 'MANAGE_MEMBERS'],
        isOwner: true,
        isAdmin: true,
        joinedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      return res.status(200).json({
        apiVersion: 'v1',
        statusCode: 200,
        shortMessage: 'Success',
        description: 'Organization updated successfully',
        data: mockOrganization,
        timestamp: new Date().toISOString(),
        requestId,
        path: req.url || '/api/v1/organizations'
      })
    }

    if (req.method === 'DELETE') {
      // Mock delete organization response
      return res.status(200).json({
        apiVersion: 'v1',
        statusCode: 200,
        shortMessage: 'Success',
        description: 'Organization deleted successfully',
        data: null,
        timestamp: new Date().toISOString(),
        requestId,
        path: req.url || '/api/v1/organizations'
      })
    }

    // Method not allowed
    return res.status(405).json({
      apiVersion: 'v1',
      statusCode: 405,
      shortMessage: 'Method Not Allowed',
      description: `Method ${req.method} is not allowed`,
      data: null,
      timestamp: new Date().toISOString(),
      requestId,
      path: req.url || '/api/v1/organizations'
    })

  } catch (error: any) {
    console.error('[Organization Mock API] Error:', error)
    
    return res.status(500).json({
      apiVersion: 'v1',
      statusCode: 500,
      shortMessage: 'Internal Server Error',
      description: error.message || 'An unexpected error occurred',
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


