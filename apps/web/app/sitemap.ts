import type { MetadataRoute } from 'next';
import { apiServer } from '@/lib/trpc/client/server';
import { SITE_URL } from '@/lib/utils';

export const revalidate = 3600; // Revalidate sitemap every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const currentDate = new Date();

  // Core static storefront routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/shop`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/support`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/terms-of-service`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/privacy-policy`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Specific collection category filters
  const categories = [
    'Formal Suits',
    'Anarkali Suits',
    'Silk Co-ords',
    'Velvet Edit',
    'Occasion Wear',
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${SITE_URL}/shop?category=${encodeURIComponent(cat)}`,
    lastModified: currentDate,
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  // Dynamic product detail routes fetched from database/API
  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const products = await apiServer.products.getAll.query();
    if (Array.isArray(products)) {
      productRoutes = products
        .filter((p) => p && p.isListed !== false && p.slug)
        .map((p) => {
          let lastMod = currentDate;
          if (p.createdAt) {
            const d = new Date(p.createdAt);
            if (!isNaN(d.getTime())) lastMod = d;
          }

          return {
            url: `${SITE_URL}/product/${p.slug}`,
            lastModified: lastMod,
            changeFrequency: 'weekly' as const,
            priority: p.bestseller || p.featured ? 0.9 : 0.8,
          };
        });
    }
  } catch {
    // Continue with static routes if API server is not available during build
  }

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
