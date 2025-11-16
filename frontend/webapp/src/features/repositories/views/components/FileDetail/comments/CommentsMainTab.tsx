'use client'

import React, { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getFileComments, addFileComment } from '@features/repositories/services/commentsApi'

interface CommentsMainTabProps {
  fileId?: string
}

interface CommentItem {
  id?: string
  user: string
  content: string
  createdAt: string
}

export function CommentsMainTab({ fileId }: CommentsMainTabProps) {
  const [commentInput, setCommentInput] = useState('')
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest')
  const [likes, setLikes] = useState<Record<string, boolean>>({})
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const queryClient = useQueryClient()

  const { data, isPending, error } = useQuery({
    queryKey: ['file-comments', fileId],
    queryFn: () => getFileComments(fileId || ''),
    enabled: !!fileId,
  })

  const addMutation = useMutation({
    mutationFn: (content: string) => addFileComment(fileId || '', content),
    onSuccess: (resp: any) => {
      try {
        const apiResp = resp?.data
        const saved = apiResp?.data ?? apiResp
        const newItem = {
          id: saved?.id,
          user: saved?.author || saved?.user || 'User',
          content: saved?.content || '',
          createdAt: saved?.createdAt || new Date().toISOString(),
        }
        queryClient.setQueryData(['file-comments', fileId], (prev: any) => {
          if (!prev) return prev
          try {
            const clone = { ...prev, data: Array.isArray(prev?.data) ? [...prev.data] : { ...(prev?.data || {}) } }
            const d = clone.data
            if (Array.isArray(d?.data)) {
              clone.data.data = [newItem, ...d.data]
            } else if (Array.isArray(clone.data)) {
              clone.data = [newItem, ...clone.data]
            } else if (Array.isArray(d?.content)) {
              clone.data.content = [newItem, ...d.content]
            }
            return clone
          } catch {
            return prev
          }
        })
      } catch {}
      queryClient.invalidateQueries({ queryKey: ['file-comments', fileId] })
      setCommentInput('')
    },
  })

  const submitComment = async () => {
    if (!fileId || !commentInput.trim()) return
    try {
      await addMutation.mutateAsync(commentInput.trim())
    } catch (e) {
      console.error('[Comments] add failed', e)
      alert('Không thể gửi bình luận. Vui lòng thử lại.')
    }
  }

  const toggleLike = (commentId: string) => {
    if (!commentId) return
    setLikes((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }))
  }

  const handleReply = (c: FileComment) => {
    const prefix = c.user ? `@${c.user} ` : ''
    setCommentInput((prev) => (prev ? `${prev}\n${prefix}` : prefix))
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }

  const handleCopy = async (c: FileComment) => {
    try {
      await navigator.clipboard.writeText(c.content || '')
    } catch (err) {
      console.error('[Comments] copy failed', err)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      submitComment()
    }
  }

  const serverList: any[] = Array.isArray((data as any)?.data)
    ? (data as any).data
    : Array.isArray((data as any)?.data?.content)
    ? (data as any).data.content
    : Array.isArray((data as any)?.data?.data)
    ? (data as any).data.data
    : Array.isArray((data as any)?.data?.data?.content)
    ? (data as any).data.data.content
    : []

  const normalized: CommentItem[] = serverList.map((c: any) => ({
    id: c.id,
    user: c.user || c.author || c.createdBy || 'User',
    content: c.content || c.text || '',
    createdAt: c.createdAt || c.timeISO || c.timestamp || new Date().toISOString(),
  }))

  const sorted = [...normalized].sort((a, b) =>
    sort === 'newest' ? b.createdAt.localeCompare(a.createdAt) : a.createdAt.localeCompare(b.createdAt)
  )

  return (
    <div className="p-6 space-y-4">
      {!fileId && (
        <div className="text-sm text-gray-500">Không có fileId để tải bình luận.</div>
      )}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">{sorted.length} bình luận</div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Sắp xếp</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as 'newest' | 'oldest')}
            className="px-2 py-1 border rounded text-sm"
          >
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
          </select>
          <button
            className="px-2 py-1 text-sm border rounded hover:bg-gray-50"
            onClick={() => setCommentInput('')}
          >
            Xóa ô nhập
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Thêm bình luận</label>
        <textarea
          value={commentInput}
          onChange={(e) => setCommentInput(e.target.value)}
          onKeyDown={onKeyDown}
          ref={textareaRef}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 min-h-[100px]"
          placeholder="Nhập bình luận... (Ctrl/Cmd + Enter để gửi)"
        />
        <div className="mt-2 flex items-center justify-between">
          <div className="text-xs text-gray-500">Hỗ trợ markdown tối giản (in đậm, xuống dòng)</div>
          <div className="space-x-2">
            <button
              onClick={submitComment}
              disabled={!commentInput.trim() || addMutation.isPending || !fileId}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm disabled:opacity-60"
            >
              Gửi
            </button>
          </div>
        </div>
      </div>

      {error ? (
        <div className="text-sm text-red-600">Không thể tải bình luận.</div>
      ) : isPending ? (
        <div className="text-sm text-gray-500">Đang tải bình luận...</div>
      ) : sorted.length === 0 ? (
        <div className="text-sm text-gray-500">Chưa có bình luận nào.</div>
      ) : (
        <div className="space-y-3">
          {sorted.map((c, i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {c.user.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium text-gray-900">{c.user}</span>
                    <span className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleString('vi-VN')}</span>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{c.content}</p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                    <button
                      className="hover:text-gray-700"
                      onClick={() => toggleLike(c.id)}
                    >
                      {likes[c.id] ? 'Đã thích' : 'Thích'}
                    </button>
                    <button
                      className="hover:text-gray-700"
                      onClick={() => handleReply(c)}
                    >
                      Trả lời
                    </button>
                    <button
                      className="hover:text-gray-700"
                      onClick={() => handleCopy(c)}
                    >
                      Sao chép
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
