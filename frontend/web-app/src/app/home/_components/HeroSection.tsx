import Link from 'next/link'
import { SparklesIcon, ArrowRightIcon } from '@heroicons/react/24/outline'

export default function HeroSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full mb-8">
          <SparklesIcon className="h-5 w-5" />
          <span className="text-sm font-medium">Quản lý tài liệu thông minh với AI</span>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Quản lý{' '}
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            tài liệu & hợp đồng
          </span>
          <br />
          dễ dàng hơn bao giờ hết
        </h1>
        
        <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
          DocGO giúp doanh nghiệp quản lý tài liệu, hợp đồng một cách thông minh với 
          công nghệ AI, tự động hóa quy trình và tăng hiệu quả công việc
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link 
            href="/repositories"
            className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl transition transform hover:scale-105 flex items-center space-x-2"
          >
            <span>Dùng thử Demo</span>
            <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-1 transition" />
          </Link>
          <Link 
            href="#features"
            className="bg-white text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg border-2 border-gray-200 hover:border-blue-600 hover:text-blue-600 transition"
          >
            Tìm hiểu thêm
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-3 gap-8 max-w-3xl mx-auto">
          <div>
            <div className="text-4xl font-bold text-blue-600">1000+</div>
            <div className="text-gray-600 mt-1">Tài liệu</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-purple-600">99%</div>
            <div className="text-gray-600 mt-1">Chính xác</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-green-600">5x</div>
            <div className="text-gray-600 mt-1">Nhanh hơn</div>
          </div>
        </div>
      </div>
    </section>
  )
}
