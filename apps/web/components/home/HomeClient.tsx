'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/trpc/client/react';

// Imported Reusable Components
import { HeroSlider } from '@/components/home/HeroSlider';
import { FeatureBadges } from '@/components/home/FeatureBadges';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { BespokeBanner } from '@/components/home/BespokeBanner';
import { TrendingGrid } from '@/components/home/TrendingGrid';
import { ProductRow } from '@/components/home/ProductRow';
import { FlashSale } from '@/components/home/FlashSale';
import { Testimonials } from '@/components/home/Testimonials';
import { SeasonalPrivilege } from '@/components/home/SeasonalPrivilege';
import { Faqs } from '@/components/home/Faqs';
import { InstagramFeed } from '@/components/home/InstagramFeed';

import type { SiteConfigData, HeroSlideItem } from '@/lib/site-config';

interface HomeClientProps {
  initialConfig?: SiteConfigData;
}

const DEFAULT_SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?auto=format&fit=crop&w=2000&q=90',
    tagline: 'NEW COLLECTION',
    title: 'Elevate Your Everyday Style',
    subtitle: 'Discover timeless silhouettes crafted for comfort, designed for elegance.',
    badgeProduct: {
      name: 'Ivory Chanderi Co-ord',
      price: 16800,
      img: 'https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?auto=format&fit=crop&w=150&h=150&q=80',
      slug: 'ivory-chanderi-silk-coord'
    }
  },
  {
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=2000&q=90',
    tagline: 'THE FESTIVE EDIT',
    title: 'Heritage Indian Silhouettes',
    subtitle: 'Meticulously crafted traditional ensembles, updated for modern celebrations.',
    badgeProduct: {
      name: 'Crimson Velvet Zardozi',
      price: 32000,
      img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=150&h=150&q=80',
      slug: 'crimson-velvet-zardozi-suit'
    }
  },
  {
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=2000&q=90',
    tagline: 'HANDCRAFTED LUXURY',
    title: 'Rooted in Heritage Craft',
    subtitle: 'Pure textiles, organic colors, and hand-woven stories from across India.',
    badgeProduct: {
      name: 'Emerald Banarasi Suit',
      price: 24500,
      img: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=150&h=150&q=80',
      slug: 'emerald-banarasi-suit'
    }
  },
];

export function HomeClient({ initialConfig }: HomeClientProps) {
  // Fetch products in focused batches instead of getting entire database at once
  const { data: trendingData } = api.products.getPaginated.useQuery({ limit: 12 });
  const { data: bestSellerData } = api.products.getPaginated.useQuery({ filter: 'bestseller', limit: 6 });
  const { data: newArrivalData } = api.products.getPaginated.useQuery({ filter: 'new', limit: 6 });

  const products = trendingData?.items || [];
  const bestSellerProducts = (bestSellerData?.items || []).slice(0, 4);
  const newArrivalProducts = (newArrivalData?.items || []).slice(0, 4);
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = (initialConfig?.heroSlides && initialConfig.heroSlides.length > 0)
    ? initialConfig.heroSlides.map((s: HeroSlideItem) => ({
        image: s.image,
        tagline: s.tagline,
        title: s.title,
        subtitle: s.subtitle,
        badgeProduct: s.badgeProduct,
      }))
    : DEFAULT_SLIDES;

  // Carousel slide timer
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="flex flex-col w-full overflow-hidden bg-white text-zinc-800 font-sans">
      {/* 1. Hero Section (Visual Editorial Carousel with Floating Badges) */}
      <HeroSlider 
        slides={slides} 
        currentSlide={currentSlide} 
        setCurrentSlide={setCurrentSlide} 
      />

      {/* 2. Trust Badges Row */}
      <FeatureBadges />

      {/* 3. Shop by Categories Grid */}
      <CategoryGrid />

      {/* 3.5 Editorial Advertisement Section */}
      <BespokeBanner config={initialConfig?.adBanner} />

      {/* 4. Curated Silhouettes Curation tabs */}
      <TrendingGrid products={products} />

      {/* 5. New Arrivals Grid (Shown only if new arrival products exist) */}
      {newArrivalProducts.length > 0 && (
        <ProductRow 
          title="New Arrivals"
          tagline="LATEST DROPS"
          products={newArrivalProducts}
          viewAllHref="/shop?filter=new"
          viewAllText="View All New"
        />
      )}

      {/* 6. Interactive Flash Sale Banner Section */}
      <FlashSale config={initialConfig?.saleSection} />

      {/* 7. Best Sellers Grid (Shown only if bestseller products exist) */}
      {bestSellerProducts.length > 0 && (
        <ProductRow 
          title="Best Sellers"
          tagline="TRENDING BESTSELLERS"
          products={bestSellerProducts}
          viewAllHref="/shop?filter=bestseller"
          viewAllText="View All Bestsellers"
        />
      )}

      {/* 8. Testimonials Section */}
      <Testimonials />

      {/* 8.5 Seasonal Discount Advertisement Section */}
      <SeasonalPrivilege />

      {/* 9. Frequently Asked Questions */}
      <Faqs items={initialConfig?.faqs} />

      {/* 10. Follow us on Instagram Grid */}
      <InstagramFeed />
    </div>
  );
}
