import { useEffect, useRef } from 'react'
import { useLoginController } from './useLoginController'
import { LoginCredentials } from '../models/types/auth.types'

/**
 * Auto-login hook từ file account.txt
 * 
 * Format file account.txt:
 * username=truongluan2
 * password=@Luan123123
 * 
 * Nếu file không tồn tại, hook sẽ không làm gì
 * Xóa file account.txt để disable auto-login
 */
export const useAutoLogin = () => {
  const { handleLogin } = useLoginController()
  const ranRef = useRef(false)

  useEffect(() => {
    if (ranRef.current) return
    ranRef.current = true

    const loadAndLogin = async () => {
      try {
        // Skip if not on login/auth routes
        if (typeof window !== 'undefined') {
          const path = window.location.pathname
          if (!(path === '/login' || path.startsWith('/auth'))) {
            return
          }
        }

        // Prevent multiple attempts per session
        if (typeof window !== 'undefined' && sessionStorage.getItem('auto_login_done') === '1') {
          return
        }

        // If already authenticated, skip
        if (typeof window !== 'undefined') {
          try {
            const saved = localStorage.getItem('docgo_auth_v1')
            if (saved) {
              const parsed = JSON.parse(saved)
              const exp = parsed?.tokenData?.expiresAt
              if (exp && Date.now() < exp) {
                return
              }
            }
            const token = localStorage.getItem('auth_token')
            if (token) {
              return
            }
          } catch {}
        }

        // Fetch account.txt từ public folder
        const response = await fetch('/account.txt')
        
        // Nếu file không tồn tại (404), bỏ qua
        if (!response.ok) {
          console.log('[AutoLogin] account.txt not found - skipping auto-login')
          return
        }

        const content = await response.text()
        const credentials = parseAccountFile(content)

        if (credentials && credentials.username && credentials.password) {
          console.log('[AutoLogin] Auto-logging in with credentials from account.txt')
          await handleLogin(credentials)
        }
      } catch (error) {
        console.error('[AutoLogin] Error loading account.txt:', error)
      } finally {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('auto_login_done', '1')
        }
      }
    }

    loadAndLogin()
  }, [handleLogin])
}

/**
 * Parse account.txt file
 * Format:
 * username=truongluan2
 * password=@Luan123123
 */
const parseAccountFile = (content: string): LoginCredentials | null => {
  try {
    const lines = content.split('\n')
    const credentials: Partial<LoginCredentials> = {}

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue

      const [key, ...valueParts] = trimmed.split('=')
      const value = valueParts.join('=').trim()

      if (key.trim() === 'username') {
        credentials.username = value
      } else if (key.trim() === 'password') {
        credentials.password = value
      }
    }

    if (credentials.username && credentials.password) {
      return credentials as LoginCredentials
    }

    return null
  } catch (error) {
    console.error('[AutoLogin] Error parsing account.txt:', error)
    return null
  }
}
