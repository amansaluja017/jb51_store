'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
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

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const { data: products = [] } = api.products.getAll.useQuery();
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
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

  // Carousel slide timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  // GSAP animations setup
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      tl.fromTo('.hero-mask',
        { clipPath: 'inset(100% 0% 0% 0%)', scale: 1.05 },
        { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: 1.5, ease: 'power4.inOut' }
      );

      // Scroll reveal animations: luxurious bottom-to-top shutter reveal with image scale zoom-out
      gsap.utils.toArray('.fabric-reveal').forEach((el: any) => {
        const img = el.querySelector('img');

        gsap.fromTo(el,
          { clipPath: 'inset(100% 0% 0% 0%)' },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: 1.4,
            ease: 'power4.inOut',
            scrollTrigger: {
              trigger: el,
              start: 'top 90%',
              toggleActions: 'play none none none'
            }
          }
        );

        if (img) {
          gsap.fromTo(img,
            { scale: 1.15 },
            {
              scale: 1,
              duration: 1.6,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: el,
                start: 'top 90%',
                toggleActions: 'play none none none'
              }
            }
          );
        }
      });

      gsap.utils.toArray('.fade-up').forEach((el: any) => {
        gsap.from(el, {
          y: 25,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 90%',
            toggleActions: 'play none none none'
          }
        });
      });

      gsap.utils.toArray('.parallax-bg').forEach((bg: any) => {
        gsap.to(bg, {
          yPercent: 12,
          ease: 'none',
          scrollTrigger: {
            trigger: bg.parentElement,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
          }
        });
      });

      gsap.from('.silhouette-header', {
        y: 30,
        opacity: 0,
        duration: 1.0,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '#curated-silhouettes',
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Slide change text animation to prevent FOUT and animate on slide transitions
  useEffect(() => {
    const activeText = `.hero-slide-${currentSlide} .hero-text-stagger`;
    
    gsap.fromTo(activeText,
      { y: 35, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.12,
        ease: 'power3.out',
        overwrite: 'auto'
      }
    );
  }, [currentSlide]);

  const bestSellerProducts = products.filter(p => p.isListed !== false && p.bestseller).slice(0, 4);
  const newArrivalProducts = products.filter(p => p.isListed !== false && p.newArrival).slice(0, 4);

  return (
    <div ref={containerRef} className="flex flex-col w-full overflow-hidden bg-white text-zinc-800 font-sans">
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
      <BespokeBanner />

      {/* 4. Curated Silhouettes Curation tabs */}
      <TrendingGrid products={products} />

      {/* 5. New Arrivals Grid */}
      <ProductRow 
        title="New Arrivals"
        tagline="LATEST DROPS"
        products={newArrivalProducts}
        viewAllHref="/shop?filter=new"
        viewAllText="View All New"
      />

      {/* 6. Interactive Flash Sale Banner Section */}
      <FlashSale />

      {/* 7. Best Sellers Grid */}
      <ProductRow 
        title="Best Sellers"
        tagline="TRENDING BESTSELLERS"
        products={bestSellerProducts}
        viewAllHref="/shop?filter=bestseller"
        viewAllText="View All Bestsellers"
      />

      {/* 8. Testimonials Section */}
      <Testimonials />

      {/* 8.5 Seasonal Discount Advertisement Section */}
      <SeasonalPrivilege />

      {/* 9. Frequently Asked Questions */}
      <Faqs />

      {/* 10. Follow us on Instagram Grid */}
      <InstagramFeed />
    </div>
  );
}
