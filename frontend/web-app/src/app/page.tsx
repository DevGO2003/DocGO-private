export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">DocGO</h1>
        <p className="text-xl text-gray-600 mb-8">
          Quản lý tài liệu và hợp đồng thông minh
        </p>
        <div className="space-y-4">
          <a
            href="/documents"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Quản lý tài liệu
          </a>
          <a
            href="/repositories"
            className="inline-block px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors ml-4"
          >
            Kho tài liệu
          </a>
        </div>
      </div>
    </div>
  )
}