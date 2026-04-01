import { MetadataRoute } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/api/', '/saas/', '/dev-upgrade/', '/test/', '/test-page/'] },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
