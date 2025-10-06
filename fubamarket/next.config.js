/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      // Production media served from Django
      {
        protocol: 'https',
        hostname: 'fubamarket.com',
        port: '',
        pathname: '/media/**',
      },
      // Local development media
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/media/**',
      },
      // Unsplash fallbacks
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://fubamarket.com/api/:path*',
      },
    ]
  },
}

module.exports = nextConfig