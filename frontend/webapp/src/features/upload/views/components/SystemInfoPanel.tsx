import React from 'react'

export default function SystemInfoPanel() {
  return (
    <div className="rounded-2xl border" style={{ borderColor: '#e5e7eb', backgroundColor: '#ffffff', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }} >
      <div className="p-4 border-b" style={{ borderColor: '#f3f4f6' }} >
        <h3 className="text-base font-semibold" style={{ color: '#111827' }} >
          Thông tin hệ thống <span className="font-normal" style={{ color: '#6b7280' }} >• Công nghệ AI và tính năng</span>
        </h3>
      </div>
      <div className="p-4 space-y-3">
        {/* Feature 1: AI thông minh */}
        <div className="flex items-center space-x-3 pb-3 border-b" style={{ borderColor: '#f3f4f6' }} >
          <div className="h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#3b82f6' }} >
            <svg style={{ color: '#ffffff' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div className="flex-1">
            <h5 className="text-sm font-semibold" style={{ color: '#111827' }} >AI thông minh</h5>
            <p className="text-xs" style={{ color: '#4b5563' }} >Nhận diện văn bản chính xác 99%</p>
          </div>
        </div>

        {/* Feature 2: Đa ngôn ngữ */}
        <div className="flex items-center space-x-3 pb-3 border-b" style={{ borderColor: '#f3f4f6' }} >
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
            <svg style={{ color: '#ffffff' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <div className="flex-1">
            <h5 className="text-sm font-semibold" style={{ color: '#111827' }} >Đa ngôn ngữ</h5>
            <p className="text-xs" style={{ color: '#4b5563' }} >Hỗ trợ tiếng Việt và tiếng Anh</p>
          </div>
        </div>

        {/* Feature 3: Xử lý nhanh */}
        <div className="flex items-center space-x-3 pb-3 border-b" style={{ borderColor: '#f3f4f6' }} >
          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
            <svg style={{ color: '#ffffff' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="flex-1">
            <h5 className="text-sm font-semibold" style={{ color: '#111827' }} >Xử lý nhanh</h5>
            <p className="text-xs" style={{ color: '#4b5563' }} >Tốc độ xử lý tối ưu</p>
          </div>
        </div>

        {/* Tip */}
        <div className="border rounded-lg p-3 flex items-start space-x-3" style={{ borderColor: '#bfdbfe', backgroundColor: '#eff6ff' }} >
          <div className="h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#3b82f6' }} >
            <svg style={{ color: '#ffffff' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h6 className="text-sm font-semibold" style={{ color: '#1e3a8a' }} >💡 Mẹo sử dụng</h6>
            <p className="text-xs mt-1" style={{ color: '#1d4ed8' }} >Bạn có thể kéo thả file ở bất kỳ đâu trên màn hình để upload nhanh!</p>
          </div>
        </div>
      </div>
    </div>
  )
}
