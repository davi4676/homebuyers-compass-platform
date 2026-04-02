const fs = require('fs')
const path = require('path')

/**
 * Next 14.0.x dev mode loads `/not-found` → `not-found_client-reference-manifest.js`, but the
 * compiler emits `/_not-found` → `_not-found_client-reference-manifest.js` only. Duplicate the
 * file with the `/not-found` manifest key so dev error rendering can resolve the module.
 */
function syncNotFoundClientReferenceManifest() {
  const dir = path.join(process.cwd(), '.next/server/app')
  const src = path.join(dir, '_not-found_client-reference-manifest.js')
  const dst = path.join(dir, 'not-found_client-reference-manifest.js')
  try {
    if (!fs.existsSync(src)) return
    let contents = fs.readFileSync(src, 'utf8')
    contents = contents.replace(/\["\/_not-found"\]/, '["/not-found"]')
    fs.writeFileSync(dst, contents)
  } catch {
    /* ignore — e.g. concurrent dev compile */
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: { ignoreBuildErrors: true },
  webpack: (config, { dev, isServer }) => {
    if (dev && isServer) {
      config.plugins.push({
        apply: (compiler) => {
          compiler.hooks.done.tap('SyncNotFoundClientReferenceManifest', syncNotFoundClientReferenceManifest)
        },
      })
    }
    return config
  },
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

