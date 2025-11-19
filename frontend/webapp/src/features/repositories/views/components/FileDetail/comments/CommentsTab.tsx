import React, { useMemo, useState } from 'react'
import { Button } from '@shared/components'
import { CommonIcon } from '@shared/components/UIComponents/Icon/CommonIcon'
import { useAddFileComment, useDeleteFileComment, useFileComments, type FileComment } from '@features/repositories/models/api/repositoryApi'
import { useAppSelector } from '@store/hooks'

interface CommentsTabProps {
  fileId: string
}

export default function CommentsTab({ fileId }: CommentsTabProps) {
  const { data: comments, isLoading, error } = useFileComments(fileId)
  const { mutateAsync: addComment, isPending: adding } = useAddFileComment()
  const { mutateAsync: deleteComment, isPending: deleting } = useDeleteFileComment()

  const currentUser = useAppSelector((state) => state.auth.user)

  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const canSubmit = content.trim().length > 0 && !adding && !submitting

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    try {
      const authorName = currentUser?.fullName || currentUser?.username || currentUser?.email || 'User'
      await addComment({ fileId, data: { content: content.trim(), author: authorName, authorId: currentUser?.id } })
      setContent('')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (c: FileComment) => {
    if (!c?.id) return
    await deleteComment({ fileId, commentId: c.id })
  }

  const ordered = useMemo(() => {
    const list = comments || []
    return [...list].sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
  }, [comments])

  return (
    <div className="space-y-6">
      <div className="rounded-lg border p-4" style={{ borderColor: '#e5e7eb', backgroundColor: '#ffffff' }}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#eef2ff', color: '#4338ca' }}>
              <CommonIcon name="message" size={18} />
            </div>
          </div>
          <div className="flex-1">
            <textarea
              rows={3}
              placeholder="Viết bình luận..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              style={{ borderColor: '#e5e7eb' }}
              disabled={adding || submitting}
            />
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs" style={{ color: '#6b7280' }}>{content.length}/2000</span>
              <Button onClick={handleSubmit} disabled={!canSubmit} className="inline-flex items-center gap-2">
                {submitting ? (
                  <>
                    <CommonIcon name="loading" className="animate-spin" size={16} />
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <CommonIcon name="send" size={16} />
                    Gửi bình luận
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border" style={{ borderColor: '#e5e7eb', backgroundColor: '#ffffff' }}>
        <div className="px-4 py-3 border-b" style={{ borderColor: '#f3f4f6' }}>
          <p className="text-sm font-semibold" style={{ color: '#111827' }}>Danh sách bình luận</p>
        </div>
        <div className="p-4 space-y-4">
          {isLoading && (
            <div className="flex items-center gap-2 text-sm" style={{ color: '#6b7280' }}>
              <CommonIcon name="loading" className="animate-spin" size={16} />
              Đang tải bình luận...
            </div>
          )}
          {error && (
            <div className="p-3 rounded-md" style={{ backgroundColor: '#fef2f2', border: '1px solid #fee2e2', color: '#991b1b' }}>
              Không thể tải bình luận
            </div>
          )}
          {!isLoading && !error && ordered.length === 0 && (
            <div className="text-sm" style={{ color: '#6b7280' }}>Chưa có bình luận nào</div>
          )}
          {!isLoading && !error && ordered.map((c) => (
            <div key={c.id} className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: '#f3f4f6', color: '#6b7280' }}>
                <CommonIcon name="user" size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium" style={{ color: '#111827' }}>{c.author || 'Người dùng'}</p>
                  <span className="text-xs" style={{ color: '#9ca3af' }}>{c.createdAt ? new Date(c.createdAt).toLocaleString() : ''}</span>
                </div>
                <p className="text-sm mt-1" style={{ color: '#374151' }}>{c.content}</p>
              </div>
              {currentUser?.id && c.authorId === currentUser.id && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(c)}
                  disabled={deleting}
                  className="inline-flex items-center gap-1"
                >
                  <CommonIcon name="trash" size={14} />
                  Xóa
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
