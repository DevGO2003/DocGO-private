'use client'

import { 
  DocumentTextIcon,
  SparklesIcon,
  ShieldCheckIcon,
  BoltIcon,
  ChartBarIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'

export default function AboutSection() {
  return (
    <section id="about" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Về DocGO
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              DocGO là nền tảng quản lý tài liệu và hợp đồng thông minh, được phát triển 
              bởi DevGO2003 với công nghệ AI tiên tiến.
            </p>
            <p className="text-lg text-gray-600 mb-6">
              Chúng tôi giúp doanh nghiệp tối ưu hóa quy trình làm việc, tăng hiệu quả 
              và giảm thiểu rủi ro trong quản lý tài liệu.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <ChartBarIcon className="h-6 w-6 text-blue-600" />
                <span className="text-gray-700">Phân tích thông minh</span>
              </div>
              <div className="flex items-center space-x-2">
                <UserGroupIcon className="h-6 w-6 text-purple-600" />
                <span className="text-gray-700">Cộng tác nhóm</span>
              </div>
              <div className="flex items-center space-x-2">
                <BoltIcon className="h-6 w-6 text-green-600" />
                <span className="text-gray-700">Tự động hóa</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <DocumentTextIcon className="h-10 w-10 text-blue-600 mb-4" />
              <h4 className="font-bold text-gray-900 mb-2">Quản lý tập trung</h4>
              <p className="text-sm text-gray-600">Tất cả tài liệu ở một nơi</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg mt-8">
              <SparklesIcon className="h-10 w-10 text-purple-600 mb-4" />
              <h4 className="font-bold text-gray-900 mb-2">AI thông minh</h4>
              <p className="text-sm text-gray-600">Xử lý tự động với AI</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <ShieldCheckIcon className="h-10 w-10 text-green-600 mb-4" />
              <h4 className="font-bold text-gray-900 mb-2">An toàn tuyệt đối</h4>
              <p className="text-sm text-gray-600">Bảo mật chuẩn ngân hàng</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg mt-8">
              <ChartBarIcon className="h-10 w-10 text-orange-600 mb-4" />
              <h4 className="font-bold text-gray-900 mb-2">Báo cáo chi tiết</h4>
              <p className="text-sm text-gray-600">Thống kê và phân tích</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
