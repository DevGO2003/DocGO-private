import React, { useState, useEffect } from 'react';
import Head from 'next/head';

interface ServiceStatus {
  status: string;
  service: string;
  timestamp: string;
  uptime: number;
  services: Record<string, boolean>;
  kafka: boolean;
  version: string;
}

export default function Home() {
  const [healthStatus, setHealthStatus] = useState<ServiceStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const checkHealth = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/health');
      const data = await response.json();
      setHealthStatus(data);
      setError(null);
    } catch (err) {
      setError('Failed to check health status');
      console.error('Health check error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600';
      case 'degraded':
        return 'text-yellow-600';
      case 'unhealthy':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getServiceStatusColor = (healthy: boolean) => {
    return healthy ? 'text-green-600' : 'text-red-600';
  };

  const getServiceStatusIcon = (healthy: boolean) => {
    return healthy ? '✅' : '❌';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>API Gateway BFF - DocGO</title>
        <meta name="description" content="API Gateway Backend for Frontend cho DocGO" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🚀 API Gateway BFF
          </h1>
          <p className="text-xl text-gray-600">
            Backend for Frontend cho hệ thống DocGO
          </p>
        </div>

        {/* Health Status Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-800">
              Trạng thái hệ thống
            </h2>
            <button
              onClick={checkHealth}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Đang kiểm tra...' : 'Kiểm tra lại'}
            </button>
          </div>

          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Đang kiểm tra trạng thái...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {healthStatus && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-700 mb-2">Trạng thái tổng thể</h3>
                  <p className={`text-lg font-semibold ${getStatusColor(healthStatus.status)}`}>
                    {healthStatus.status === 'healthy' ? '✅ Khỏe mạnh' : 
                     healthStatus.status === 'degraded' ? '⚠️ Suy giảm' : '❌ Không khỏe mạnh'}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-700 mb-2">Phiên bản</h3>
                  <p className="text-lg font-semibold text-gray-900">{healthStatus.version}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-700 mb-2">Thời gian hoạt động</h3>
                  <p className="text-lg font-semibold text-gray-900">
                    {Math.floor(healthStatus.uptime / 3600)}h {Math.floor((healthStatus.uptime % 3600) / 60)}m
                  </p>
                </div>
              </div>

              {/* Services Status - Sửa lỗi ở đây */}
              {healthStatus.services && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-700 mb-4">Trạng thái các dịch vụ</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(healthStatus.services).map(([service, healthy]) => (
                      <div key={service} className="flex items-center justify-between">
                        <span className="font-medium text-gray-700 capitalize">
                          {service.replace('-', ' ')}
                        </span>
                        <span className={`font-semibold ${getServiceStatusColor(healthy)}`}>
                          {getServiceStatusIcon(healthy)} {healthy ? 'Hoạt động' : 'Không hoạt động'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Kafka Status */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-700 mb-2">Trạng thái Kafka</h3>
                <p className={`text-lg font-semibold ${getServiceStatusColor(healthStatus.kafka)}`}>
                  {getServiceStatusIcon(healthStatus.kafka)} {healthStatus.kafka ? 'Kết nối thành công' : 'Không kết nối được'}
                </p>
              </div>

              <div className="text-sm text-gray-500 text-center">
                Cập nhật lần cuối: {new Date(healthStatus.timestamp).toLocaleString('vi-VN')}
              </div>
            </div>
          )}
        </div>

        {/* Service Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Authentication Service */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              🔐 Authentication Service
            </h3>
            <div className="space-y-2 text-gray-600">
              <p><strong>Port:</strong> 8001</p>
              <p><strong>URL:</strong> /api/v1/authentication-identity-service</p>
              <p><strong>Chức năng:</strong> Xác thực, đăng ký, đăng nhập</p>
              <p><strong>Tech:</strong> Spring Boot</p>
            </div>
          </div>

          {/* User Management Service */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              👥 User Management Service
            </h3>
            <div className="space-y-2 text-gray-600">
              <p><strong>Port:</strong> 8002</p>
              <p><strong>URL:</strong> /api/v1/user-management-service</p>
              <p><strong>Chức năng:</strong> Quản lý người dùng, phê duyệt</p>
              <p><strong>Tech:</strong> FastAPI</p>
            </div>
          </div>
        </div>

        {/* API Documentation */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            📚 Tài liệu API
          </h3>
          <div className="space-y-2 text-gray-600">
            <p>• <strong>Swagger UI:</strong> <a href="/docs" className="text-blue-600 hover:underline">/docs</a></p>
            <p>• <strong>Health Check:</strong> <a href="/api/health" className="text-blue-600 hover:underline">/api/health</a></p>
            <p>• <strong>API Base:</strong> <code className="bg-gray-100 px-2 py-1 rounded">/api/v1/</code></p>
          </div>
        </div>
      </main>
    </div>
  );
}