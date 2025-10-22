import Link from 'next/link'
import { ArrowRightIcon } from '@heroicons/react/24/outline'

export default function DemoSection() {
  return (
    <section id="demo" className="py-20 bg-gradient-to-br from-blue-600 to-purple-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl font-bold text-white mb-6">
          Sẵn sàng trải nghiệm?
        </h2>
        <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
          Dùng thử ngay Demo của DocGO và khám phá sức mạnh của quản lý tài liệu thông minh
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/repositories"
            className="group bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl transition transform hover:scale-105 flex items-center justify-center space-x-2"
          >
            <span>Dùng thử Demo miễn phí</span>
            <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-1 transition" />
          </Link>
          <Link 
            href="/auth/register"
            className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-blue-600 transition"
          >
            Đăng ký tài khoản
          </Link>
        </div>
      </div>
    </section>
  )
}
