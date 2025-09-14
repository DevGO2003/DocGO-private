import { NextRequest, NextResponse } from 'next/server'
import { authService } from './lib/services/authService'
import serviceManager from './lib/services'
import { createErrorResponse, generateRequestId, AuthenticationError, AuthorizationError } from './lib/utils/errorHandler'

// Rate limiting configuration
const windowMs = 60_000
const max = 60
const store = new Map<string, { count: number; resetAt: number }>()

// Public routes that don't require authentication
const publicRoutes = [
  '/api/auth/login',
  '/api/auth/refresh',
  '/api/health',
  '/api/docs',
  '/api/swagger.json'
]

// Admin routes that require admin role
const adminRoutes = [
  '/api/admin',
  '/api/users',
  '/api/system'
]

// Service health status cache
const serviceHealthCache = new Map<string, { status: boolean; lastCheck: number }>()
const HEALTH_CHECK_INTERVAL = 30000 // 30 seconds

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname
  
  // Skip middleware for non-API routes
  if (!pathname.startsWith('/api/')) return NextResponse.next()
  
  try {
    // 1. Rate limiting
    const rateLimitResult = await handleRateLimit(req)
    if (rateLimitResult) return rateLimitResult
    
    // 2. CORS handling
    const corsResult = await handleCORS(req)
    if (corsResult) return corsResult
    
    // 3. Authentication check
    const authResult = await handleAuthentication(req)
    if (authResult) return authResult
    
    // 4. Authorization check
    const authzResult = await handleAuthorization(req)
    if (authzResult) return authzResult
    
    // 5. Service health check
    const healthResult = await handleServiceHealth(req)
    if (healthResult) return healthResult
    
    return NextResponse.next()
    
  } catch (error) {
    console.error('[Middleware] Error:', error)
    return createErrorResponse(error as Error, req)
  }
}

async function handleRateLimit(req: NextRequest): Promise<NextResponse | null> {
  const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown'
  const now = Date.now()
  const rec = store.get(ip)
  
  if (!rec || rec.resetAt < now) {
    store.set(ip, { count: 1, resetAt: now + windowMs })
    return null
  }
  
  if (rec.count >= max) {
    const body = JSON.stringify({
      apiVersion: 'v1',
      statusCode: 429,
      shortMessage: 'Too Many Requests',
      description: 'Rate limit exceeded',
      data: null,
      timestamp: new Date().toISOString(),
      requestId: generateRequestId(),
      path: req.nextUrl.pathname
    })
    return new NextResponse(body, {
      status: 200,
      headers: { 'content-type': 'application/json' }
    })
  }
  
  rec.count += 1
  return null
}

async function handleCORS(req: NextRequest): Promise<NextResponse | null> {
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Max-Age': '86400',
      },
    })
  }
  
  return null
}

async function handleAuthentication(req: NextRequest): Promise<NextResponse | null> {
  const pathname = req.nextUrl.pathname
  
  // Skip authentication for public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return null
  }
  
  // Get authorization header
  const authHeader = req.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const requestId = generateRequestId()
    throw new AuthenticationError(
      'Missing or invalid authorization header',
      requestId,
      pathname
    )
  }
  
  const token = authHeader.substring(7)
  
  try {
    // Validate token with auth service
    const isValid = await authService.validateToken(token)
    if (!isValid) {
      const requestId = generateRequestId()
      throw new AuthenticationError(
        'Invalid or expired token',
        requestId,
        pathname
      )
    }
    
    // Add user info to headers for downstream services
    const requestHeaders = new Headers(req.headers)
    requestHeaders.set('x-user-token', token)
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
    
  } catch (error) {
    const requestId = generateRequestId()
    throw new AuthenticationError(
      'Token validation failed',
      requestId,
      pathname,
      error
    )
  }
}

async function handleAuthorization(req: NextRequest): Promise<NextResponse | null> {
  const pathname = req.nextUrl.pathname
  
  // Skip authorization for non-admin routes
  if (!adminRoutes.some(route => pathname.startsWith(route))) {
    return null
  }
  
  // Get user token from headers
  const token = req.headers.get('x-user-token')
  if (!token) {
    const requestId = generateRequestId()
    throw new AuthorizationError(
      'User token not found',
      requestId,
      pathname
    )
  }
  
  try {
    // TODO: Implement role-based authorization
    // For now, we'll assume all authenticated users have access
    // In a real implementation, you would:
    // 1. Decode the JWT token
    // 2. Extract user roles
    // 3. Check if user has required permissions
    
    return null
    
  } catch (error) {
    const requestId = generateRequestId()
    throw new AuthorizationError(
      'Authorization check failed',
      requestId,
      pathname,
      error
    )
  }
}

async function handleServiceHealth(req: NextRequest): Promise<NextResponse | null> {
  const pathname = req.nextUrl.pathname
  
  // Check service health for specific routes
  if (pathname.startsWith('/api/contracts') || pathname.startsWith('/api/ai') || pathname.startsWith('/api/files')) {
    const serviceName = getServiceNameFromPath(pathname)
    const isHealthy = await checkServiceHealth(serviceName)
    
    if (!isHealthy) {
      const requestId = generateRequestId()
      return createErrorResponse(
        new Error(`Service ${serviceName} is unavailable`),
        req,
        503
      )
    }
  }
  
  return null
}

function getServiceNameFromPath(pathname: string): string {
  if (pathname.startsWith('/api/contracts')) return 'contract'
  if (pathname.startsWith('/api/ai')) return 'ai'
  if (pathname.startsWith('/api/files')) return 'file'
  return 'unknown'
}

async function checkServiceHealth(serviceName: string): Promise<boolean> {
  const now = Date.now()
  const cached = serviceHealthCache.get(serviceName)
  
  // Return cached result if it's still fresh
  if (cached && (now - cached.lastCheck) < HEALTH_CHECK_INTERVAL) {
    return cached.status
  }
  
  try {
    let isHealthy = false
    
    switch (serviceName) {
      case 'contract':
        isHealthy = await serviceManager.checkServiceHealth('contract-management-service')
        break
      case 'ai':
        isHealthy = await serviceManager.checkServiceHealth('ai-processing-service')
        break
      case 'file':
        isHealthy = await serviceManager.checkServiceHealth('file-storage-asset-service')
        break
      default:
        isHealthy = true
    }
    
    // Cache the result
    serviceHealthCache.set(serviceName, {
      status: isHealthy,
      lastCheck: now
    })
    
    return isHealthy
    
  } catch (error) {
    console.error(`[Middleware] Health check failed for ${serviceName}:`, error)
    
    // Cache negative result
    serviceHealthCache.set(serviceName, {
      status: false,
      lastCheck: now
    })
    
    return false
  }
}

export const config = {
  matcher: ['/api/:path*'],
}


