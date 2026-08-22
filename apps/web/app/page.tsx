'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { type Product } from '@repo/api';
import { api } from '@/lib/trpc/client/react';
import { ProductCard } from '@/components/products/ProductCard';
import { ArrowRight, Sparkles, Instagram, ArrowUpRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const { data: products = [] } = api.getProducts.useQuery();
  const heroRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubscribing(true);
    setTimeout(() => {
      setIsSubscribing(false);
      alert('Thank you for subscribing to JB51.');
    }, 1200);
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Immersive Hero Entrance Animations
      const tl = gsap.timeline();
      
      // Image reveal mask (clipping path)
      tl.fromTo('.hero-image-reveal', 
        { clipPath: 'inset(100% 0% 0% 0%)', scale: 1.1 },
        { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: 1.8, ease: 'power4.inOut' }
      );

      // Typography char reveal
      tl.from('.hero-title-reveal', {
        y: 60,
        opacity: 0,
        duration: 1.2,
        stagger: 0.1,
        ease: 'power4.out'
      }, '-=1.0');

      // Subtitle & CTAs fade
      tl.from('.hero-meta-reveal', {
        y: 20,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out'
      }, '-=0.8');

      // 2. ScrollTrigger reveals for sections
      gsap.utils.toArray('.scroll-reveal-img').forEach((img: any) => {
        gsap.fromTo(img, 
          { clipPath: 'inset(0% 100% 0% 0%)', scale: 1.1 },
          { 
            clipPath: 'inset(0% 0% 0% 0%)', 
            scale: 1,
            duration: 1.4, 
            ease: 'power3.inOut',
            scrollTrigger: {
              trigger: img,
              start: 'top 80%',
              toggleActions: 'play none none none'
            }
          }
        );
      });

      gsap.utils.toArray('.scroll-reveal-text').forEach((text: any) => {
        gsap.from(text, {
          y: 40,
          opacity: 0,
          duration: 1.0,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: text,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        });
      });

      // Parallax effect on editorial images
      gsap.utils.toArray('.parallax-img').forEach((img: any) => {
        gsap.to(img, {
          yPercent: -15,
          ease: 'none',
          scrollTrigger: {
            trigger: img,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
          }
        });
      });

    }, containerRef);

    return () => ctx.revert();
  }, [products]);

  // Derived collections
  const festiveProducts = products.filter(p => p.category === 'Velvet Edit' || p.category === 'Occasion Wear').slice(0, 4);
  const newArrivals = products.filter(p => p.newArrival).slice(0, 4);
  const bestSellers = products.filter(p => p.bestseller).slice(0, 4);
  const featuredProduct = products.find(p => p.featured) || products[0];

  return (
    <div ref={containerRef} className="flex flex-col w-full overflow-hidden bg-brand-cream relative">
      
      {/* Subtle Paisley pattern integrated on whole home background */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none paisley-bg" />

      {/* 3. Hero Section (Immersive, Layered Layout) */}
      <section ref={heroRef} className="relative h-[92vh] w-full flex items-center bg-brand-charcoal overflow-hidden -mt-32">
        <div className="absolute inset-0 hero-image-reveal overflow-hidden">
          <Image 
            src="https://picsum.photos/seed/editorial-indian/1920/1080" 
            alt="Timeless Indian contemporary fashion"
            fill
            priority
            className="object-cover opacity-50"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-charcoal/80 via-brand-charcoal/30 to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 w-full pt-32 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 flex flex-col items-start">
            <div className="hero-meta-reveal flex items-center gap-2 mb-4">
              <span className="h-[1px] w-8 bg-brand-gold" />
              <span className="text-[10px] tracking-[0.3em] uppercase text-brand-gold font-semibold">Festive Capsule Collection</span>
            </div>
            
            <h1 className="font-serif text-4xl sm:text-7xl lg:text-8xl text-brand-cream tracking-wide leading-[1.05] mb-8 overflow-hidden">
              <span className="block hero-title-reveal">Timeless Indian.</span>
              <span className="block hero-title-reveal text-brand-gold italic">Effortlessly Modern.</span>
            </h1>

            <p className="hero-meta-reveal text-brand-cream/80 text-sm md:text-base font-light tracking-wide max-w-lg mb-12 leading-relaxed">
              Curated silhouettes, refined traditional fabrics, and contemporary craftsmanship designed for every celebratory occasion.
            </p>

            <div className="hero-meta-reveal flex flex-col sm:flex-row gap-4 sm:gap-6 w-full sm:w-auto">
              <Link 
                href="/shop" 
                className="bg-brand-wine text-brand-cream hover:bg-brand-cream hover:text-brand-charcoal px-8 py-4 text-xs tracking-[0.2em] uppercase font-semibold transition-all duration-300 border border-brand-wine hover:border-brand-cream shadow-md text-center"
              >
                Shop Collection
              </Link>
              <Link 
                href="/shop?filter=new" 
                className="border border-brand-cream/30 text-brand-cream hover:text-brand-wine hover:bg-brand-cream hover:border-brand-cream px-8 py-4 text-xs tracking-[0.2em] uppercase font-semibold transition-all duration-300 text-center"
              >
                Explore New Drops
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Featured Collection (Asymmetric Editorial Showcase) */}
      {featuredProduct && (
        <section className="py-28 px-6 md:px-12 max-w-7xl mx-auto w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-5 flex flex-col justify-center order-2 lg:order-1 scroll-reveal-text">
              <span className="text-[10px] tracking-[0.3em] uppercase text-brand-saffron font-bold mb-4">Spotlight Craft</span>
              <h2 className="font-serif text-4xl md:text-5xl mb-6 text-brand-charcoal leading-tight">
                The Masterpiece: <br />
                <span className="text-brand-wine italic font-medium">{featuredProduct.name}</span>
              </h2>
              <p className="text-brand-charcoal/80 text-sm md:text-base leading-relaxed mb-8 font-light">
                {featuredProduct.description}
              </p>
              <div className="flex gap-12 mb-10 border-y border-brand-gold/15 py-6">
                <div>
                  <span className="block text-[10px] tracking-widest text-brand-gold uppercase font-medium mb-1">Textile</span>
                  <span className="font-serif text-sm text-brand-charcoal">{featuredProduct.fabric}</span>
                </div>
                <div>
                  <span className="block text-[10px] tracking-widest text-brand-gold uppercase font-medium mb-1">Silhouette</span>
                  <span className="font-serif text-sm text-brand-charcoal">{featuredProduct.fit}</span>
                </div>
              </div>
              <Link 
                href={`/product/${featuredProduct.slug}`} 
                className="self-start bg-brand-charcoal text-brand-cream hover:bg-brand-wine px-8 py-4 text-xs tracking-[0.2em] uppercase font-semibold transition-colors flex items-center gap-3 border border-brand-charcoal hover:border-brand-wine"
              >
                <span>View Masterpiece</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="lg:col-span-7 order-1 lg:order-2">
              <div className="relative aspect-[4/5] md:aspect-[16/10] overflow-hidden border border-brand-gold/15 p-2 bg-brand-beige scroll-reveal-img">
                <Image
                  src={featuredProduct.images[0]}
                  alt={featuredProduct.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Editorial Border Divider */}
      <div className="editorial-divider max-w-5xl mx-auto my-4" />

      {/* 5. New Arrivals (Horizontal scroll look on mobile) */}
      <section className="py-28 px-6 md:px-12 max-w-7xl mx-auto w-full relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 scroll-reveal-text">
          <div>
            <span className="text-[10px] tracking-[0.3em] uppercase text-brand-gold font-bold mb-3 block">Latest Additions</span>
            <h2 className="font-serif text-4xl mb-4 text-brand-charcoal">The New Drops</h2>
            <p className="text-brand-charcoal/60 text-xs md:text-sm max-w-md font-light">Fresh cuts in warm terracotta tones, handwoven silk details, and velvet edits.</p>
          </div>
          <Link href="/shop?filter=new" className="inline-flex items-center gap-1.5 text-xs tracking-[0.25em] uppercase text-brand-wine border-b border-brand-wine/25 hover:border-brand-wine pb-1 font-semibold transition-colors mt-4 md:mt-0">
            <span>Explore All</span>
            <ArrowUpRight size={12} />
          </Link>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 scroll-reveal-text">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 6. Editorial Indian Fashion Section (Visual Storyteller) */}
      <section className="bg-brand-wine text-brand-cream py-28 relative overflow-hidden">
        {/* Faint paisley overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none paisley-bg" />
        
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col lg:flex-row items-center gap-16 relative z-10">
          <div className="w-full lg:w-1/2 relative aspect-[4/5] overflow-hidden border border-brand-gold/25 p-2 bg-brand-charcoal scroll-reveal-img">
            <Image
              src="https://picsum.photos/seed/indian-craftsmanship/800/1000"
              alt="Craftsmanship and Heritage"
              fill
              className="object-cover opacity-80 parallax-img"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          <div className="w-full lg:w-1/2 flex flex-col justify-center scroll-reveal-text">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={14} className="text-brand-gold animate-spin" />
              <span className="text-[10px] tracking-[0.3em] uppercase text-brand-gold font-bold">The Heritage Narrative</span>
            </div>
            <h2 className="font-serif text-4xl md:text-5xl mb-8 text-brand-cream leading-tight">
              Woven Legacies. <br />
              Tailored for <span className="italic text-brand-gold font-medium">Grace.</span>
            </h2>
            <p className="text-brand-cream/80 text-xs md:text-sm leading-relaxed mb-6 font-light max-w-lg">
              Every garment in our collection represents a dialog between ancient Indian handlooms and clean, modern silhouettes. We cooperate directly with local weavers in Banaras, Chanderi, and Rajasthan to source authentic silk blends, breathable Chanderi, and rich velvets.
            </p>
            <p className="text-brand-cream/80 text-xs md:text-sm leading-relaxed mb-10 font-light max-w-lg">
              Designed as contemporary heirlooms, our suits feature subtle gold piping, hand-crafted Resham stitches, and delicate Zardozi detailing, making them fit for royal celebrations yet completely effortless to wear.
            </p>
            <Link 
              href="/about" 
              className="self-start border-b border-brand-gold pb-1 text-xs tracking-[0.2em] uppercase text-brand-gold hover:text-brand-cream hover:border-brand-cream font-semibold transition-colors"
            >
              Discover Our Craft
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Shop by Category (Gold / Wine Theme grids) */}
      <section className="py-28 px-6 md:px-12 max-w-7xl mx-auto w-full text-center relative z-10">
        <span className="text-[10px] tracking-[0.3em] uppercase text-brand-saffron font-bold mb-3 block">Silhouettes</span>
        <h2 className="font-serif text-4xl mb-16 text-brand-charcoal">Shop by Form</h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 scroll-reveal-text">
          {[
            { name: 'Formal Suits', slug: 'formal-suits', img: 'https://picsum.photos/seed/cat-formal/600/800' },
            { name: 'Anarkali Suits', slug: 'anarkali-suits', img: 'https://picsum.photos/seed/cat-anarkali/600/800' },
            { name: 'Silk Co-ords', slug: 'silk-co-ords', img: 'https://picsum.photos/seed/cat-coord-in/600/800' },
            { name: 'Velvet Edit', slug: 'velvet-edit', img: 'https://picsum.photos/seed/cat-velvet/600/800' },
            { name: 'Occasion Wear', slug: 'occasion-wear', img: 'https://picsum.photos/seed/cat-occasion/600/800' },
          ].map((cat, i) => (
            <Link key={i} href={`/shop?category=${cat.slug}`} className="group relative aspect-[3/4] overflow-hidden bg-brand-charcoal border border-brand-gold/10 p-1 block">
              <Image
                src={cat.img}
                alt={cat.name}
                fill
                className="object-cover opacity-75 group-hover:scale-105 group-hover:opacity-50 transition-all duration-1000"
                sizes="(max-width: 768px) 50vw, 20vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal/80 via-brand-charcoal/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-6 flex flex-col items-center">
                <span className="text-brand-cream font-serif text-lg tracking-wide group-hover:text-brand-gold transition-colors">{cat.name}</span>
                <span className="text-[8px] tracking-[0.25em] text-brand-cream/60 uppercase mt-1 opacity-0 group-hover:opacity-100 transition-all duration-300">Shop Edit</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Editorial Border Divider */}
      <div className="editorial-divider max-w-5xl mx-auto my-4" />

      {/* 8. Festive Collection (Curated Showcase) */}
      <section className="py-28 px-6 md:px-12 max-w-7xl mx-auto w-full relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 scroll-reveal-text">
          <div>
            <span className="text-[10px] tracking-[0.3em] uppercase text-brand-wine font-bold mb-3 block">Occasion Capsule</span>
            <h2 className="font-serif text-4xl mb-4 text-brand-charcoal">The Festive Edit</h2>
            <p className="text-brand-charcoal/60 text-xs md:text-sm max-w-md font-light">Rich handloom velvets and intricate gold embroidery for weddings and celebrations.</p>
          </div>
          <Link href="/shop?category=velvet-edit" className="inline-flex items-center gap-1.5 text-xs tracking-[0.25em] uppercase text-brand-wine border-b border-brand-wine/25 hover:border-brand-wine pb-1 font-semibold transition-colors mt-4 md:mt-0">
            <span>Explore Festive Edit</span>
            <ArrowUpRight size={12} />
          </Link>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 scroll-reveal-text">
          {festiveProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 9. Best Sellers */}
      <section className="py-28 px-6 md:px-12 bg-brand-beige/50 w-full relative z-10 border-y border-brand-gold/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 scroll-reveal-text">
            <div>
              <span className="text-[10px] tracking-[0.3em] uppercase text-brand-gold font-bold mb-3 block">Most Coveted</span>
              <h2 className="font-serif text-4xl mb-4 text-brand-charcoal">The Best Sellers</h2>
              <p className="text-brand-charcoal/60 text-xs md:text-sm max-w-md font-light font-sans">Our signature styles, back by popular demand. Meticulously hand-tailored.</p>
            </div>
            <Link href="/shop?filter=bestsellers" className="inline-flex items-center gap-1.5 text-xs tracking-[0.25em] uppercase text-brand-charcoal border-b border-brand-charcoal/25 hover:border-brand-wine pb-1 font-semibold transition-colors mt-4 md:mt-0">
              <span>View Bestsellers</span>
              <ArrowUpRight size={12} />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 scroll-reveal-text">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 10. Brand / Story Section */}
      <section className="py-28 px-6 text-center max-w-4xl mx-auto w-full relative z-10 scroll-reveal-text">
        <span className="text-brand-gold text-xs font-serif tracking-[0.25em] block mb-6">✦ THE JB51 PROMISE ✦</span>
        <h2 className="font-serif text-3xl md:text-5xl text-brand-charcoal mb-8 leading-tight">
          "Quiet luxury meets rich Indian heritage."
        </h2>
        <p className="text-brand-charcoal/70 text-sm md:text-base leading-relaxed font-light max-w-2xl mx-auto mb-10">
          We construct each ladies' suit using luxury textiles, ensuring precise fit, structure, and drape. No mass production. No compromises. Only timeless garments designed to stand out at any celebration or executive room.
        </p>
        <div className="editorial-divider max-w-xs mx-auto" />
      </section>

      {/* 11. Instagram / Social-style gallery */}
      <section className="py-16 px-6 md:px-12 w-full relative z-10 border-t border-brand-gold/15 bg-brand-cream">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 scroll-reveal-text">
            <span className="text-[10px] tracking-[0.3em] uppercase text-brand-gold font-bold mb-3 block">Social Lookbook</span>
            <h2 className="font-serif text-3xl text-brand-charcoal">As Styled on Instagram</h2>
            <Link href={`https://instagram.com/jb51clothing`} target="_blank" className="text-xs text-brand-wine font-medium hover:underline inline-flex items-center gap-1 mt-2">
              <Instagram size={12} />
              <span>@jb51clothing</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 scroll-reveal-text">
            {[
              'https://picsum.photos/seed/ig1/600/600',
              'https://picsum.photos/seed/ig2/600/600',
              'https://picsum.photos/seed/ig3/600/600',
              'https://picsum.photos/seed/ig4/600/600',
            ].map((img, i) => (
              <div key={i} className="group relative aspect-square overflow-hidden bg-brand-beige border border-brand-gold/10 p-1">
                <Image
                  src={img}
                  alt={`Social Lookbook ${i + 1}`}
                  fill
                  className="object-cover opacity-90 group-hover:scale-103 group-hover:opacity-100 transition-all duration-700"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-brand-wine/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Instagram size={20} className="text-brand-cream" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 12. Newsletter Section */}
      <section className="py-24 px-6 md:px-12 bg-brand-beige w-full border-t border-brand-gold/15 relative z-10 text-center">
        <div className="max-w-2xl mx-auto scroll-reveal-text">
          <span className="text-[10px] tracking-[0.3em] uppercase text-brand-gold font-bold mb-3 block">Bespoke Updates</span>
          <h2 className="font-serif text-3xl md:text-4xl text-brand-charcoal mb-4">Join The Club</h2>
          <p className="text-brand-charcoal/70 text-xs md:text-sm font-light mb-8 max-w-md mx-auto">
            Receive private capsule drops, handloom stories, and personal invitation styling advice straight to your inbox.
          </p>
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Your email address" 
              className="bg-brand-cream border border-brand-gold/25 px-5 py-3.5 text-xs md:text-sm text-brand-charcoal outline-none placeholder:text-brand-charcoal/40 flex-1"
              required
            />
            <button 
              type="submit" 
              disabled={isSubscribing}
              className="bg-brand-wine hover:bg-brand-charcoal text-brand-cream px-8 py-3.5 text-xs tracking-[0.2em] uppercase font-semibold transition-colors disabled:opacity-75 flex items-center justify-center min-w-[120px]"
            >
              {isSubscribing ? (
                <span className="w-4 h-4 border-2 border-brand-cream/30 border-t-brand-cream rounded-full animate-spin" />
              ) : (
                "Subscribe"
              )}
            </button>
          </form>
        </div>
      </section>

    </div>
  );
}
