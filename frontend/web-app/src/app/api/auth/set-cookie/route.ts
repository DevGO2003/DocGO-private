import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    // Try to parse JSON body (accept even if content-type is missing in some clients)

    const body = await req.json().catch(() => ({})) as {
      accessToken?: string
      refreshToken?: string
      expiresIn?: number
      rememberMe?: boolean
      userJson?: string
    }

    const accessToken = body.accessToken || ''
    const refreshToken = body.refreshToken || ''
    const expiresIn = typeof body.expiresIn === 'number' && body.expiresIn > 0 ? body.expiresIn : 900
    const rememberMe = !!body.rememberMe

    if (!accessToken || accessToken.length < 10) {
      return NextResponse.json({
        apiVersion: 'v1',
        statusCode: 400,
        shortMessage: 'Bad Request',
        description: 'Missing or invalid accessToken',
        data: null,
        timestamp: new Date().toISOString(),
        requestId: req.headers.get('x-request-id') || '',
        path: req.nextUrl.pathname
      }, { status: 400 })
    }

    const response = NextResponse.json({
      apiVersion: 'v1',
      statusCode: 200,
      shortMessage: 'Success',
      description: 'Cookies set successfully',
      data: null,
      timestamp: new Date().toISOString(),
      requestId: req.headers.get('x-request-id') || '',
      path: req.nextUrl.pathname
    })

    // Determine cookie attributes
    const isProd = process.env.NODE_ENV === 'production'
    const sameSite: 'lax' | 'strict' | 'none' = isProd ? 'lax' : 'lax'
    const secure = isProd

    // auth_token cookie (short lived)
    response.cookies.set('auth_token', accessToken, {
      httpOnly: true,
      secure,
      sameSite,
      path: '/',
      maxAge: expiresIn
    })

    // refresh_token cookie (longer lived, optional)
    if (refreshToken && refreshToken.length > 10) {
      response.cookies.set('refresh_token', refreshToken, {
        httpOnly: true,
        secure,
        sameSite,
        path: '/',
        maxAge: rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60
      })
    }

    // Optional user snapshot cookie for quick UI (non-HttpOnly)
    if (body.userJson) {
      try {
        // Validate it is JSON
        JSON.parse(body.userJson)
        response.cookies.set('user_data', body.userJson, {
          httpOnly: false,
          secure,
          sameSite,
          path: '/',
          maxAge: rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60
        })
      } catch {
        // ignore invalid userJson
      }
    }

    return response
  } catch (error) {
    const message = (error as Error)?.message || 'Failed to set cookies'
    return NextResponse.json({
      apiVersion: 'v1',
      statusCode: 500,
      shortMessage: 'Internal Server Error',
      description: message,
      data: null,
      timestamp: new Date().toISOString(),
      requestId: req.headers.get('x-request-id') || '',
      path: req.nextUrl.pathname
    }, { status: 500 })
  }
}


