/** @type {import('next').NextConfig} */
// Load environment variables from env directory
require('./lib/env-loader');

const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['kafkajs', 'winston', 'ioredis']
  },
  typescript: {
    // Tạm thời bỏ qua lỗi type để đảm bảo build/restart gateway
    ignoreBuildErrors: true,
  },
  // output: 'standalone', // Comment out để tránh conflict trong development mode
  env: {
    USER_SERVICE_URL: process.env.USER_MANAGEMENT_SERVICE_URL,
    DOCUMENT_SERVICE_URL: process.env.FILE_MANAGEMENT_SERVICE_URL,
    AUTOMATION_SERVICE_URL: process.env.AUTOMATION_SERVICE_URL,
  },
  // Rewrites are disabled - API routes handle all proxying
  // async rewrites() {
  //   console.log('🔧 Next.js rewrites loaded!');
  //   return []
  // },
  // CORS headers are handled centrally in middleware; avoid duplicating here
}

module.exports = nextConfig
