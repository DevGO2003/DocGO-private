'use client'

import React, { useState } from 'react'
import { ChatBubbleLeftRightIcon, PlusIcon, UserIcon, ClockIcon } from '@heroicons/react/24/outline'

interface NotesTabProps {
  documentData: any
}

export function NotesTab({ documentData }: NotesTabProps) {
  const [noteInput, setNoteInput] = useState('')
  const [notes, setNotes] = useState<Array<{ content: string; at: string; user: string }>>([
    ...(documentData?.authorNotes?.map((note: any) => ({
      content: note.content,
      at: note.time,
      user: note.user
    })) || []),
    {
      content: 'Cần theo dõi chặt chẽ tiến độ của Bên B để đảm bảo hoàn thành đúng hạn.',
      at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      user: 'Admin'
    },
    {
      content: 'Đã gửi yêu cầu chỉnh sửa điều khoản bảo hành từ 12 tháng lên 18 tháng.',
      at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      user: 'Legal Team'
    },
    {
      content: 'Kiểm tra lại thông tin mã số thuế của các bên tham gia để đảm bảo chính xác.',
      at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      user: 'Finance'
    }
  ])

  const addNote = () => {
    if (!noteInput.trim()) return
    const newNote = { 
      content: noteInput.trim(), 
      at: new Date().toISOString(),
      user: 'Bạn'
    }
    setNotes([newNote, ...notes])
    setNoteInput('')
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      addNote()
    }
  }

  return (
    <div className="space-y-6">
      {/* Add Note Section */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <ChatBubbleLeftRightIcon className="w-6 h-6 text-indigo-600 mr-2" />
          <h4 className="text-lg font-medium text-gray-900">Ghi chú của tác giả</h4>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thêm ghi chú mới
            </label>
            <textarea
              placeholder="Nhập ghi chú nội bộ cho tài liệu... (Ctrl/Cmd + Enter để thêm)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 min-h-[120px]"
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              onKeyDown={onKeyDown}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              Ghi chú này chỉ hiển thị cho các thành viên có quyền truy cập tài liệu
            </div>
            <button 
              onClick={addNote}
              disabled={!noteInput.trim()}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Thêm ghi chú
            </button>
          </div>
        </div>
      </div>

      {/* Notes List */}
      {notes.length > 0 && (
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h5 className="text-lg font-medium text-gray-900 flex items-center">
              <UserIcon className="w-5 h-5 mr-2 text-gray-600" />
              Danh sách ghi chú ({notes.length})
            </h5>
            <div className="text-sm text-gray-500">
              Sắp xếp theo: Mới nhất
            </div>
          </div>
          
          <div className="space-y-4">
            {notes.map((note, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 border-l-4 border-indigo-500">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {note.user.charAt(0)}
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-900">{note.user}</span>
                      <div className="flex items-center text-xs text-gray-500">
                        <ClockIcon className="w-3 h-3 mr-1" />
                        {new Date(note.at).toLocaleString('vi-VN')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="text-gray-400 hover:text-gray-600 text-sm">
                      Chỉnh sửa
                    </button>
                    <button className="text-gray-400 hover:text-red-600 text-sm">
                      Xóa
                    </button>
                  </div>
                </div>
                <div className="text-sm text-gray-700 whitespace-pre-wrap ml-10">
                  {note.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Note Templates */}
      <div className="bg-white border rounded-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Mẫu ghi chú nhanh</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            'Cần xem xét lại điều khoản...',
            'Đã liên hệ với bên thứ ba...',
            'Cần bổ sung thông tin...',
            'Đã phê duyệt từ pháp lý...',
            'Chờ phản hồi từ khách hàng...',
            'Cần cập nhật thông tin...'
          ].map((template, index) => (
            <button
              key={index}
              onClick={() => setNoteInput(template)}
              className="text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition text-sm"
            >
              {template}
            </button>
          ))}
        </div>
      </div>

      {/* Note Statistics */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Thống kê ghi chú</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">{notes.length}</div>
            <div className="text-sm text-gray-600">Tổng ghi chú</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {notes.filter(n => n.user === 'Bạn').length}
            </div>
            <div className="text-sm text-gray-600">Ghi chú của bạn</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {new Set(notes.map(n => n.user)).size}
            </div>
            <div className="text-sm text-gray-600">Người tham gia</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {notes.filter(n => new Date(n.at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
            </div>
            <div className="text-sm text-gray-600">Tuần này</div>
          </div>
        </div>
      </div>

      {/* Note Guidelines */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-3">📝 Hướng dẫn sử dụng ghi chú</h4>
        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex items-start space-x-2">
            <span className="text-yellow-600 font-bold">•</span>
            <span>Ghi chú chỉ hiển thị cho các thành viên có quyền truy cập tài liệu</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-yellow-600 font-bold">•</span>
            <span>Sử dụng ghi chú để theo dõi tiến độ, ghi nhớ thông tin quan trọng</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-yellow-600 font-bold">•</span>
            <span>Ghi chú được lưu trữ vĩnh viễn và có thể được tìm kiếm</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-yellow-600 font-bold">•</span>
            <span>Chỉ tác giả và quản trị viên mới có thể chỉnh sửa/xóa ghi chú</span>
          </div>
        </div>
      </div>
    </div>
  )
}
