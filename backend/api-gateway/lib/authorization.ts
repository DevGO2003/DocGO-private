import { NextRequest, NextResponse } from 'next/server';
import { authService } from '../lib/authService';

interface RoutePermission {
  path: string;
  methods: string[];
  requiredRoles?: string[];
  requiredPermissions?: string[];
}

// Define route permissions
const ROUTE_PERMISSIONS: RoutePermission[] = [
  {
    path: '/api/admin',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    requiredRoles: ['ADMIN']
  },
  {
    path: '/api/users',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    requiredRoles: ['ADMIN', 'USER_MANAGER']
  },
  {
    path: '/api/repositories',
    methods: ['POST', 'PUT', 'DELETE'],
    requiredPermissions: ['REPOSITORY_WRITE']
  },
  {
    path: '/api/repositories',
    methods: ['GET'],
    requiredPermissions: ['REPOSITORY_READ']
  }
];

export async function handleAuthorization(req: NextRequest): Promise<NextResponse | null> {
  const pathname = req.nextUrl.pathname;
  const method = req.method;

  // Find matching route permission
  const routePermission = ROUTE_PERMISSIONS.find(route => 
    pathname.startsWith(route.path) && 
    route.methods.includes(method)
  );

  if (!routePermission) {
    return null; // No specific permission required
  }

  const token = req.headers.get('x-user-token');
  if (!token) {
    return NextResponse.json(
      { 
        statusCode: 401,
        shortMessage: 'Unauthorized',
        description: 'User token not found',
        timestamp: new Date().toISOString()
      },
      { status: 401 }
    );
  }

  try {
    // Check role-based authorization
    if (routePermission.requiredRoles) {
      const userRoles = req.headers.get('x-user-roles')?.split(',') || [];
      const hasRequiredRole = routePermission.requiredRoles.some(role => 
        userRoles.includes(role)
      );

      if (!hasRequiredRole) {
        return NextResponse.json(
          { 
            statusCode: 403,
            shortMessage: 'Forbidden',
            description: `Required roles: ${routePermission.requiredRoles.join(', ')}`,
            timestamp: new Date().toISOString()
          },
          { status: 403 }
        );
      }
    }

    // Check permission-based authorization
    if (routePermission.requiredPermissions) {
      for (const permission of routePermission.requiredPermissions) {
        const hasPermission = await authService.checkPermission(token, pathname, permission);
        if (!hasPermission) {
          return NextResponse.json(
            { 
              statusCode: 403,
              shortMessage: 'Forbidden',
              description: `Required permission: ${permission}`,
              timestamp: new Date().toISOString()
            },
            { status: 403 }
          );
        }
      }
    }

    return null; // Authorization passed
  } catch (error) {
    console.error('[Authorization] Error:', error);
    return NextResponse.json(
      { 
        statusCode: 500,
        shortMessage: 'Internal Server Error',
        description: 'Authorization check failed',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}


