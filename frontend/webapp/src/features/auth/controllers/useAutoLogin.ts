import { useEffect } from 'react'
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

  useEffect(() => {
    const loadAndLogin = async () => {
      try {
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
