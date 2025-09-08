'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

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
      // Mock verify current user
      const res = await fetch('/api/mock/auth', { method: 'GET' })
      if (res.ok) {
        const json = await res.json()
        const current = json?.data?.user as AuthUser | undefined
        if (current) setUser(current)
      }
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
      // Allow login with either email or username; mock API expects email
      const email = data.email || (data.username ? `${data.username}@docgo.local` : '')
      const res = await fetch('/api/mock/auth?action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: data.password }),
      })
      if (!res.ok) return false
      const json = await res.json()
      const tok = (json?.data?.token as string) || 'mock-token'
      const usr = json?.data?.user as AuthUser
      setToken(tok)
      setUser(usr)
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
      const res = await fetch('/api/mock/auth?action=register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, name: data.name || data.username }),
      })
      if (!res.ok) return false
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
      await fetch('/api/mock/auth?action=logout', { method: 'POST' })
    } finally {
      setToken(null)
      setUser(null)
      writeStorage({ token: null, user: null })
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


