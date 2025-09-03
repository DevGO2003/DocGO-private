'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { AuthLayout } from '@/components/layout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { useAuth } from '@/hooks/useAuth'
import { LoginCredentials } from '@/types'
import { 
  EyeIcon, 
  EyeSlashIcon, 
  EnvelopeIcon, 
  LockClosedIcon,
  DocumentTextIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>()

  const onSubmit = async (data: LoginCredentials) => {
    setIsLoading(true)
    try {
      const success = await login(data)
      if (success) {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Login error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const features = [
    'Quản lý hợp đồng thông minh',
    'Xử lý tài liệu bằng AI',
    'Bảo mật dữ liệu cao cấp',
    'Giao diện thân thiện',
  ]

  return (
    <AuthLayout>
      <div className="min-h-screen flex">
        {/* Left Side - Login Form */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            {/* Logo and Title */}
            <div className="text-center">
              <div className="flex justify-center">
                <DocumentTextIcon className="h-12 w-12 text-primary-600" />
              </div>
              <h2 className="mt-6 text-3xl font-bold text-gray-900">
                Chào mừng trở lại
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Đăng nhập vào tài khoản DocGO của bạn
              </p>
            </div>

            {/* Login Form */}
            <Card className="shadow-lg">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-semibold text-center">
                  Đăng nhập
                </CardTitle>
                <CardDescription className="text-center">
                  Nhập thông tin đăng nhập của bạn
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Username Field */}
                  <div className="space-y-2">
                    <label htmlFor="username" className="text-sm font-medium text-gray-700">
                      Tên đăng nhập
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        id="username"
                        type="text"
                        placeholder="Nhập tên đăng nhập"
                        className="pl-10"
                        {...register('username', {
                          required: 'Tên đăng nhập là bắt buộc',
                          minLength: {
                            value: 3,
                            message: 'Tên đăng nhập phải có ít nhất 3 ký tự',
                          },
                        })}
                      />
                    </div>
                    {errors.username && (
                      <p className="text-sm text-red-600">{errors.username.message}</p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium text-gray-700">
                      Mật khẩu
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <LockClosedIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Nhập mật khẩu"
                        className="pl-10 pr-10"
                        {...register('password', {
                          required: 'Mật khẩu là bắt buộc',
                          minLength: {
                            value: 6,
                            message: 'Mật khẩu phải có ít nhất 6 ký tự',
                          },
                        })}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        ) : (
                          <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-red-600">{errors.password.message}</p>
                    )}
                  </div>

                  {/* Remember Me and Forgot Password */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                        Ghi nhớ đăng nhập
                      </label>
                    </div>
                    <div className="text-sm">
                      <Link
                        href="/auth/forgot-password"
                        className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                      >
                        Quên mật khẩu?
                      </Link>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    loading={isLoading}
                  >
                    {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                  </Button>

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Hoặc</span>
                    </div>
                  </div>

                  {/* Social Login Buttons */}
                  <div className="space-y-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => console.log('Google login')}
                    >
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Đăng nhập với Google
                    </Button>
                  </div>

                  {/* Register Link */}
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Chưa có tài khoản?{' '}
                      <Link
                        href="/auth/register"
                        className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                      >
                        Đăng ký ngay
                      </Link>
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Side - Features */}
        <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-center bg-gradient-to-br from-primary-600 to-primary-800">
          <div className="max-w-lg px-8 text-white">
            <div className="mb-8">
              <DocumentTextIcon className="h-16 w-16 text-white mb-4" />
              <h1 className="text-4xl font-bold mb-4">
                DocGO
              </h1>
              <p className="text-xl text-primary-100">
                Nền tảng quản lý tài liệu và hợp đồng thông minh
              </p>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-semibold mb-4">
                Tại sao chọn DocGO?
              </h2>
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircleIcon className="h-6 w-6 text-primary-200 flex-shrink-0" />
                    <span className="text-primary-100">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-12 p-6 bg-white bg-opacity-10 rounded-lg backdrop-blur-sm">
              <blockquote className="text-primary-100 italic">
                "DocGO đã giúp chúng tôi tối ưu hóa quy trình quản lý hợp đồng, 
                tiết kiệm thời gian và giảm thiểu rủi ro trong kinh doanh."
              </blockquote>
              <div className="mt-4">
                <p className="text-sm font-medium text-white">Nguyễn Văn A</p>
                <p className="text-xs text-primary-200">CEO, Công ty ABC</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  )
}




