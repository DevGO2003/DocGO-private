'use client'

import React, { useState } from 'react'

export function CommentsMainTab() {
  const [commentInput, setCommentInput] = useState('')
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest')
  const [comments, setComments] = useState<Array<{ user: string; timeISO: string; content: string }>>([
    { user: 'Admin', timeISO: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), content: 'Vui lòng kiểm tra điều khoản thanh toán.' },
    { user: 'Legal', timeISO: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), content: 'Đã rà soát, đề xuất chỉnh sửa mục 7.' },
    { user: 'Finance', timeISO: new Date(Date.now() - 30 * 60 * 1000).toISOString(), content: 'Ngân sách đã được phê duyệt. Có thể tiến hành ký hợp đồng.' },
    { user: 'Manager', timeISO: new Date(Date.now() - 15 * 60 * 1000).toISOString(), content: 'Cần thêm điều khoản về bảo mật thông tin khách hàng.' }
  ])

  const addComment = () => {
    if (!commentInput.trim()) return
    const nowISO = new Date().toISOString()
    setComments([{ user: 'Bạn', timeISO: nowISO, content: commentInput.trim() }, ...comments])
    setCommentInput('')
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      addComment()
    }
  }

  const sorted = [...comments].sort((a, b) =>
    sort === 'newest' ? b.timeISO.localeCompare(a.timeISO) : a.timeISO.localeCompare(b.timeISO)
  )

  return (
    <div className="p-6 space-y-4">
      {/* Toolbar */}
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

      {/* Composer */}
      <div className="bg-white rounded-lg border p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Thêm bình luận</label>
        <textarea
          value={commentInput}
          onChange={(e) => setCommentInput(e.target.value)}
          onKeyDown={onKeyDown}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 min-h-[100px]"
          placeholder="Nhập bình luận... (Ctrl/Cmd + Enter để gửi)"
        />
        <div className="mt-2 flex items-center justify-between">
          <div className="text-xs text-gray-500">Hỗ trợ markdown tối giản (in đậm, xuống dòng)</div>
          <div className="space-x-2">
            <button 
              className="px-3 py-1 border rounded text-sm" 
              onClick={() => setCommentInput(commentInput + '\n')}
            >
              Xuống dòng
            </button>
            <button 
              onClick={addComment} 
              className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm"
            >
              Gửi
            </button>
          </div>
        </div>
      </div>

      {/* List */}
      {sorted.length === 0 ? (
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
                    <span className="text-xs text-gray-500">{new Date(c.timeISO).toLocaleString('vi-VN')}</span>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{c.content}</p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                    <button className="hover:text-gray-700">Thích</button>
                    <button className="hover:text-gray-700">Trả lời</button>
                    <button className="hover:text-gray-700">Sao chép</button>
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
