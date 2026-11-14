import type { MetadataRoute } from 'next'

function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'https://meshipiyo.app'
}

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl()

  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
