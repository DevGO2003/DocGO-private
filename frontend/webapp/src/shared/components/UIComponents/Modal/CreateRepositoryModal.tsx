import React, { useState } from 'react'
import { Modal, Button, Input, Textarea, Switch, Label } from '@shared/components'
import type { RepositoryCreateData } from '@features/repositories/models/types/repository.types'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: RepositoryCreateData) => Promise<void> | void
  isLoading?: boolean
}

export const CreateRepositoryModal: React.FC<Props> = ({ isOpen, onClose, onSubmit, isLoading }) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reset = () => {
    setName('')
    setDescription('')
    setIsPublic(false)
    setError(null)
  }

  const handleClose = () => {
    if (isLoading) return
    reset()
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!name.trim()) {
      setError('Tên repository là bắt buộc')
      return
    }
    const payload: RepositoryCreateData = {
      name: name.trim(),
      description: description || undefined,
      isPublic,
    }
    await Promise.resolve(onSubmit(payload))
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Tạo repository" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm" style={{ color: '#dc2626' }} >{error}</p>}
        <div className="space-y-1">
          <Label className="text-sm" style={{ color: '#374151' }} >Tên</Label>
          <Input value={name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)} placeholder="Tên repository" />
        </div>
        <div className="space-y-1">
          <Label className="text-sm" style={{ color: '#374151' }} >Mô tả (tuỳ chọn)</Label>
          <Textarea value={description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)} rows={3} />
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={isPublic} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIsPublic(e.target.checked)} />
          <span className="text-sm" style={{ color: '#4b5563' }} >Công khai</span>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={handleClose} disabled={!!isLoading}>Huỷ</Button>
          <Button type="submit" disabled={!!isLoading}>{isLoading ? 'Đang tạo...' : 'Tạo'}</Button>
        </div>
      </form>
    </Modal>
  )
}

export default CreateRepositoryModal
