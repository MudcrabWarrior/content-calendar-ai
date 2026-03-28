import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      disallow: ['/api/', '/success'],
      allow: '/',
    },
    sitemap: 'https://content-calendar-ai.vercel.app/sitemap.xml',
  };
}
