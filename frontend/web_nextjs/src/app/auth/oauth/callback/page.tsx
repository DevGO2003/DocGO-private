'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { AuthLayout } from '@/components/layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'

export default function OAuthCallbackPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setAuthData } = useAuth()

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Get the current URL to check for OAuth response
        const currentUrl = window.location.href
        
        // Check if this is a successful OAuth callback
        if (currentUrl.includes('/login/oauth2/code/google')) {
          // The backend OAuth2LoginSuccessHandler should have already processed the OAuth
          // and redirected with token data in the URL or set cookies
          
          // Try to extract token from URL parameters or make a request to get user info
          const token = searchParams.get('token')
          const refreshToken = searchParams.get('refreshToken')
          
          if (token) {
            // Store tokens and redirect to dashboard
            localStorage.setItem('auth_token', token)
            if (refreshToken) {
              localStorage.setItem('refresh_token', refreshToken)
            }
            
            setStatus('success')
            setMessage('Đăng nhập Google thành công!')
            
            // Redirect to dashboard after a short delay
            setTimeout(() => {
              router.push('/dashboard')
            }, 2000)
          } else {
            // If no token in URL, the OAuth flow might have failed
            setStatus('error')
            setMessage('Đăng nhập Google thất bại. Vui lòng thử lại.')
          }
        } else {
          setStatus('error')
          setMessage('URL callback không hợp lệ.')
        }
      } catch (error) {
        console.error('OAuth callback error:', error)
        setStatus('error')
        setMessage('Có lỗi xảy ra trong quá trình đăng nhập.')
      }
    }

    handleOAuthCallback()
  }, [router, searchParams, setAuthData])

  return (
    <AuthLayout>
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-semibold">
              Xử lý đăng nhập Google
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {status === 'loading' && (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                <p className="text-gray-600">Đang xử lý đăng nhập...</p>
              </>
            )}
            
            {status === 'success' && (
              <>
                <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto" />
                <p className="text-green-600 font-medium">{message}</p>
                <p className="text-sm text-gray-500">Đang chuyển hướng đến dashboard...</p>
              </>
            )}
            
            {status === 'error' && (
              <>
                <XCircleIcon className="h-12 w-12 text-red-500 mx-auto" />
                <p className="text-red-600 font-medium">{message}</p>
                <button
                  onClick={() => router.push('/auth/login')}
                  className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                >
                  Quay lại đăng nhập
                </button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AuthLayout>
  )
}

