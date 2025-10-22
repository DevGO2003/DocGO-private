'use client'

import Link from 'next/link'
import { DocumentTextIcon } from '@heroicons/react/24/outline'

export default function LandingFooter() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <DocumentTextIcon className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">DocGO</span>
            </div>
            <p className="text-sm">
              Quản lý tài liệu và hợp đồng thông minh với công nghệ AI
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Sản phẩm</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#features" className="hover:text-white transition">Tính năng</a></li>
              <li><a href="#demo" className="hover:text-white transition">Demo</a></li>
              <li><Link href="/repositories" className="hover:text-white transition">Repositories</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Công ty</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#about" className="hover:text-white transition">Về chúng tôi</a></li>
              <li><a href="#" className="hover:text-white transition">Liên hệ</a></li>
              <li><a href="#" className="hover:text-white transition">Blog</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Hỗ trợ</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition">Trợ giúp</a></li>
              <li><a href="#" className="hover:text-white transition">Tài liệu</a></li>
              <li><Link href="/auth/login" className="hover:text-white transition">Đăng nhập</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; 2025 DevGO2003. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
