/** @type {import('next').NextConfig} */
const nextConfig = {
  // App Router configuration
  experimental: {
    appDir: true,
  },
  // Hot reload optimization
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: [
          '**/node_modules/**',
          '**/.git/**',
          '**/System Volume Information/**',
          '**/P:/System Volume Information/**',
          '**/.next/**'
        ]
      }
    }
    
    // PDF.js webpack configuration
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    }
    
    return config
  },
  images: {
    domains: ['localhost'],
  },
  env: {
    CUSTOM_KEY: 'my-value',
  },
  async redirects() {
    return [
      { source: '/dashboard/hop-dong', destination: '/dashboard/contracts', permanent: false },
      { source: '/dashboard/tao-hop-dong', destination: '/dashboard/upload-document', permanent: false },
      { source: '/dashboard/chu-ky-dien-tu', destination: '/dashboard/e-signature', permanent: false },
      { source: '/dashboard/binh-luan-cong-tac', destination: '/dashboard/collaboration-comments', permanent: false },
      { source: '/dashboard/phien-ban-hop-dong', destination: '/dashboard/contract-versions', permanent: false },
      { source: '/dashboard/luong-phe-duyet', destination: '/dashboard/approval-workflow', permanent: false },
      { source: '/dashboard/quyen-sua-theo-vai-tro', destination: '/dashboard/role-based-permissions', permanent: false },
      { source: '/dashboard/da-duyet', destination: '/dashboard/approved', permanent: false },
      { source: '/dashboard/thong-ke', destination: '/dashboard/analytics', permanent: false },
      { source: '/dashboard/bao-cao', destination: '/dashboard/reports', permanent: false },
      { source: '/dashboard/quan-ly-nguoi-dung', destination: '/dashboard/user-management', permanent: false },
      { source: '/dashboard/phe-duyet-tai-khoan', destination: '/dashboard/account-approval', permanent: false },
      { source: '/dashboard/thong-bao', destination: '/dashboard/notifications', permanent: false },
      { source: '/dashboard/lich', destination: '/dashboard/calendar', permanent: false },
      { source: '/dashboard/lich-su-hoat-dong', destination: '/dashboard/activity-history', permanent: false },
      { source: '/dashboard/tro-giup-ho-tro', destination: '/dashboard/help-support', permanent: false },
      { source: '/dashboard/cai-dat', destination: '/dashboard/settings', permanent: false },
      { source: '/dashboard/huong-dan', destination: '/dashboard/guide', permanent: false },
      // Remove redirect - let /repositories/:id/files render its own content
    ]
  },
  async rewrites() {
    return [
      // Proxy API calls to backend
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://api-gateway:8000'}/api/:path*`,
      },
      // Alias legacy documents route to repositories/1
      {
        source: '/documents',
        destination: '/repositories/1',
      },
    ]
  },
  // Ensure static files are served correctly
  async headers() {
    return [
      {
        source: '/locales/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Content-Type',
            value: 'application/json; charset=utf-8',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
