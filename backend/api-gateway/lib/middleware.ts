import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import logger from './logger';
import kafkaService from './kafka';

// Rate limiting store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limiting middleware
export function rateLimitMiddleware(request: NextRequest): NextResponse | null {
  const ip = request.ip || 'unknown';
  const now = Date.now();
  const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'); // 15 minutes
  const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100');

  const current = rateLimitStore.get(ip);
  
  if (current && now < current.resetTime) {
    if (current.count >= maxRequests) {
      logger.warn(`🚫 Rate limit exceeded for IP: ${ip}`);
      return NextResponse.json(
        { error: 'Rate limit exceeded', retryAfter: Math.ceil((current.resetTime - now) / 1000) },
        { status: 429, headers: { 'Retry-After': Math.ceil((current.resetTime - now) / 1000).toString() } }
      );
    }
    current.count++;
  } else {
    rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
  }

  return null;
}

// Authentication middleware
export function authMiddleware(request: NextRequest): NextResponse | null {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader) {
    logger.warn('🚫 No authorization header provided');
    return NextResponse.json(
      { error: 'Authorization header required' },
      { status: 401 }
    );
  }

  try {
    const token = authHeader.replace('Bearer ', '');
    const decoded = verify(token, process.env.JWT_SECRET || 'fallback-secret');
    
    // Add user info to request headers for downstream services
    request.headers.set('x-user-id', (decoded as any).userId || (decoded as any).id);
    request.headers.set('x-user-role', (decoded as any).roles || (decoded as any).role);
    request.headers.set('x-username', (decoded as any).sub);
    
    logger.info(`🔐 User authenticated: ${(decoded as any).userId || (decoded as any).id}`);
    return null;
  } catch (error) {
    logger.warn('🚫 Invalid token provided');
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    );
  }
}

// Authorization middleware
export function authzMiddleware(request: NextRequest): NextResponse | null {
  const pathname = request.nextUrl.pathname;
  const userRole = request.headers.get('x-user-role');
  
  // Parse roles (can be array or single string)
  let roles: string[] = [];
  try {
    const roleData = userRole ? JSON.parse(userRole) : [];
    roles = Array.isArray(roleData) ? roleData : [roleData];
  } catch {
    roles = userRole ? [userRole] : [];
  }
  
  logger.info(`🔒 Authorization check: path=${pathname}, roles=${JSON.stringify(roles)}`);
  
  // Check if user has permission for this endpoint
  const hasPermission = roles.some(role => {
    switch (role) {
      case 'admin':
        return true; // Admin has access to everything
      case 'user':
      case 'employee':
        return pathname.includes('/repositories/my') || pathname.includes('/repositories/public');
      case 'viewer':
        return pathname.includes('/repositories/public');
      default:
        return false;
    }
  });
  
  if (!hasPermission) {
    logger.warn(`🚫 Access denied: path=${pathname}, roles=${JSON.stringify(roles)}`);
    return NextResponse.json(
      { error: 'Access denied' },
      { status: 403 }
    );
  }
  
  return null;
}

// Logging middleware
export function loggingMiddleware(request: NextRequest): void {
  const startTime = Date.now();
  
  logger.info(`📥 ${request.method} ${request.url}`, {
    method: request.method,
    url: request.url,
    userAgent: request.headers.get('user-agent'),
    ip: request.ip,
    timestamp: new Date().toISOString()
  });

  // Add response logging
  request.headers.set('x-start-time', startTime.toString());
}

// CORS middleware
export function corsMiddleware(request: NextRequest): NextResponse | null {
  if (request.method === 'OPTIONS') {
    // Get allowed origins from environment
    const corsOrigins = process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:8000';
    const allowedOrigins = corsOrigins.split(',').map(origin => origin.trim());
    
    // Get request origin
    const requestOrigin = request.headers.get('origin');
    
    // Check if request origin is allowed
    const allowedOrigin = allowedOrigins.includes(requestOrigin || '') ? requestOrigin : allowedOrigins[0];
    
    logger.info(`🌐 CORS Preflight: Origin=${requestOrigin}, Allowed=${allowedOrigin}`);
    
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': allowedOrigin || '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, X-Correlation-Id, X-Actor',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400'
      }
    });
  }

  return null;
}

// Error handling middleware
export function errorHandler(error: Error, request: NextRequest): NextResponse {
  logger.error('❌ Unhandled error:', {
    error: error.message,
    stack: error.stack,
    url: request.url,
    method: request.method,
    timestamp: new Date().toISOString()
  });

  // Publish error event to Kafka
  kafkaService.publishEvent('gateway-events', {
    type: 'GATEWAY_ERROR',
    payload: {
      error: error.message,
      url: request.url,
      method: request.method,
      timestamp: new Date().toISOString()
    },
    timestamp: new Date().toISOString(),
    requestId: request.headers.get('x-request-id') || 'unknown'
  });

  return NextResponse.json(
    { 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    },
    { status: 500 }
  );
}

// Request ID middleware
export function requestIdMiddleware(request: NextRequest): void {
  const requestId = request.headers.get('x-request-id') || generateRequestId();
  request.headers.set('x-request-id', requestId);
}

// Health check middleware
export function healthCheckMiddleware(request: NextRequest): NextResponse | null {
  if (request.nextUrl.pathname === '/health') {
    return NextResponse.json({
      apiVersion: 'v1',
      statusCode: 200,
      shortMessage: 'Success',
      description: 'Service đang hoạt động bình thường',
      data: {
        status: 'healthy',
        service: 'API Gateway BFF',
        version: '1.0.0',
        kafka: kafkaService.isKafkaConnected(),
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString(),
      requestId: generateRequestId(),
      path: '/health'
    });
  }
  return null;
}

// Utility function to generate request ID
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Combined middleware function
export function applyMiddleware(request: NextRequest): NextResponse | null {
  try {
    // Apply middleware in order
    requestIdMiddleware(request);
    loggingMiddleware(request);
    
    // Check for health endpoint
    const healthResponse = healthCheckMiddleware(request);
    if (healthResponse) return healthResponse;
    
    // Handle CORS preflight
    const corsResponse = corsMiddleware(request);
    if (corsResponse) return corsResponse;
    
    // Apply rate limiting
    const rateLimitResponse = rateLimitMiddleware(request);
    if (rateLimitResponse) return rateLimitResponse;
    
    // Apply authentication for protected routes
    if (isProtectedRoute(request.nextUrl.pathname)) {
      const authResponse = authMiddleware(request);
      if (authResponse) return authResponse;
      
      // Apply authorization after authentication
      const authzResponse = authzMiddleware(request);
      if (authzResponse) return authzResponse;
    }
    
    return null;
  } catch (error) {
    return errorHandler(error as Error, request);
  }
}

// Check if route requires authentication
function isProtectedRoute(pathname: string): boolean {
  const publicRoutes = [
    '/api/v1/health',
    '/api/v1/auth/login',
    '/api/v1/auth/register',
    '/api/v1/auth/refresh',
    '/api/v1/repository-management-service/repositories/public'
  ];
  
  // If it's a public route, don't require authentication
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return false;
  }
  
  // All other API routes require authentication
  return pathname.startsWith('/api/v1/');
}
