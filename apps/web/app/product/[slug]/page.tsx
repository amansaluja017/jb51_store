import { apiServer } from '@/lib/trpc/client/server';
import { notFound } from 'next/navigation';
import { ProductClient } from '@/components/products/ProductClient';
import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/utils';

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';

function cleanText(text?: string | null): string {
  if (!text) return '';
  return text
    .replace(/<[^>]*>?/gm, '')
    .replace(/[#*_~`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await apiServer.products.getBySlug.query({ slug });

  if (!product) {
    return {
      title: 'Product Not Found | JB51',
      robots: { index: false, follow: true },
    };
  }

  const rawDesc = cleanText(product.description);
  const description =
    rawDesc.length > 160 ? `${rawDesc.substring(0, 157)}...` : rawDesc || `Handcrafted ${product.name} tailored from luxury Indian textiles by JB51.`;

  const coverImage = product.images?.[0] || 'https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?auto=format&fit=crop&w=1200&q=80';

  return {
    title: `${product.name} | JB51`,
    description,
    keywords: [
      product.name,
      product.category,
      'JB51 suit',
      'handcrafted punjabi suit',
      'bespoke tailoring',
      'luxury indian suit',
    ],
    alternates: {
      canonical: `${SITE_URL}/product/${slug}`,
    },
    openGraph: {
      title: `${product.name} | JB51`,
      description,
      url: `${SITE_URL}/product/${slug}`,
      siteName: 'JB51',
      locale: 'en_IN',
      type: 'article',
      images: [
        {
          url: coverImage,
          width: 1000,
          height: 1250,
          alt: `${product.name} - JB51`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | JB51`,
      description,
      images: [coverImage],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await apiServer.products.getBySlug.query({ slug });

  if (!product) {
    notFound();
  }

  const sellingPrice = product.sellingPrice ?? product.discountPrice ?? product.price ?? 0;
  const inStock = product.variants?.some((v) => Number(v.stock) > 0) ?? true;
  const coverImage = product.images?.[0] || '';

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: cleanText(product.description),
    image: product.images || [coverImage],
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: 'JB51',
    },
    category: product.category,
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/product/${slug}`,
      priceCurrency: 'INR',
      price: sellingPrice,
      itemCondition: 'https://schema.org/NewCondition',
      availability: inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'JB51',
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd),
        }}
      />
      <ProductClient product={product} />
    </>
  );
}
