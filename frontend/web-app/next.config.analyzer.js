/**
 * Bundle Analyzer Configuration
 * Sử dụng: ANALYZE=true npm run build
 */

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: true,
})

const nextConfig = require('./next.config.js')

module.exports = withBundleAnalyzer(nextConfig)
