import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://letstryfoods.com').replace(/\/$/, '');

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/auth/',
          '/api/',
          '/admin/',
          '/profile/',
          '/address/',
          '/order-success/',
          '/payment-callback/',
          '/payment-failed/',
          '/track/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
