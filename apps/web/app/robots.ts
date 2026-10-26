import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/utils';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/_next/',
          '/search/',
          '/wishlist',
        ],
      },
      {
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'ClaudeBot',
          'Claude-Web',
          'PerplexityBot',
          'Google-Extended',
          'Applebot-Extended',
          'cohere-ai',
          'Bytespider',
          'CCBot',
          'Diffbot',
          'FacebookBot',
          'Amazonbot',
        ],
        allow: [
          '/',
          '/shop',
          '/product/',
          '/support',
          '/terms-of-service',
          '/privacy-policy',
        ],
        disallow: [
          '/api/',
          '/_next/',
          '/search/',
          '/wishlist',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
