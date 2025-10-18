'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

export interface ProgressData {
  documentId: string
  progress: number
  stage: string
  message: string
  timestamp: string
  metadata?: any
  completed?: boolean
  error?: boolean
  errorCode?: string
  errorMessage?: string
  result?: any
}

export interface UseDocumentProgressReturn {
  progress: number
  stage: string
  message: string
  isComplete: boolean
  error: string | null
  isConnected: boolean
  progressData: ProgressData | null
  connect: () => void
  disconnect: () => void
  reconnect: () => void
}

export function useDocumentProgress(documentId: string | null): UseDocumentProgressReturn {
  const [progress, setProgress] = useState(0)
  const [stage, setStage] = useState('')
  const [message, setMessage] = useState('')
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [progressData, setProgressData] = useState<ProgressData | null>(null)
  
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5
  const reconnectDelay = 1000 // 1 second
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const POLLING_MS = 1500

  const connect = useCallback(() => {
    if (!documentId || wsRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    // Switch to HTTP polling via API Gateway
    if (!documentId) return
    if (pollingIntervalRef.current) return
    setIsConnected(true)
    setError(null)
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_GATEWAY_URL || ''
    const endpoint = `/api/v1/automation-service/documents/${documentId}/progress`
    const url = baseUrl ? `${baseUrl}${endpoint}` : endpoint

    const poll = async () => {
      try {
        const res = await fetch(url, { headers: { Accept: 'application/json' }, cache: 'no-store' })
        if (!res.ok) {
          throw new Error(`Progress fetch failed: ${res.status}`)
        }
        const body = await res.json()
        const data: ProgressData = body?.data ?? body
        if (!data) return

        setProgressData(data)
        if (typeof data.progress === 'number') setProgress(data.progress)
        if (typeof data.stage === 'string') setStage(data.stage)
        if (typeof data.message === 'string') setMessage(data.message)

        if (data.completed) {
          setIsComplete(true)
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current)
            pollingIntervalRef.current = null
          }
        }
        if (data.error) {
          setError(data.errorMessage || 'Unknown error occurred')
        }
      } catch (e: any) {
        setError(e?.message || 'Failed to fetch progress')
      }
    }

    // initial and interval
    poll()
    pollingIntervalRef.current = setInterval(poll, POLLING_MS)
  }, [documentId, isComplete])

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect')
      wsRef.current = null
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
    
    setIsConnected(false)
    reconnectAttempts.current = 0
  }, [documentId])

  const reconnect = useCallback(() => {
    disconnect()
    setTimeout(() => {
      connect()
    }, 100)
  }, [disconnect, connect])

  const scheduleReconnect = useCallback(() => {
    if (reconnectAttempts.current >= maxReconnectAttempts) {
      console.error(`[useDocumentProgress] Max reconnect attempts reached for document ${documentId}`)
      setError('Connection lost. Please refresh the page.')
      return
    }

    reconnectAttempts.current++
    const delay = reconnectDelay * Math.pow(2, reconnectAttempts.current - 1) // Exponential backoff
    
    console.log(`[useDocumentProgress] Scheduling reconnect attempt ${reconnectAttempts.current} in ${delay}ms`)
    
    reconnectTimeoutRef.current = setTimeout(() => {
      if (!isComplete) {
        connect()
      }
    }, delay)
  }, [documentId, isComplete, connect])

  // Auto-connect when documentId changes
  useEffect(() => {
    if (documentId) {
      connect()
    } else {
      disconnect()
    }

    return () => {
      disconnect()
    }
  }, [documentId, connect, disconnect])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  // No ping required for HTTP polling

  return {
    progress,
    stage,
    message,
    isComplete,
    error,
    isConnected,
    progressData,
    connect,
    disconnect,
    reconnect
  }
}
