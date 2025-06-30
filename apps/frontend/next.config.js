/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsHmrCache: false, // 開発時のHMRキャッシュを無効化
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'data.otv.co.jp',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'flowbite.s3.amazonaws.com',
        port: '',
      },
    ],
  },
}

module.exports = nextConfig
