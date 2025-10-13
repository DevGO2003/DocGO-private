'use client'

import React from 'react'

export default function SystemInfoPanel() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-base font-semibold text-gray-900">
          Thông tin hệ thống <span className="text-gray-500 font-normal">• Công nghệ AI và tính năng</span>
        </h3>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* AI Technology */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-lg p-3">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-1">AI OCR tiên tiến</h4>
                <p className="text-xs text-gray-600 mb-2">Hệ thống sử dụng AI để nhận diện và trích xuất văn bản từ các file PDF, DOCX, TXT với độ chính xác cao, hỗ trợ tiếng Việt và tiếng Anh.</p>
                <div className="flex flex-wrap gap-1">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">AI chính xác</span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Đa ngôn ngữ</span>
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">Xử lý nhanh</span>
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h5 className="text-sm font-semibold text-gray-900">AI thông minh</h5>
                <p className="text-xs text-gray-600">Nhận diện văn bản chính xác 99%</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <h5 className="text-sm font-semibold text-gray-900">Đa ngôn ngữ</h5>
                <p className="text-xs text-gray-600">Hỗ trợ tiếng Việt và tiếng Anh</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h5 className="text-sm font-semibold text-gray-900">Xử lý nhanh</h5>
                <p className="text-xs text-gray-600">Tốc độ xử lý tối ưu</p>
              </div>
            </div>
          </div>

          {/* Tip */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h6 className="text-sm font-semibold text-blue-900">💡 Mẹo sử dụng</h6>
                <p className="text-xs text-blue-700 mt-1">Bạn có thể kéo thả file ở bất kỳ đâu trên màn hình để upload nhanh!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
