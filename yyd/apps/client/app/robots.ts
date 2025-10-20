import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://yesyoudeserve.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/portal', '/api/', '/admin'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
