import { NextRequest, NextResponse } from 'next/server'

const windowMs = 60_000
const max = 60
const store = new Map<string, { count: number; resetAt: number }>()

export async function middleware(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith('/api/')) return NextResponse.next()
  const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown'
  const now = Date.now()
  const rec = store.get(ip)
  if (!rec || rec.resetAt < now) {
    store.set(ip, { count: 1, resetAt: now + windowMs })
    return NextResponse.next()
  }
  if (rec.count >= max) {
    const body = JSON.stringify({ apiVersion: 'v1', statusCode: 429, shortMessage: 'Too Many Requests', description: 'Rate limit exceeded', data: null, timestamp: new Date().toISOString(), requestId: crypto.randomUUID(), path: req.nextUrl.pathname })
    return new NextResponse(body, { status: 200, headers: { 'content-type': 'application/json' } })
  }
  rec.count += 1
  return NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*'],
}


