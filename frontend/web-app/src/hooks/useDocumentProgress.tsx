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

  const connect = useCallback(() => {
    if (!documentId || wsRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    try {
      // Build WebSocket URL
      const wsUrl = `ws://localhost:8003/api/v1/automation-service/v1/documents/progress/${documentId}`
      
      console.log(`[useDocumentProgress] Connecting to WebSocket: ${wsUrl}`)
      
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        console.log(`[useDocumentProgress] WebSocket connected for document ${documentId}`)
        setIsConnected(true)
        setError(null)
        reconnectAttempts.current = 0
      }

      ws.onmessage = (event) => {
        try {
          const data: ProgressData = JSON.parse(event.data)
          console.log(`[useDocumentProgress] Received progress update:`, data)
          
          setProgressData(data)
          setProgress(data.progress)
          setStage(data.stage)
          setMessage(data.message)
          
          if (data.completed) {
            setIsComplete(true)
            console.log(`[useDocumentProgress] Processing completed for document ${documentId}`)
          }
          
          if (data.error) {
            setError(data.errorMessage || 'Unknown error occurred')
            console.error(`[useDocumentProgress] Processing error:`, data.errorMessage)
          }
          
        } catch (err) {
          console.error(`[useDocumentProgress] Failed to parse WebSocket message:`, err)
          setError('Failed to parse progress update')
        }
      }

      ws.onclose = (event) => {
        console.log(`[useDocumentProgress] WebSocket closed for document ${documentId}:`, event.code, event.reason)
        setIsConnected(false)
        
        // Auto-reconnect if not manually closed and not complete
        if (!isComplete && event.code !== 1000) {
          scheduleReconnect()
        }
      }

      ws.onerror = (err) => {
        console.error(`[useDocumentProgress] WebSocket error for document ${documentId}:`, err)
        setError('WebSocket connection error')
        setIsConnected(false)
      }

    } catch (err) {
      console.error(`[useDocumentProgress] Failed to create WebSocket connection:`, err)
      setError('Failed to connect to progress stream')
    }
  }, [documentId, isComplete])

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      console.log(`[useDocumentProgress] Disconnecting WebSocket for document ${documentId}`)
      wsRef.current.close(1000, 'Manual disconnect')
      wsRef.current = null
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
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

  // Ping/pong to keep connection alive
  useEffect(() => {
    if (!isConnected || !wsRef.current) return

    const pingInterval = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send('ping')
      }
    }, 30000) // Ping every 30 seconds

    return () => {
      clearInterval(pingInterval)
    }
  }, [isConnected])

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
