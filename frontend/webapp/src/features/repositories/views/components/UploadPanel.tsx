import React, { useRef, useState } from 'react'
import { Button } from '@shared/components'

export const UploadPanel: React.FC<{ onUpload: (file: File) => Promise<void> | void }> = ({ onUpload }) => {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [fileName, setFileName] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileName(file.name)
    }
  }

  const handleUpload = async () => {
    const file = inputRef.current?.files?.[0]
    if (!file) return
    setLoading(true)
    try {
      await onUpload(file)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <input ref={inputRef} type="file" onChange={handleSelect} />
      {fileName && <div className="text-sm text-gray-600">Đã chọn: {fileName}</div>}
      <Button onClick={handleUpload} disabled={loading || !inputRef.current?.files?.length}>
        {loading ? 'Đang tải...' : 'Tải lên'}
      </Button>
    </div>
  )
}
