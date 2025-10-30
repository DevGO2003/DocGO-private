import { NextResponse } from 'next/server'

export async function GET() {
  const res = NextResponse.json({
    apiVersion: 'v1',
    statusCode: 200,
    shortMessage: 'Success',
    description: 'Auth cookie has been set',
    data: { ok: true }
  })

  res.cookies.set('auth_token', 'demo-token', {
    httpOnly: true,
    path: '/',
    sameSite: 'lax'
  })

  return res
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({} as any)) as any
    const accessToken = body?.accessToken || 'demo-token'
    const refreshToken = body?.refreshToken
    const rememberMe = Boolean(body?.rememberMe)
    const expiresIn = typeof body?.expiresIn === 'number' ? body.expiresIn : 900

    const res = NextResponse.json({
      apiVersion: 'v1',
      statusCode: 200,
      shortMessage: 'Success',
      description: 'Auth cookies have been set',
      data: { ok: true }
    })

    // Access token cookie
    res.cookies.set('auth_token', accessToken, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      maxAge: rememberMe ? 7 * 24 * 60 * 60 : expiresIn
    })

    // Refresh token cookie (optional)
    if (refreshToken) {
      res.cookies.set('refresh_token', refreshToken, {
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60
      })
    }

    return res
  } catch (e) {
    return NextResponse.json({
      apiVersion: 'v1',
      statusCode: 500,
      shortMessage: 'Error',
      description: 'Failed to set cookies'
    }, { status: 200 })
  }
}


