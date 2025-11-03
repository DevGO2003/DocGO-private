import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate, useLocation } from 'react-router-dom'
import { uploadBus } from '@shared/lib/upload/uploadBus'

export default function GlobalDropzone() {
  const [dragActive, setDragActive] = useState(false)
  const dragCounter = useRef(0)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const onDragOver = (e: DragEvent) => {
      e.preventDefault()
    }
    const onDragEnter = (e: DragEvent) => {
      if (!e.dataTransfer) return
      dragCounter.current += 1
      if (Array.from(e.dataTransfer.types || []).includes('Files')) {
        setDragActive(true)
      }
      e.preventDefault()
    }
    const onDragLeave = (e: DragEvent) => {
      dragCounter.current = Math.max(0, dragCounter.current - 1)
      if (dragCounter.current === 0) setDragActive(false)
      e.preventDefault()
    }
    const onDrop = (e: DragEvent) => {
      e.preventDefault()
      dragCounter.current = 0
      setDragActive(false)
      const files = e.dataTransfer?.files
      if (files && files.length > 0) {
        uploadBus.setPendingFiles(Array.from(files))
        if (!location.pathname.startsWith('/upload')) {
          navigate('/upload')
        }
      }
    }

    window.addEventListener('dragover', onDragOver)
    window.addEventListener('dragenter', onDragEnter)
    window.addEventListener('dragleave', onDragLeave)
    window.addEventListener('drop', onDrop)
    return () => {
      window.removeEventListener('dragover', onDragOver)
      window.removeEventListener('dragenter', onDragEnter)
      window.removeEventListener('dragleave', onDragLeave)
      window.removeEventListener('drop', onDrop)
    }
  }, [navigate, location.pathname])

  if (!dragActive) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] pointer-events-none"
      aria-hidden
    >
      <div className="absolute inset-0 bg-black/30" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="pointer-events-auto border-2 border-dashed border-white/80 rounded-2xl px-8 py-6" style={ color: '#ffffff' }>
          <div className="text-lg font-semibold">Thả file vào đây để tải lên</div>
          <div className="text-sm opacity-80 mt-1">Hỗ trợ mọi loại file • Kéo thả ở bất kỳ đâu</div>
        </div>
      </div>
    </div>,
    document.body
  )
}
