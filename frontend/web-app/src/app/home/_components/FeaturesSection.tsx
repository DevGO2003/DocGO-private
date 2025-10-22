import { 
  SparklesIcon, 
  ShieldCheckIcon, 
  BoltIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Tính năng nổi bật
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Giải pháp toàn diện cho quản lý tài liệu và hợp đồng của doanh nghiệp
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl border-2 border-gray-100 hover:border-blue-300 hover:shadow-xl transition">
            <div className="h-14 w-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
              <SparklesIcon className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              AI Xử lý tự động
            </h3>
            <p className="text-gray-600 mb-6">
              Trích xuất thông tin từ tài liệu tự động, phân tích hợp đồng thông minh với AI
            </p>
            <ul className="space-y-2">
              <li className="flex items-center text-gray-700">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                OCR chính xác cao
              </li>
              <li className="flex items-center text-gray-700">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                Tóm tắt nội dung
              </li>
              <li className="flex items-center text-gray-700">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                Phân loại tự động
              </li>
            </ul>
          </div>

          <div className="p-8 rounded-2xl border-2 border-gray-100 hover:border-purple-300 hover:shadow-xl transition">
            <div className="h-14 w-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
              <ShieldCheckIcon className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Bảo mật cao
            </h3>
            <p className="text-gray-600 mb-6">
              Mã hóa dữ liệu, phân quyền chi tiết, audit log đầy đủ
            </p>
            <ul className="space-y-2">
              <li className="flex items-center text-gray-700">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                Mã hóa end-to-end
              </li>
              <li className="flex items-center text-gray-700">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                Phân quyền linh hoạt
              </li>
              <li className="flex items-center text-gray-700">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                Audit trail đầy đủ
              </li>
            </ul>
          </div>

          <div className="p-8 rounded-2xl border-2 border-gray-100 hover:border-green-300 hover:shadow-xl transition">
            <div className="h-14 w-14 bg-green-100 rounded-xl flex items-center justify-center mb-6">
              <BoltIcon className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Tốc độ cao
            </h3>
            <p className="text-gray-600 mb-6">
              Xử lý nhanh chóng, tìm kiếm tức thì, đồng bộ real-time
            </p>
            <ul className="space-y-2">
              <li className="flex items-center text-gray-700">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                Xử lý nhanh
              </li>
              <li className="flex items-center text-gray-700">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                Tìm kiếm tức thì
              </li>
              <li className="flex items-center text-gray-700">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                Sync real-time
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
