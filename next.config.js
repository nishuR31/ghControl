/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'avatars.githubusercontent.com' }]
  },
  experimental: { serverComponentsExternalPackages: ['mongoose', 'ioredis', 'bullmq'] }
}
module.exports = nextConfig
