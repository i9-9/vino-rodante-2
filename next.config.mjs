/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'vinorodante.com',
          },
        ],
        destination: 'https://www.vinorodante.com/:path*',
        permanent: true,
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS, PATCH'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-Requested-With, Content-Type, Authorization, apikey, x-client-info, x-supabase-api-version'
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true'
          }
        ]
      }
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    domains: ['vino-rodante.s3.sa-east-1.amazonaws.com', 'drive.google.com'],
    // Optimizaciones para reducir egress
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1 año - máximo cache
    deviceSizes: [640, 750, 828, 1080, 1200, 1920], // Reducir tamaños
    imageSizes: [16, 32, 48, 64, 96, 128, 256], // Reducir tamaños
    unoptimized: false,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb' // Aumentado para banners de alta resolución
    }
  },
}

export default nextConfig
