/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: { ignoreBuildErrors: true },
  async redirects() {
    return [
      { source: '/dashboard', destination: '/customized-journey', permanent: true },
      { source: '/journey', destination: '/customized-journey', permanent: true },
      { source: '/action-plan', destination: '/customized-journey', permanent: true },
      { source: '/quiz-starter', destination: '/quiz', permanent: true },
      { source: '/homebuyer', destination: '/', permanent: true },
      { source: '/marketplace', destination: '/resources', permanent: false },
    ]
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]
  },
}

module.exports = nextConfig

