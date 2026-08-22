'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getProducts, Product } from '@/lib/data';
import { ProductCard } from '@/components/products/ProductCard';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  
  useEffect(() => {
    getProducts().then(setProducts);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero Animations
      gsap.from('.hero-content', {
        y: 50,
        opacity: 0,
        duration: 1.2,
        stagger: 0.2,
        ease: 'power3.out',
        delay: 0.2
      });

      // Scroll Animations for sections
      gsap.utils.toArray('.fade-up').forEach((elem: any) => {
        gsap.from(elem, {
          scrollTrigger: {
            trigger: elem,
            start: 'top 85%',
          },
          y: 40,
          opacity: 0,
          duration: 1,
          ease: 'power3.out'
        });
      });
    }, heroRef);

    return () => ctx.revert();
  }, [products]);

  const featuredProducts = products.filter(p => p.featured).slice(0, 4);
  const newArrivals = products.filter(p => p.newArrival).slice(0, 4);

  return (
    <div className="flex flex-col w-full overflow-hidden">
      {/* Hero Section */}
      <section ref={heroRef} className="relative h-[85vh] w-full flex items-center justify-center bg-brand-charcoal overflow-hidden -mt-24">
        <Image 
          src="https://picsum.photos/seed/hero-suit/1920/1080" 
          alt="Premium Women's Suits"
          fill
          priority
          className="object-cover opacity-60 scale-105"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-brand-charcoal/40" />
        
        <div className="relative z-10 text-center px-6 max-w-4xl flex flex-col items-center pt-20">
          <h1 ref={titleRef} className="hero-content font-serif text-5xl md:text-7xl lg:text-8xl text-brand-cream tracking-wide mb-6">
            Quiet Luxury.
          </h1>
          <p className="hero-content text-brand-cream/90 text-sm md:text-base tracking-widest uppercase max-w-lg mb-10">
            Tailored perfection for the modern executive. Discover our latest collection of premium suits and formalwear.
          </p>
          <div className="hero-content flex flex-col sm:flex-row gap-6">
            <Link 
              href="/shop?category=formal-suits" 
              className="bg-brand-cream text-brand-charcoal px-10 py-4 text-xs tracking-widest uppercase hover:bg-brand-cream/90 transition-colors"
            >
              Shop Suits
            </Link>
            <Link 
              href="/shop" 
              className="border border-brand-cream text-brand-cream px-10 py-4 text-xs tracking-widest uppercase hover:bg-white/10 transition-colors"
            >
              Explore Collection
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Collection */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 fade-up">
          <div>
            <h2 className="font-serif text-4xl mb-4 text-brand-charcoal">Featured</h2>
            <p className="text-brand-charcoal/60 text-sm max-w-md">Our most coveted pieces, crafted with precision and uncompromising quality.</p>
          </div>
          <Link href="/shop" className="hidden md:inline-block border-b border-brand-charcoal pb-1 text-sm tracking-widest uppercase mt-6 md:mt-0 hover:text-brand-charcoal/60 transition-colors">
            View All
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 fade-up">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="mt-12 text-center md:hidden">
          <Link href="/shop" className="inline-block border-b border-brand-charcoal pb-1 text-sm tracking-widest uppercase hover:text-brand-charcoal/60 transition-colors">
            View All
          </Link>
        </div>
      </section>

      {/* Editorial Story */}
      <section className="bg-brand-beige py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col lg:flex-row items-center gap-16">
          <div className="w-full lg:w-1/2 relative aspect-[4/5] overflow-hidden fade-up">
            <Image
              src="https://picsum.photos/seed/editorial/800/1000"
              alt="The Craftsmanship"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          <div className="w-full lg:w-1/2 flex flex-col justify-center fade-up">
            <h2 className="font-serif text-4xl md:text-5xl mb-8 text-brand-charcoal leading-tight">
              The Anatomy <br /> of Confidence.
            </h2>
            <p className="text-brand-charcoal/80 text-base leading-relaxed mb-6 max-w-lg">
              We believe a suit is more than just clothing. It's an architecture of confidence. Every seam, every lapel, and every fold is meticulously crafted to empower the wearer.
            </p>
            <p className="text-brand-charcoal/80 text-base leading-relaxed mb-10 max-w-lg">
              Using only the finest Italian wools and pure silks, our artisans spend over 40 hours constructing each blazer, ensuring a fit that feels bespoke.
            </p>
            <Link href="/about" className="self-start border-b border-brand-charcoal pb-1 text-sm tracking-widest uppercase hover:text-brand-charcoal/60 transition-colors">
              Discover Our Story
            </Link>
          </div>
        </div>
      </section>

      {/* Shop by Category */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto w-full text-center">
        <h2 className="font-serif text-4xl mb-16 text-brand-charcoal fade-up">The Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 fade-up">
          {[
            { name: 'Formal Suits', img: 'https://picsum.photos/seed/cat-suit/600/800' },
            { name: 'Blazers', img: 'https://picsum.photos/seed/cat-blazer/600/800' },
            { name: 'Co-ord Sets', img: 'https://picsum.photos/seed/cat-coord/600/800' },
            { name: 'Trousers', img: 'https://picsum.photos/seed/cat-trousers/600/800' },
            { name: 'Office Wear', img: 'https://picsum.photos/seed/cat-office/600/800' },
            { name: 'Wedding', img: 'https://picsum.photos/seed/cat-wedding/600/800' },
          ].map((cat, i) => (
            <Link key={i} href={`/shop?category=${cat.name.toLowerCase().replace(' ', '-')}`} className="group relative aspect-[3/4] overflow-hidden bg-brand-charcoal block">
              <Image
                src={cat.img}
                alt={cat.name}
                fill
                className="object-cover opacity-80 group-hover:scale-105 group-hover:opacity-60 transition-all duration-700"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-brand-cream font-serif text-xl md:text-2xl tracking-wide">{cat.name}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
      
      {/* Trust / Features */}
      <section className="border-t border-brand-charcoal/10 py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center fade-up">
          <div className="flex flex-col items-center">
            <span className="text-xs tracking-widest uppercase mb-2 font-medium">Finest Fabrics</span>
            <span className="text-sm text-brand-charcoal/60">Premium wool & silk</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs tracking-widest uppercase mb-2 font-medium">Bespoke Fit</span>
            <span className="text-sm text-brand-charcoal/60">Tailored to perfection</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs tracking-widest uppercase mb-2 font-medium">Global Delivery</span>
            <span className="text-sm text-brand-charcoal/60">Secure & trackable</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs tracking-widest uppercase mb-2 font-medium">Personal Styling</span>
            <span className="text-sm text-brand-charcoal/60">Expert assistance</span>
          </div>
        </div>
      </section>
    </div>
  );
}
