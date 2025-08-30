'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { User, LoginCredentials, RegisterData, AuthResponse } from '@/types'
import { authAPI } from '@/lib/api'
import toast from 'react-hot-toast'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (credentials: LoginCredentials) => Promise<boolean>
  register: (data: RegisterData) => Promise<boolean>
  logout: () => void
  refreshToken: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('auth_token')
    const userData = localStorage.getItem('user_data')
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (error) {
        console.error('Error parsing user data:', error)
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_data')
      }
    }
    
    setLoading(false)
  }, [])

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setLoading(true)
      const response = await authAPI.login(credentials)
      const authData: AuthResponse = response.data.data

      // Store tokens and user data
      localStorage.setItem('auth_token', authData.accessToken)
      localStorage.setItem('refresh_token', authData.refreshToken)
      localStorage.setItem('user_data', JSON.stringify(authData.user))

      setUser(authData.user)
      toast.success('Đăng nhập thành công!')
      return true
    } catch (error: any) {
      const message = error.response?.data?.description || 'Đăng nhập thất bại'
      toast.error(message)
      return false
    } finally {
      setLoading(false)
    }
  }

  const register = async (data: RegisterData): Promise<boolean> => {
    try {
      setLoading(true)
      const response = await authAPI.register(data)
      toast.success('Đăng ký thành công! Vui lòng đăng nhập.')
      return true
    } catch (error: any) {
      const message = error.response?.data?.description || 'Đăng ký thất bại'
      toast.error(message)
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user_data')
    setUser(null)
    toast.success('Đã đăng xuất')
  }

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token')
      if (!refreshToken) {
        throw new Error('No refresh token')
      }

      const response = await authAPI.refreshToken(refreshToken)
      const authData: AuthResponse = response.data.data

      localStorage.setItem('auth_token', authData.accessToken)
      localStorage.setItem('refresh_token', authData.refreshToken)
      localStorage.setItem('user_data', JSON.stringify(authData.user))

      setUser(authData.user)
    } catch (error) {
      console.error('Token refresh failed:', error)
      logout()
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    refreshToken,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Hook to check if user is authenticated
export function useRequireAuth() {
  const { user, loading } = useAuth()
  
  useEffect(() => {
    if (!loading && !user) {
      // Redirect to login page if not authenticated
      window.location.href = '/login'
    }
  }, [user, loading])

  return { user, loading }
}

// Hook to check if user has specific role
export function useRequireRole(requiredRole: string) {
  const { user, loading } = useAuth()
  
  useEffect(() => {
    if (!loading && (!user || user.role !== requiredRole)) {
      // Redirect to unauthorized page if user doesn't have required role
      window.location.href = '/unauthorized'
    }
  }, [user, loading, requiredRole])

  return { user, loading }
}
