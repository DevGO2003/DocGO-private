import Link from 'next/link'
import { DocumentTextIcon } from '@heroicons/react/24/outline'

export default function LandingHeader() {
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <DocumentTextIcon className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              DocGO
            </span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-700 hover:text-blue-600 transition">
              Tính năng
            </a>
            <a href="#demo" className="text-gray-700 hover:text-blue-600 transition">
              Demo
            </a>
            <a href="#about" className="text-gray-700 hover:text-blue-600 transition">
              Giới thiệu
            </a>
            <Link 
              href="/auth/login"
              className="text-blue-600 hover:text-blue-700 font-medium transition"
            >
              Đăng nhập
            </Link>
            <Link 
              href="/auth/register"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition transform hover:scale-105"
            >
              Đăng ký ngay
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
