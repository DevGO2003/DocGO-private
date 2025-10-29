import React, { useState, useEffect, useRef } from 'react'
import { Progress } from '@shared/components'  // Assume UI kit has Progress bar

interface UploadProgressProps {
  correlationId: string
  onComplete: (result: any) => void
  onError: (error: string) => void
}

export default function UploadProgress({ correlationId, onComplete, onError }: UploadProgressProps) {
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('Bắt đầu xử lý...')
  const [error, setError] = useState('')
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    const wsUrl = `ws://localhost:8000/api/ws/progress?correlationId=${correlationId}`
    const ws = new WebSocket(wsUrl)

    wsRef.current = ws

    ws.onopen = () => {
      console.log('WS connected for progress')
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.correlationId === correlationId) {
        setProgress(data.progress || 0)
        setStatus(data.message || data.stage || 'Xử lý...')
        if (data.progress === 100) {
          onComplete(data)
          ws.close()
        } else if (data.progress === -1 || data.error) {
          const errMsg = data.message || data.error || 'Lỗi không xác định'
          setError(errMsg)
          onError(errMsg)
          ws.close()
        }
      }
    }

    ws.onerror = (err) => {
      console.error('WS error:', err)
      onError('Kết nối progress thất bại')
    }

    ws.onclose = () => {
      console.log('WS closed')
      wsRef.current = null
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [correlationId, onComplete, onError])

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-sm text-red-800">Lỗi xử lý: {error}</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
      <h3 className="text-base font-semibold text-gray-900 mb-2">Tiến trình xử lý</h3>
      <div className="space-y-2">
        <Progress value={progress} className="w-full" />
        <p className="text-sm text-gray-600">{status}</p>
        {progress > 0 && <p className="text-xs text-gray-500">{progress}% hoàn tất</p>}
      </div>
    </div>
  )
}
