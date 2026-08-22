'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { api } from '@/lib/trpc/client/react';
import { ProductCard } from '@/components/products/ProductCard';
import { ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const { data: products = [] } = api.products.getAll.useQuery();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Entrance Animations (Hero)
      const tl = gsap.timeline();

      tl.fromTo('.hero-mask',
        { clipPath: 'inset(100% 0% 0% 0%)', scale: 1.05 },
        { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: 1.8, ease: 'power4.inOut' }
      );

      tl.from('.hero-text-stagger', {
        y: 40,
        opacity: 0,
        duration: 1.2,
        stagger: 0.15,
        ease: 'power3.out'
      }, '-=1.0');

      // 2. Scroll Animations (Fabric Unfolding, Parallax)
      gsap.utils.toArray('.fabric-reveal').forEach((el: any) => {
        gsap.fromTo(el,
          { clipPath: 'inset(0% 100% 0% 0%)' },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: 1.4,
            ease: 'power3.inOut',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      });

      gsap.utils.toArray('.fade-up').forEach((el: any) => {
        gsap.from(el, {
          y: 30,
          opacity: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        });
      });

      gsap.utils.toArray('.parallax-bg').forEach((bg: any) => {
        gsap.to(bg, {
          yPercent: 15,
          ease: 'none',
          scrollTrigger: {
            trigger: bg.parentElement,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
          }
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, [products]);

  const featuredProduct = products.find(p => p.featured) || products[0];
  const collectionProducts = products.filter(p => p.id !== featuredProduct?.id).slice(0, 2);
  const festiveProducts = products.filter(p => p.category === 'Velvet Edit' || p.category === 'Occasion Wear').slice(0, 3);

  return (
    <div ref={containerRef} className="flex flex-col w-full overflow-hidden bg-brand-ivory text-brand-brown">

      {/* 1. Hero Section (Asymmetric Editorial) */}
      <section className="relative min-h-[90vh] w-full flex items-center pt-24 pb-12 overflow-hidden bg-brand-ivory">
        {/* Faint Block Print Pattern Background */}
        <div className="absolute inset-0 pattern-block-print opacity-50 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">

          <div className="lg:col-span-5 flex flex-col order-2 lg:order-1 pt-12 lg:pt-0">
            <span className="hero-text-stagger font-script text-3xl text-brand-terracotta mb-4 block transform -rotate-2">
              The Indian Edit
            </span>
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-brand-maroon leading-[1.1] mb-6">
              <span className="block hero-text-stagger">Rooted in</span>
              <span className="block hero-text-stagger italic text-brand-burgundy">Heritage.</span>
              <span className="block hero-text-stagger">Designed for</span>
              <span className="block hero-text-stagger italic text-brand-burgundy">Today.</span>
            </h1>
            <p className="hero-text-stagger text-brand-brown/80 font-light text-base md:text-lg max-w-sm mb-12">
              Timeless Indian silhouettes, meticulously crafted for the modern woman.
            </p>
            <div className="hero-text-stagger flex items-center">
              <Link href="/shop" className="group flex items-center gap-4 border-b border-brand-maroon pb-2 text-sm tracking-[0.2em] uppercase font-medium text-brand-maroon hover:text-brand-sienna hover:border-brand-sienna transition-colors">
                <span>Explore The Collection</span>
                <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7 order-1 lg:order-2 relative">
            <div className="relative aspect-[4/5] w-full hero-mask overflow-hidden bg-brand-sand">
              <Image
                src="https://picsum.photos/seed/indian-campaign/1200/1500"
                alt="Luxury Indian Fashion Campaign"
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 60vw"
              />
              {/* Subtle inner border */}
              <div className="absolute inset-4 border border-brand-cream/30 pointer-events-none" />
            </div>

            {/* Ornamental Vertical Label */}
            <div className="absolute -left-6 top-1/2 -translate-y-1/2 -rotate-90 hidden lg:flex items-center gap-4 opacity-60">
              <span className="text-[10px] tracking-[0.4em] uppercase text-brand-brown font-medium">EST. 2026</span>
              <div className="w-12 h-[1px] bg-brand-brown" />
            </div>
          </div>
        </div>
      </section>

      {/* Traditional Textile Border Separator */}
      <div className="w-full h-[6px] pattern-jaali opacity-40 fabric-reveal" />

      {/* 2. Product Collection (Editorial Layout) */}
      <section className="py-32 px-6 max-w-7xl mx-auto w-full">
        <div className="text-center mb-24 fade-up">
          <span className="font-script text-4xl text-brand-saffron block mb-4">Handpicked for you</span>
          <h2 className="font-serif text-4xl text-brand-maroon">Curated Silhouettes</h2>
        </div>

        {featuredProduct && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12">
            {/* Large Featured Product */}
            <div className="lg:col-span-7 fade-up">
              <ProductCard product={featuredProduct} featured />
            </div>

            {/* Stacked Smaller Products */}
            <div className="lg:col-span-5 flex flex-col gap-6 lg:gap-12 fade-up">
              {collectionProducts.map((product) => (
                <div key={product.id} className="flex-1">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 3. The Festive Edit */}
      <section className="relative py-40 overflow-hidden bg-brand-maroon text-brand-cream">
        <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/indian-textile/1920/1080')] bg-cover bg-center opacity-20 parallax-bg mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-maroon via-brand-maroon/80 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <span className="font-script text-5xl text-brand-saffron block mb-6 fade-up">Celebration dressing</span>
          <h2 className="font-serif text-5xl md:text-7xl mb-8 text-brand-cream fade-up">The Festive Edit</h2>
          <p className="text-brand-cream/80 text-lg font-light max-w-xl mx-auto mb-16 fade-up">
            Reimagined through traditional Indian craftsmanship. Intricate zardozi, rich velvets, and handwoven silks for your most cherished moments.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-12 max-w-5xl mx-auto fade-up">
            {festiveProducts.map(product => (
              <ProductCard key={product.id} product={product} theme="dark" />
            ))}
          </div>

          <div className="mt-20 fade-up">
            <Link href="/shop?category=velvet-edit" className="inline-flex items-center gap-3 border border-brand-saffron text-brand-saffron hover:bg-brand-saffron hover:text-brand-maroon px-10 py-4 text-xs tracking-[0.2em] uppercase font-medium transition-colors">
              Explore The Edit
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Heritage Story Section */}
      <section className="py-32 bg-brand-paper relative overflow-hidden">
        {/* Subtle floral linework behind text */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,_var(--color-brand-sand)_0%,_transparent_70%)] opacity-50 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative aspect-square w-full fade-up">
            <Image
              src="https://picsum.photos/seed/craftsmanship/800/800"
              alt="Indian Craftsmanship"
              fill
              className="object-cover sepia-[0.2]"
            />
            {/* Indian frame corner accents */}
            <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-brand-cream/60" />
            <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-brand-cream/60" />
          </div>

          <div className="flex flex-col fade-up relative z-10">
            <span className="text-[10px] tracking-[0.3em] uppercase text-brand-terracotta font-bold mb-4">Our Heritage</span>
            <h2 className="font-serif text-5xl md:text-6xl text-brand-maroon mb-6 leading-tight">
              Made with <br /><span className="italic text-brand-sienna">a story.</span>
            </h2>

            {/* Ornamental Divider */}
            <div className="flex items-center gap-3 my-6 opacity-60">
              <div className="w-12 h-[1px] bg-brand-brown" />
              <span className="text-brand-terracotta text-lg font-serif">❦</span>
              <div className="w-12 h-[1px] bg-brand-brown" />
            </div>

            <p className="text-brand-brown/80 font-light leading-relaxed mb-6">
              Our journey begins in the vibrant textile markets of India. We partner directly with master artisans who have preserved generational techniques—from the delicate block prints of Rajasthan to the intricate embroideries of Kashmir.
            </p>
            <p className="text-brand-brown/80 font-light leading-relaxed mb-10">
              Each silhouette is a canvas, designed to marry the richness of our heritage with the effortless grace required by the modern woman's wardrobe.
            </p>

            <Link href="/about" className="inline-flex items-center gap-3 text-sm tracking-[0.2em] uppercase text-brand-maroon font-medium group">
              <span className="border-b border-brand-maroon pb-1">Discover Our Craft</span>
              <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Shop By Region */}
      <section className="py-32 px-6 max-w-7xl mx-auto w-full">
        <div className="text-center mb-20 fade-up">
          <span className="font-script text-4xl text-brand-terracotta block mb-4">The Artisan Trail</span>
          <h2 className="font-serif text-4xl text-brand-maroon">Shop By Region</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Region 1 */}
          <div className="group relative aspect-[3/4] overflow-hidden bg-brand-brown fade-up cursor-pointer">
            <Image src="https://picsum.photos/seed/punjab-textile/600/800" alt="Punjab Phulkari" fill className="object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-700" />
            <div className="absolute inset-0 flex flex-col justify-end p-8 bg-gradient-to-t from-brand-maroon/90 via-brand-maroon/30 to-transparent">
              <span className="font-script text-3xl text-brand-saffron mb-2">Punjab</span>
              <h3 className="font-serif text-2xl text-brand-cream mb-3">Phulkari Heritage</h3>
              <p className="text-brand-cream/80 text-sm font-light mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">Vibrant floral embroidery on rich textiles.</p>
              <div className="w-8 h-[1px] bg-brand-cream group-hover:w-full transition-all duration-700" />
            </div>
          </div>

          {/* Region 2 */}
          <div className="group relative aspect-[3/4] overflow-hidden bg-brand-brown fade-up cursor-pointer md:mt-12">
            <Image src="https://picsum.photos/seed/rajasthan-block/600/800" alt="Rajasthan Block Print" fill className="object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-700" />
            <div className="absolute inset-0 flex flex-col justify-end p-8 bg-gradient-to-t from-brand-maroon/90 via-brand-maroon/30 to-transparent">
              <span className="font-script text-3xl text-brand-saffron mb-2">Rajasthan</span>
              <h3 className="font-serif text-2xl text-brand-cream mb-3">Hand Block Prints</h3>
              <p className="text-brand-cream/80 text-sm font-light mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">Intricate wooden block stamping techniques.</p>
              <div className="w-8 h-[1px] bg-brand-cream group-hover:w-full transition-all duration-700" />
            </div>
          </div>

          {/* Region 3 */}
          <div className="group relative aspect-[3/4] overflow-hidden bg-brand-brown fade-up cursor-pointer lg:mt-24">
            <Image src="https://picsum.photos/seed/lucknow-chikan/600/800" alt="Lucknow Chikankari" fill className="object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-700" />
            <div className="absolute inset-0 flex flex-col justify-end p-8 bg-gradient-to-t from-brand-maroon/90 via-brand-maroon/30 to-transparent">
              <span className="font-script text-3xl text-brand-saffron mb-2">Lucknow</span>
              <h3 className="font-serif text-2xl text-brand-cream mb-3">Delicate Chikankari</h3>
              <p className="text-brand-cream/80 text-sm font-light mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">Exquisite shadow-work and white floral embroidery.</p>
              <div className="w-8 h-[1px] bg-brand-cream group-hover:w-full transition-all duration-700" />
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
