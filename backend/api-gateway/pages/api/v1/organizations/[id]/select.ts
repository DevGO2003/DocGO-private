import { NextApiRequest, NextApiResponse } from 'next'
import { Config } from '../../../../../lib/config'
import { generateRequestId } from '../../../../../lib/utils/errorHandler'

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
  const { id } = req.query

  try {
    if (req.method === 'POST') {
      // POST /api/v1/organizations/{id}/select - Select organization
      
      // Mock organization data based on ID
      const mockOrganizations: { [key: string]: any } = {
        'org1': {
          id: 'org1',
          name: 'Công ty ABC',
          description: 'Công ty công nghệ hàng đầu Việt Nam',
          ownerUserId: 'user1',
          status: 'ACTIVE',
          memberCount: 25,
          userRole: 'owner',
          userRoleLevel: 0,
          userPermissions: ['ADMIN_ALL', 'MANAGE_ORGANIZATION', 'MANAGE_MEMBERS', 'MANAGE_CHAT'],
          isOwner: true,
          isAdmin: true,
          joinedAt: '2024-01-15T08:00:00Z',
          createdAt: '2024-01-15T08:00:00Z',
          updatedAt: '2024-01-15T08:00:00Z',
          stats: {
            totalMembers: 25,
            totalChatGroups: 3,
            totalChatChannels: 8,
            unreadMessages: 5,
            recentActivity: 12
          }
        },
        'org2': {
          id: 'org2',
          name: 'Tập đoàn XYZ',
          description: 'Tập đoàn đa ngành với nhiều lĩnh vực hoạt động',
          ownerUserId: 'user2',
          status: 'ACTIVE',
          memberCount: 150,
          userRole: 'admin',
          userRoleLevel: 1,
          userPermissions: ['MANAGE_MEMBERS', 'MANAGE_CHAT', 'VIEW_ORGANIZATION_STATS'],
          isOwner: false,
          isAdmin: true,
          joinedAt: '2024-02-20T10:30:00Z',
          createdAt: '2024-02-20T10:30:00Z',
          updatedAt: '2024-02-20T10:30:00Z',
          stats: {
            totalMembers: 150,
            totalChatGroups: 5,
            totalChatChannels: 15,
            unreadMessages: 2,
            recentActivity: 28
          }
        },
        'org3': {
          id: 'org3',
          name: 'Startup Tech',
          description: 'Công ty khởi nghiệp công nghệ',
          ownerUserId: 'user3',
          status: 'ACTIVE',
          memberCount: 8,
          userRole: 'member',
          userRoleLevel: 3,
          userPermissions: ['SEND_MESSAGES', 'UPLOAD_FILES', 'VIEW_MEMBERS'],
          isOwner: false,
          isAdmin: false,
          joinedAt: '2024-03-10T14:15:00Z',
          createdAt: '2024-03-10T14:15:00Z',
          updatedAt: '2024-03-10T14:15:00Z',
          stats: {
            totalMembers: 8,
            totalChatGroups: 1,
            totalChatChannels: 3,
            unreadMessages: 0,
            recentActivity: 5
          }
        }
      }

      const organization = mockOrganizations[id as string]

      if (!organization) {
        return res.status(404).json({
          apiVersion: 'v1',
          statusCode: 404,
          shortMessage: 'Not Found',
          description: 'Organization not found',
          data: null,
          timestamp: new Date().toISOString(),
          requestId,
          path: req.url || `/api/v1/organizations/${id}/select`
        })
      }

      return res.status(200).json({
        apiVersion: 'v1',
        statusCode: 200,
        shortMessage: 'Success',
        description: 'Organization selected successfully',
        data: organization,
        timestamp: new Date().toISOString(),
        requestId,
        path: req.url || `/api/v1/organizations/${id}/select`
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
      path: req.url || `/api/v1/organizations/${id}/select`
    })

  } catch (error: any) {
    console.error('[Organization Select API] Error:', error)
    
    return res.status(500).json({
      apiVersion: 'v1',
      statusCode: 500,
      shortMessage: 'Internal Server Error',
      description: error.message || 'An unexpected error occurred',
      data: null,
      timestamp: new Date().toISOString(),
      requestId,
      path: req.url || `/api/v1/organizations/${id}/select`
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
