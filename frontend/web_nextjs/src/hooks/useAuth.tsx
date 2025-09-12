'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { authAPI } from '@/lib/api'

type Role = 'ADMIN' | 'MANAGER' | 'STAFF' | 'USER' | 'VIEWER'
type Status = 'APPROVED' | 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: Role
  status: Status
}

interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  loading: boolean
  login: (data: { email?: string; username?: string; password?: string }) => Promise<boolean>
  register: (data: { email: string; username?: string; password?: string; name?: string }) => Promise<boolean>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const STORAGE_KEY = 'docgo_auth_v1'

function readStorage(): { token: string | null; user: AuthUser | null } {
  if (typeof window === 'undefined') return { token: null, user: null }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return { token: null, user: null }
    return JSON.parse(raw)
  } catch {
    return { token: null, user: null }
  }
}

function writeStorage(data: { token: string | null; user: AuthUser | null }) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {}
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  // Load from localStorage on mount
  useEffect(() => {
    const stored = readStorage()
    setUser(stored.user)
    setToken(stored.token)
    setLoading(false)
  }, [])

  useEffect(() => {
    writeStorage({ token, user })
  }, [token, user])

  const fetchCurrentUser = useCallback(async () => {
    setLoading(true)
    try {
      const res = await authAPI.getProfile()
      const current = (res.data?.data as any)?.user ?? res.data?.data
      if (current) setUser(current as AuthUser)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // If there is a token in storage, try to fetch current user (mock)
    if (token && !user) {
      fetchCurrentUser()
    }
  }, [token, user, fetchCurrentUser])

  const login = useCallback(async (data: { email?: string; username?: string; password?: string }) => {
    setLoading(true)
    try {
      const credentials = {
        username: data.username || (data.email || ''),
        password: data.password || '',
      }
      const res = await authAPI.login(credentials as any)
      const payload = res.data?.data as any
      const tok = payload?.accessToken as string
      const refresh = payload?.refreshToken as string | undefined
      const usr = (payload?.user || payload) as AuthUser
      setToken(tok)
      setUser(usr)
      // sync with global storage used by axios interceptors
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('auth_token', tok || '')
        if (refresh) window.localStorage.setItem('refresh_token', refresh)
        window.localStorage.setItem('user_data', JSON.stringify(usr))
      }
      return true
    } catch {
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (data: { email: string; username?: string; password?: string; name?: string }) => {
    setLoading(true)
    try {
      await authAPI.register({
        username: data.username || data.email,
        email: data.email,
        password: data.password,
        name: data.name || data.username,
      })
      return true
    } catch {
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    setLoading(true)
    try {
      await authAPI.logout()
    } finally {
      setToken(null)
      setUser(null)
      writeStorage({ token: null, user: null })
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('auth_token')
        window.localStorage.removeItem('refresh_token')
        window.localStorage.removeItem('user_data')
      }
      setLoading(false)
    }
  }, [])

  const value = useMemo<AuthContextValue>(() => ({ user, token, loading, login, register, logout }), [user, token, loading, login, register, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}


