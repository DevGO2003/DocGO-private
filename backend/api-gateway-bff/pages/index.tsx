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

interface Microservice {
  name: string;
  port: number;
  technology: string;
  description: string;
  healthEndpoint: string;
  docsUrl: string;
  icon: string;
  color: string;
}

const MICROSERVICES: Microservice[] = [
  {
    name: 'API Gateway BFF',
    port: 8000,
    technology: 'Next.js (Node.js)',
    description: 'Điều hướng request, load balancing, authentication',
    healthEndpoint: '/health',
    docsUrl: '/docs',
    icon: '🚀',
    color: 'from-blue-500 to-purple-600'
  },
  {
    name: 'Authentication Identity Service',
    port: 8001,
    technology: 'Spring Boot (Java)',
    description: 'Xác thực, phân quyền, JWT token management',
    healthEndpoint: '/actuator/health',
    docsUrl: '/docs',
    icon: '🔐',
    color: 'from-green-500 to-teal-600'
  },
  {
    name: 'User Management Service',
    port: 8002,
    technology: 'FastAPI (Python)',
    description: 'Quản lý user, phân quyền, profile management',
    healthEndpoint: '/health',
    docsUrl: '/docs',
    icon: '👥',
    color: 'from-indigo-500 to-blue-600'
  },
  {
    name: 'Contract Management Service',
    port: 8003,
    technology: 'Spring Boot (Java)',
    description: 'Quản lý hợp đồng, workflow, approval',
    healthEndpoint: '/actuator/health',
    docsUrl: '/docs',
    icon: '📋',
    color: 'from-orange-500 to-red-600'
  },
  {
    name: 'Versioning Document History',
    port: 8004,
    technology: 'FastAPI (Python)',
    description: 'Quản lý phiên bản tài liệu, lịch sử thay đổi',
    healthEndpoint: '/health',
    docsUrl: '/docs',
    icon: '📚',
    color: 'from-purple-500 to-pink-600'
  },
  {
    name: 'Commenting Collaboration',
    port: 8005,
    technology: 'FastAPI (Python)',
    description: 'Bình luận, cộng tác, thảo luận',
    healthEndpoint: '/health',
    docsUrl: '/docs',
    icon: '💬',
    color: 'from-yellow-500 to-orange-600'
  },
  {
    name: 'Approval Workflow',
    port: 8006,
    technology: 'FastAPI (Python)',
    description: 'Quy trình phê duyệt, workflow management',
    healthEndpoint: '/health',
    docsUrl: '/docs',
    icon: '✅',
    color: 'from-emerald-500 to-green-600'
  },
  {
    name: 'Reminder Scheduler',
    port: 8007,
    technology: 'FastAPI (Python)',
    description: 'Lập lịch nhắc nhở, notification scheduling',
    healthEndpoint: '/health',
    docsUrl: '/docs',
    icon: '⏰',
    color: 'from-cyan-500 to-blue-600'
  },
  {
    name: 'E-Signature Integration',
    port: 8008,
    technology: 'FastAPI (Python)',
    description: 'Tích hợp chữ ký điện tử, digital signature',
    healthEndpoint: '/health',
    docsUrl: '/docs',
    icon: '✍️',
    color: 'from-violet-500 to-purple-600'
  },
  {
    name: 'Notification Service',
    port: 8009,
    technology: 'FastAPI (Python)',
    description: 'Gửi thông báo, email, SMS, push notification',
    healthEndpoint: '/health',
    docsUrl: '/docs',
    icon: '🔔',
    color: 'from-rose-500 to-red-600'
  },
  {
    name: 'Reporting Analytics',
    port: 8010,
    technology: 'FastAPI (Python)',
    description: 'Báo cáo, phân tích dữ liệu, dashboard',
    healthEndpoint: '/health',
    docsUrl: '/docs',
    icon: '📊',
    color: 'from-sky-500 to-blue-600'
  },
  {
    name: 'OCR Document Extraction',
    port: 8011,
    technology: 'FastAPI (Python)',
    description: 'OCR, trích xuất text từ hình ảnh/tài liệu',
    healthEndpoint: '/health',
    docsUrl: '/docs',
    icon: '🔍',
    color: 'from-lime-500 to-green-600'
  },
  {
    name: 'File Storage Asset',
    port: 8012,
    technology: 'FastAPI (Python)',
    description: 'Lưu trữ file, quản lý tài sản, malware scan',
    healthEndpoint: '/health',
    docsUrl: '/docs',
    icon: '💾',
    color: 'from-slate-500 to-gray-600'
  },
  {
    name: 'Audit Activity Log',
    port: 8013,
    technology: 'FastAPI (Python)',
    description: 'Ghi log hoạt động, audit trail, compliance',
    healthEndpoint: '/health',
    docsUrl: '/docs',
    icon: '📝',
    color: 'from-amber-500 to-yellow-600'
  },
  {
    name: 'Integration Connectors',
    port: 8014,
    technology: 'FastAPI (Python)',
    description: 'Kết nối hệ thống bên ngoài, API integration',
    healthEndpoint: '/health',
    docsUrl: '/docs',
    icon: '🔗',
    color: 'from-fuchsia-500 to-pink-600'
  },
  {
    name: 'Batch ETL Service',
    port: 8015,
    technology: 'FastAPI (Python)',
    description: 'Xử lý dữ liệu hàng loạt, ETL pipeline',
    healthEndpoint: '/health',
    docsUrl: '/docs',
    icon: '⚙️',
    color: 'from-stone-500 to-neutral-600'
  },
  {
    name: 'Health Monitoring Agent',
    port: 8016,
    technology: 'FastAPI (Python)',
    description: 'Giám sát sức khỏe hệ thống, metrics collection',
    healthEndpoint: '/health',
    docsUrl: '/docs',
    icon: '🏥',
    color: 'from-red-500 to-rose-600'
  },
  {
    name: 'AI Processing Service',
    port: 8017,
    technology: 'FastAPI (Python)',
    description: 'Xử lý AI, machine learning, NLP',
    healthEndpoint: '/health',
    docsUrl: '/docs',
    icon: '🤖',
    color: 'from-blue-500 to-indigo-600'
  },
  {
    name: 'General File Management',
    port: 8018,
    technology: 'FastAPI (Python)',
    description: 'Quản lý file tổng quát, metadata, organization',
    healthEndpoint: '/health',
    docsUrl: '/docs',
    icon: '📁',
    color: 'from-teal-500 to-cyan-600'
  }
];

export default function Home() {
  const [healthStatus, setHealthStatus] = useState<ServiceStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredServices, setFilteredServices] = useState(MICROSERVICES);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const filtered = MICROSERVICES.filter(service =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.technology.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredServices(filtered);
  }, [searchTerm]);

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
        return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'degraded':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'unhealthy':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getServiceStatusColor = (healthy: boolean) => {
    return healthy ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50';
  };

  const getServiceStatusIcon = (healthy: boolean) => {
    return healthy ? '✅' : '❌';
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white' 
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 text-gray-900'
    }`}>
      <Head>
        <title>DocGO - API Gateway BFF Dashboard</title>
        <meta name="description" content="Modern Dashboard cho API Gateway Backend for Frontend của DocGO" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Header */}
      <header className={`${darkMode ? 'bg-gray-800/80' : 'bg-white/80'} backdrop-blur-md border-b ${darkMode ? 'border-gray-700/50' : 'border-gray-200/50'} sticky top-0 z-50 transition-colors duration-300`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl font-bold">D</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  DocGO
                </h1>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>API Gateway BFF Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  darkMode 
                    ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                {darkMode ? '☀️' : '🌙'}
              </button>

              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm service..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`px-4 py-2 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
                <span className="absolute right-3 top-2.5 text-gray-400">🔍</span>
              </div>

              <button
                onClick={checkHealth}
                disabled={loading}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Đang kiểm tra...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>🔄 Kiểm tra lại</span>
                  </div>
                )}
              </button>
              
              <a
                href="/docs"
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                📚 API Docs
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-6 shadow-2xl animate-pulse">
            <span className="text-4xl">🚀</span>
          </div>
          <h1 className={`text-5xl font-bold mb-6 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Chào mừng đến với{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              DocGO
            </span>
          </h1>
          <p className={`text-xl max-w-3xl mx-auto leading-relaxed ${
            darkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Hệ thống quản lý tài liệu thông minh với 19 microservices, 
            được xây dựng trên nền tảng Spring Boot, FastAPI và Next.js
          </p>
          
          {/* Search Results Counter */}
          {searchTerm && (
            <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg inline-block">
              <span className="text-blue-800 dark:text-blue-200">
                🔍 Tìm thấy {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''} cho "{searchTerm}"
              </span>
            </div>
          )}
        </div>

        {/* System Health Overview */}
        {healthStatus && (
          <div className={`${darkMode ? 'bg-gray-800/80' : 'bg-white/80'} backdrop-blur-md rounded-2xl shadow-xl border ${darkMode ? 'border-gray-700/50' : 'border-gray-200/50'} p-8 mb-12 transition-colors duration-300`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-3xl font-bold flex items-center ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>
                <span className="mr-3">🏥</span>
                Trạng thái hệ thống
              </h2>
              <div className={`px-4 py-2 rounded-full border ${getStatusColor(healthStatus.status)}`}>
                <span className="font-semibold">
                  {healthStatus.status === 'healthy' ? '✅ Khỏe mạnh' : 
                   healthStatus.status === 'degraded' ? '⚠️ Suy giảm' : '❌ Không khỏe mạnh'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl p-6 border border-blue-200 dark:border-blue-700">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xl">📊</span>
                  </div>
                  <div>
                    <p className="text-sm text-blue-600 dark:text-blue-300 font-medium">Trạng thái</p>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 capitalize">{healthStatus.status}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-xl p-6 border border-green-200 dark:border-green-700">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xl">🔧</span>
                  </div>
                  <div>
                    <p className="text-sm text-green-600 dark:text-green-300 font-medium">Phiên bản</p>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">{healthStatus.version}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl p-6 border border-purple-200 dark:border-purple-700">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xl">⏱️</span>
                  </div>
                  <div>
                    <p className="text-sm text-purple-600 dark:text-purple-300 font-medium">Uptime</p>
                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                      {Math.floor(healthStatus.uptime / 3600)}h {Math.floor((healthStatus.uptime % 3600) / 60)}m
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 rounded-xl p-6 border border-orange-200 dark:border-orange-700">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xl">📡</span>
                  </div>
                  <div>
                    <p className="text-sm text-orange-600 dark:text-orange-300 font-medium">Kafka</p>
                    <p className={`text-2xl font-bold ${healthStatus.kafka ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'}`}>
                      {healthStatus.kafka ? '✅ Kết nối' : '❌ Lỗi'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Services Health Grid */}
            {healthStatus.services && (
              <div className={`${darkMode ? 'bg-gray-700/50' : 'bg-gray-50/50'} rounded-xl p-6`}>
                <h3 className={`text-xl font-semibold mb-4 flex items-center ${
                  darkMode ? 'text-white' : 'text-gray-800'
                }`}>
                  <span className="mr-2">🔍</span>
                  Trạng thái các dịch vụ
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {Object.entries(healthStatus.services).map(([service, healthy]) => (
                    <div
                      key={service}
                      className={`p-3 rounded-lg border transition-all duration-200 ${
                        healthy ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700' : 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-lg mb-1">{getServiceStatusIcon(healthy)}</div>
                        <div className={`text-xs font-medium capitalize ${
                          darkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {service.replace(/-/g, ' ')}
                        </div>
                        <div className={`text-xs font-semibold ${
                          healthy ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          {healthy ? 'Online' : 'Offline'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-center mt-6">
              <p className={`text-sm ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Cập nhật lần cuối: {new Date(healthStatus.timestamp).toLocaleString('vi-VN')}
              </p>
            </div>
          </div>
        )}

        {/* Microservices Grid */}
        <div className="mb-12">
          <h2 className={`text-3xl font-bold mb-8 text-center flex items-center justify-center ${
            darkMode ? 'text-white' : 'text-gray-800'
          }`}>
            <span className="mr-3">🏗️</span>
            Microservices Architecture
            <span className="ml-3 text-lg bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full">
              {filteredServices.length}/19
            </span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredServices.map((service, index) => (
              <div
                key={service.name}
                className={`group ${darkMode ? 'bg-gray-800/80' : 'bg-white/80'} backdrop-blur-md rounded-xl shadow-lg border ${darkMode ? 'border-gray-700/50' : 'border-gray-200/50'} p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer ${
                  selectedService === service.name ? 'ring-2 ring-blue-500' : ''
                } animate-fade-in-up`}
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => setSelectedService(selectedService === service.name ? null : service.name)}
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${service.color} rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-2xl">{service.icon}</span>
                </div>
                
                <h3 className={`text-lg font-semibold mb-2 text-center group-hover:text-blue-600 transition-colors duration-200 ${
                  darkMode ? 'text-white' : 'text-gray-800'
                }`}>
                  {service.name}
                </h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Port:</span>
                    <span className={`px-2 py-1 rounded text-xs font-mono ${
                      darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'
                    }`}>{service.port}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Tech:</span>
                    <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">{service.technology}</span>
                  </div>
                </div>
                
                <p className={`text-xs mt-3 text-center leading-relaxed ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {service.description}
                </p>

                {/* Expanded Details */}
                {selectedService === service.name && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Health:</span>
                      <a 
                        href={`http://localhost:${service.port}${service.healthEndpoint}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {service.healthEndpoint}
                      </a>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Docs:</span>
                      <a 
                        href={`http://localhost:${service.port}${service.docsUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        /docs
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Technology Distribution */}
        <div className={`${darkMode ? 'bg-gray-800/80' : 'bg-white/80'} backdrop-blur-md rounded-2xl shadow-xl border ${darkMode ? 'border-gray-700/50' : 'border-gray-200/50'} p-8 mb-12 transition-colors duration-300`}>
          <h2 className={`text-3xl font-bold mb-8 text-center flex items-center justify-center ${
            darkMode ? 'text-white' : 'text-gray-800'
          }`}>
            <span className="mr-3">⚡</span>
            Phân bố công nghệ
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-bounce">
                <span className="text-3xl">☕</span>
              </div>
              <h3 className={`text-xl font-semibold mb-2 ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>Spring Boot (Java)</h3>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">2</p>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Services</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
                <span className="text-3xl">🐍</span>
              </div>
              <h3 className={`text-xl font-semibold mb-2 ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>FastAPI (Python)</h3>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">16</p>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Services</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-spin">
                <span className="text-3xl">⚛️</span>
              </div>
              <h3 className={`text-xl font-semibold mb-2 ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>Next.js (Node.js)</h3>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">1</p>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Service</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className={`${darkMode ? 'bg-gray-800/80' : 'bg-white/80'} backdrop-blur-md rounded-2xl shadow-xl border ${darkMode ? 'border-gray-700/50' : 'border-gray-200/50'} p-8 transition-colors duration-300`}>
          <h2 className={`text-3xl font-bold mb-8 text-center flex items-center justify-center ${
            darkMode ? 'text-white' : 'text-gray-800'
          }`}>
            <span className="mr-3">🚀</span>
            Hành động nhanh
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <a
              href="/docs"
              className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6 text-center hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200">📚</div>
              <h3 className="text-lg font-semibold mb-2">API Documentation</h3>
              <p className="text-blue-100 text-sm">Xem tài liệu API đầy đủ</p>
            </a>
            
            <a
              href="/api/health"
              className="group bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl p-6 text-center hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200">🏥</div>
              <h3 className="text-lg font-semibold mb-2">Health Check</h3>
              <p className="text-emerald-100 text-sm">Kiểm tra trạng thái hệ thống</p>
            </a>
            
            <a
              href="/swagger"
              className="group bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl p-6 text-center hover:from-orange-700 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200">🔍</div>
              <h3 className="text-lg font-semibold mb-2">Swagger UI</h3>
              <p className="text-orange-100 text-sm">Giao diện test API</p>
            </a>
            
            <a
              href="https://github.com/DevGO2003/DocGO"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-gradient-to-r from-gray-600 to-slate-600 text-white rounded-xl p-6 text-center hover:from-gray-700 hover:to-slate-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200">🐙</div>
              <h3 className="text-lg font-semibold mb-2">GitHub</h3>
              <p className="text-gray-100 text-sm">Xem source code</p>
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={`${darkMode ? 'bg-gray-800/80' : 'bg-white/80'} backdrop-blur-md border-t ${darkMode ? 'border-gray-700/50' : 'border-gray-200/50'} mt-16 transition-colors duration-300`}>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className={`mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              © 2024 DocGO - Hệ thống quản lý tài liệu thông minh
            </p>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Được xây dựng với ❤️ bởi DevGO2003 Team
            </p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}