/** @type {import('next').NextConfig} */
// Load environment variables from env directory
require('./lib/env-loader');

const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['kafkajs', 'winston']
  },
  // output: 'standalone', // Comment out để tránh conflict trong development mode
  env: {
    AUTH_SERVICE_URL: process.env.AUTH_SERVICE_URL || 'http://authentication-identity-service:8001',
    CONTRACT_SERVICE_URL: process.env.CONTRACT_SERVICE_URL || 'http://contract-management-service:8002',
    AI_SERVICE_URL: process.env.AI_SERVICE_URL || 'http://ai-processing-service:8003',
    FILE_SERVICE_URL: process.env.FILE_SERVICE_URL || 'http://file-storage-asset-service:8018',
  },
  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: `${process.env.AUTH_SERVICE_URL || 'http://authentication-identity-service:8001'}/api/v1/authentication-identity-service/auth/:path*`,
      },
      {
        source: '/api/contracts/:path*',
        destination: `${process.env.CONTRACT_SERVICE_URL || 'http://contract-management-service:8002'}/api/v1/contract-management-service/contracts/:path*`,
      },
      {
        source: '/api/ai/:path*',
        destination: `${process.env.AI_SERVICE_URL || 'http://ai-processing-service:8003'}/api/v1/ai-processing-service/:path*`,
      },
      {
        source: '/api/files/:path*',
        destination: `${process.env.FILE_SERVICE_URL || 'http://file-storage-asset-service:8018'}/api/v1/file-storage-asset-service/:path*`,
      },
      {
        source: '/api/v1/:path*',
        destination: '/api/:path*'
      }
    ]
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-Requested-With'
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig
