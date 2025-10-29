import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware to handle CORS for all API routes
 * This runs before route handlers
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Get allowed origins from environment
  const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:8000')
    .split(',')
    .map(origin => origin.trim());
  
  const origin = request.headers.get('origin') || '';
  const allowedOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  
  // Set CORS headers
  response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-User-Token, X-User-Id, X-User-Roles, X-Username, X-User-Email, X-Correlation-Id, X-Actor');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Max-Age', '86400');
  response.headers.set('Vary', 'Origin');
  
  // Handle preflight
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers: response.headers });
  }
  
  return response;
}

export const config = {
  matcher: '/api/:path*',
};
