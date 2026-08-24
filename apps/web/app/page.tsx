'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { api } from '@/lib/trpc/client/react';
import { ProductCard } from '@/components/products/ProductCard';
import { ArrowRight, Play, Truck, RotateCcw, ShieldCheck, Instagram } from 'lucide-react';
import { MagneticButton } from '@/components/ui/magnetic-button';

gsap.registerPlugin(ScrollTrigger);

const testimonialsRow1 = [
  {
    quote: "The Banarasi silk drape is pure poetry. The tailoring is absolutely perfect, fits like a dream.",
    author: "Aaradhya M.",
    location: "Mumbai",
    role: "Bespoke Client",
    stars: 5,
  },
  {
    quote: "Outstanding customer service on WhatsApp. They adjusted the neckline exactly as I requested.",
    author: "Priya S.",
    location: "London",
    role: "Atelier Regular",
    stars: 5,
  },
  {
    quote: "Generational craftsmanship is evident in the zardozi detail. I received endless compliments!",
    author: "Meera R.",
    location: "New York",
    role: "Festive Collection",
    stars: 5,
  },
  {
    quote: "My bespoke order arrived ahead of schedule. The velvet is incredibly rich and soft.",
    author: "Kiran J.",
    location: "New Delhi",
    role: "Bespoke Patron",
    stars: 5,
  }
];

const testimonialsRow2 = [
  {
    quote: "Excellent tailoring, fluid silhouettes, and such breathable fabrics. Highly recommend.",
    author: "Deepika P.",
    location: "Singapore",
    role: "Occasion Wear",
    stars: 5,
  },
  {
    quote: "A beautiful fusion of heritage craft and modern wearability. Simply stunning!",
    author: "Ananya K.",
    location: "Sydney",
    role: "Silk Co-ords",
    stars: 5,
  },
  {
    quote: "The fabric quality is outstanding. Feels incredibly premium and comfortable.",
    author: "Rohan D.",
    location: "San Francisco",
    role: "Menswear Elite",
    stars: 5,
  },
  {
    quote: "The craftsmanship is top-tier. Every stitch tells a story of dedicated artistry.",
    author: "Shreya V.",
    location: "Dubai",
    role: "Signature Edit",
    stars: 5,
  }
];

export default function Home() {
  const { data: products = [] } = api.products.getAll.useQuery();
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'bespoke' | 'pret'>('all');

  const slides = [
    {
      image: 'https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?auto=format&fit=crop&w=2000&q=90',
      tagline: 'NEW COLLECTION',
      title: 'Elevate Your Everyday Style',
      subtitle: 'Discover timeless silhouettes crafted for comfort, designed for elegance.',
    },
    {
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=2000&q=90',
      tagline: 'THE FESTIVE EDIT',
      title: 'Heritage Indian Silhouettes',
      subtitle: 'Meticulously crafted traditional ensembles, updated for modern celebrations.',
    },
    {
      image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=2000&q=90',
      tagline: 'HANDCRAFTED LUXURY',
      title: 'Rooted in Heritage Craft',
      subtitle: 'Pure textiles, organic colors, and hand-woven stories from across India.',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

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
      
      // 3. Curated Silhouettes Header Entry
      gsap.from('.silhouette-header', {
        y: 40,
        opacity: 0,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '#curated-silhouettes',
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      });

      gsap.from('.silhouette-tabs', {
        y: 20,
        opacity: 0,
        duration: 1.0,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '#curated-silhouettes',
          start: 'top 80%',
          toggleActions: 'play none none none'
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, [products]);

  useEffect(() => {
    if (!products.length) return;

    gsap.killTweensOf('.silhouette-card');
    
    gsap.fromTo('.silhouette-card',
      {
        opacity: 0,
        y: 50,
        scale: 0.95,
        rotateX: -8,
        transformPerspective: 1000
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        rotateX: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: 'power3.out',
        clearProps: 'transform'
      }
    );
  }, [activeTab, products]);

  const getFilteredProducts = () => {
    if (activeTab === 'bespoke') {
      return products.filter(p => ['Occasion Wear', 'Anarkali Suits'].includes(p.category)).slice(0, 3);
    }
    if (activeTab === 'pret') {
      return products.filter(p => ['Silk Co-ords', 'Velvet Edit', 'Formal Suits'].includes(p.category)).slice(0, 3);
    }
    return products.slice(0, 3);
  };
  const filteredProducts = getFilteredProducts();
  const festiveProducts = products.filter(p => p.category === 'Velvet Edit' || p.category === 'Occasion Wear').slice(0, 3);

  return (
    <div ref={containerRef} className="flex flex-col w-full overflow-hidden bg-brand-ivory text-brand-brown">

      {/* 1. Hero Section (Full-Width Luxury Editorial Carousel) */}
      <section className="relative w-full h-[100vh] min-h-[600px] overflow-hidden bg-brand-ivory">
        {/* Subtle block print pattern overlay */}
        <div className="absolute inset-0 pattern-block-print opacity-20 pointer-events-none z-10" />

        {/* Carousel Slides */}
        <div className="relative w-full h-full">
          {slides.map((slide, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
            >
              {/* Slide Background Image */}
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                priority={idx === 0}
                className="object-cover hero-mask"
                sizes="100vw"
              />
              {/* Premium dark gradient overlay to ensure readable text */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/20 z-0" />

              {/* Slide Content Overlays */}
              <div className="max-w-7xl mx-auto px-6 md:px-12 w-full h-full flex flex-col justify-center relative z-10 text-white">
                <div className="max-w-2xl flex flex-col justify-center h-full pt-28 lg:pt-36">
                  <span className="text-[11px] md:text-xs tracking-[0.3em] uppercase text-brand-terracotta mb-5 font-semibold block">
                    {slide.tagline}
                  </span>

                  <h1 className="font-serif text-5xl md:text-7xl lg:text-[4.8rem] xl:text-[5.5rem] text-brand-ivory leading-[1.08] mb-6 font-normal">
                    {slide.title}
                  </h1>

                  <p className="text-brand-ivory/80 font-light text-sm md:text-base max-w-md mb-10 leading-relaxed">
                    {slide.subtitle}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-6 mb-16">
                    <Link
                      href="/shop"
                      className="bg-brand-ivory hover:bg-brand-terracotta text-brand-brown px-8 py-4 rounded-full text-xs font-semibold uppercase tracking-widest inline-flex items-center gap-3 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5"
                    >
                      <span>Shop Now</span>
                      <ArrowRight size={14} />
                    </Link>

                    <button
                      onClick={() => {
                        const curatedSection = document.getElementById('curated-silhouettes');
                        if (curatedSection) {
                          curatedSection.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className="group inline-flex items-center gap-3 text-brand-ivory hover:text-brand-terracotta transition-colors py-2"
                    >
                      <div className="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center bg-white/10 backdrop-blur-sm group-hover:border-white/40 group-hover:bg-white/35 transition-all duration-300">
                        <Play size={12} fill="currentColor" className="text-white ml-0.5" />
                      </div>
                      <span className="text-xs uppercase tracking-[0.15em] font-semibold">Watch Lookbook</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Persistent Vertical Slide Navigation Selector */}
        <div className="absolute right-6 md:right-12 top-1/2 -translate-y-1/2 flex flex-col items-center gap-6 text-[9px] tracking-[0.25em] text-brand-ivory/40 font-mono select-none z-20">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className="flex flex-col items-center gap-2 group cursor-pointer"
            >
              <span className={`text-[10px] tracking-widest transition-colors duration-300 ${idx === currentSlide ? 'text-brand-terracotta font-semibold' : 'text-brand-ivory/50 group-hover:text-brand-ivory'
                }`}>
                0{idx + 1}
              </span>
              <div className={`w-[1px] transition-all duration-500 ease-in-out bg-brand-terracotta ${idx === currentSlide ? 'h-10 bg-brand-terracotta' : 'h-0 bg-transparent'
                }`} />
            </button>
          ))}
        </div>
      </section>

      {/* Categories Row (Floating banner overlapping bottom of Hero) */}
      <section className="relative z-20 -mt-10 lg:-mt-12 max-w-6xl mx-auto px-6 w-full">
        <div className="bg-white rounded-2xl md:rounded-3xl border border-brand-brown/5 shadow-xl py-6 px-8 md:py-8 md:px-10">
          <div className="flex items-center justify-start md:justify-center gap-6 md:gap-10 overflow-x-auto pb-2 hide-scrollbar">

            {/* Occasion Wear */}
            <Link href="/shop?category=occasion-wear" className="flex flex-col items-center group shrink-0">
              <div className="w-18 h-18 md:w-20 md:h-20 rounded-full overflow-hidden border border-brand-brown/10 p-1 bg-brand-cream/30 group-hover:border-brand-terracotta group-hover:scale-105 transition-all duration-300">
                <div className="relative w-full h-full rounded-full overflow-hidden">
                  <Image src="https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=150&h=150&q=80" alt="Occasion Wear" fill className="object-cover" />
                </div>
              </div>
              <span className="text-[9px] md:text-[10px] tracking-widest uppercase font-medium text-brand-brown/80 group-hover:text-brand-terracotta transition-colors mt-3">Occasions</span>
            </Link>

            {/* Silk Co-ords */}
            <Link href="/shop?category=silk-co-ords" className="flex flex-col items-center group shrink-0">
              <div className="w-18 h-18 md:w-20 md:h-20 rounded-full overflow-hidden border border-brand-brown/10 p-1 bg-brand-cream/30 group-hover:border-brand-terracotta group-hover:scale-105 transition-all duration-300">
                <div className="relative w-full h-full rounded-full overflow-hidden">
                  <Image src="https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?auto=format&fit=crop&w=150&h=150&q=80" alt="Silk Co-ords" fill className="object-cover" />
                </div>
              </div>
              <span className="text-[9px] md:text-[10px] tracking-widest uppercase font-medium text-brand-brown/80 group-hover:text-brand-terracotta transition-colors mt-3">Co-ords</span>
            </Link>

            {/* Velvet Edit */}
            <Link href="/shop?category=velvet-edit" className="flex flex-col items-center group shrink-0">
              <div className="w-18 h-18 md:w-20 md:h-20 rounded-full overflow-hidden border border-brand-brown/10 p-1 bg-brand-cream/30 group-hover:border-brand-terracotta group-hover:scale-105 transition-all duration-300">
                <div className="relative w-full h-full rounded-full overflow-hidden">
                  <Image src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=150&h=150&q=80" alt="Velvet Edit" fill className="object-cover" />
                </div>
              </div>
              <span className="text-[9px] md:text-[10px] tracking-widest uppercase font-medium text-brand-brown/80 group-hover:text-brand-terracotta transition-colors mt-3">Velvet Edit</span>
            </Link>

            {/* Anarkali Suits */}
            <Link href="/shop?category=anarkali-suits" className="flex flex-col items-center group shrink-0">
              <div className="w-18 h-18 md:w-20 md:h-20 rounded-full overflow-hidden border border-brand-brown/10 p-1 bg-brand-cream/30 group-hover:border-brand-terracotta group-hover:scale-105 transition-all duration-300">
                <div className="relative w-full h-full rounded-full overflow-hidden">
                  <Image src="https://images.unsplash.com/photo-1596783047904-89a4214f4e24?auto=format&fit=crop&w=150&h=150&q=80" alt="Anarkali Suits" fill className="object-cover" />
                </div>
              </div>
              <span className="text-[9px] md:text-[10px] tracking-widest uppercase font-medium text-brand-brown/80 group-hover:text-brand-terracotta transition-colors mt-3">Anarkalis</span>
            </Link>

            {/* Formal Suits */}
            <Link href="/shop?category=formal-suits" className="flex flex-col items-center group shrink-0">
              <div className="w-18 h-18 md:w-20 md:h-20 rounded-full overflow-hidden border border-brand-brown/10 p-1 bg-brand-cream/30 group-hover:border-brand-terracotta group-hover:scale-105 transition-all duration-300">
                <div className="relative w-full h-full rounded-full overflow-hidden">
                  <Image src="https://images.unsplash.com/photo-1620386875077-e322fb810928?auto=format&fit=crop&w=150&h=150&q=80" alt="Formal Suits" fill className="object-cover" />
                </div>
              </div>
              <span className="text-[9px] md:text-[10px] tracking-widest uppercase font-medium text-brand-brown/80 group-hover:text-brand-terracotta transition-colors mt-3">Formal Suits</span>
            </Link>

            {/* Sale */}
            <Link href="/shop?filter=sale" className="flex flex-col items-center group shrink-0">
              <div className="w-18 h-18 md:w-20 md:h-20 rounded-full overflow-hidden border border-brand-brown/10 p-1 bg-brand-cream/30 group-hover:border-brand-maroon group-hover:scale-105 transition-all duration-300">
                <div className="w-full h-full rounded-full bg-brand-charcoal text-brand-ivory flex items-center justify-center text-[10px] tracking-widest font-semibold uppercase group-hover:bg-brand-maroon transition-colors">
                  SALE
                </div>
              </div>
              <span className="text-[9px] md:text-[10px] tracking-widest uppercase font-medium text-brand-brown/80 group-hover:text-brand-maroon transition-colors mt-3">Special Offer</span>
            </Link>

          </div>
        </div>
      </section>

      {/* Traditional Textile Border Separator */}
      <div className="w-full h-[6px] pattern-jaali opacity-40 fabric-reveal mt-16" />

      {/* 2. Product Collection (Editorial Layout) */}
      <section id="curated-silhouettes" className="py-32 px-6 max-w-7xl mx-auto w-full relative overflow-hidden">
        {/* Subtle decorative background elements */}
        <div className="absolute top-12 left-6 text-brand-maroon/5 font-serif text-[180px] select-none pointer-events-none hidden xl:block font-bold">
          ATELIER
        </div>

        <div className="text-center mb-16 silhouette-header">
          <span className="font-script text-4xl text-brand-saffron block mb-4">Handpicked for you</span>
          <h2 className="font-serif text-4xl md:text-5xl text-brand-maroon tracking-wide">Curated Silhouettes</h2>
        </div>

        {/* Dynamic Category Tabs */}
        <div className="flex justify-center items-center gap-6 md:gap-12 mb-20 border-b border-brand-maroon/10 max-w-2xl mx-auto pb-4 silhouette-tabs">
          {[
            { id: 'all', label: 'All Collections' },
            { id: 'bespoke', label: 'Bespoke Craft' },
            { id: 'pret', label: 'Ready-to-Wear' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`font-serif tracking-widest text-xs md:text-sm uppercase pb-2 transition-all duration-300 border-b-2 focus:outline-none ${
                activeTab === tab.id
                  ? 'border-brand-maroon text-brand-maroon font-semibold'
                  : 'border-transparent text-brand-brown/50 hover:text-brand-brown'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 items-start pt-8">
            {filteredProducts.map((product, idx) => {
              // Asymmetrical vertical offsets
              const offsetClass = idx === 0 
                ? 'lg:mt-0' 
                : idx === 1 
                ? 'lg:mt-16' 
                : 'lg:mt-8';
              
              return (
                <div 
                  key={product.id} 
                  className={`silhouette-card relative group flex flex-col ${offsetClass}`}
                >
                  {/* Absolute elegant numbers */}
                  <span className="absolute -top-10 left-0 font-serif text-6xl text-brand-maroon/5 pointer-events-none select-none font-bold">
                    0{idx + 1}
                  </span>
                  
                  <div className="relative w-full rounded-2xl overflow-hidden shadow-md group-hover:shadow-xl transition-shadow duration-500">
                    <ProductCard product={product} />
                  </div>
                  
                  {/* Decorative brand script label under the card */}
                  <div className="mt-4 flex items-center justify-between px-1">
                    <span className="text-[9px] tracking-[0.25em] uppercase font-bold text-brand-terracotta">
                      {product.category}
                    </span>
                    <span className="h-[1px] bg-brand-maroon/15 flex-1 mx-4 group-hover:bg-brand-maroon/50 transition-colors duration-500" />
                    <span className="text-[10px] font-serif italic text-brand-sienna">
                      Est. Atelier
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 text-brand-brown/60 text-sm tracking-wider">
            No silhouettes in this curation yet.
          </div>
        )}
      </section>

      {/* 3. The Festive Edit */}
      <section className="relative py-40 overflow-hidden bg-gradient-to-br from-[#2D0A0A] via-brand-maroon to-[#1E0505] text-brand-cream">
        <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/indian-textile/1920/1080')] bg-cover bg-center opacity-10 parallax-bg mix-blend-overlay" />
        
        {/* Soft gold aura lights */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-brand-saffron/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-brand-saffron/5 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Column: Brand Story & Callout */}
            <div className="lg:col-span-5 text-left flex flex-col justify-center fade-up">
              <span className="font-script text-4xl text-brand-saffron block mb-4">Celebration dressing</span>
              <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-brand-cream mb-6 tracking-wide leading-tight">
                The Festive <br />
                <span className="italic text-brand-saffron">Edit.</span>
              </h2>
              
              {/* Ornamental Gold Divider */}
              <div className="flex items-center gap-3 my-4 opacity-75">
                <div className="w-16 h-[1px] bg-brand-saffron" />
                <span className="text-brand-saffron text-sm">✦</span>
                <div className="w-16 h-[1px] bg-brand-saffron" />
              </div>

              <p className="text-brand-cream/80 text-sm md:text-base font-light leading-relaxed mb-8 max-w-md">
                Reimagined through traditional Indian craftsmanship. Intricate hand-done zardozi, rich velvets, and handwoven silks designed to capture the magic of your most cherished moments.
              </p>
              
              {/* Feature highlights */}
              <div className="space-y-3 mb-10">
                {[
                  'Hand-finished zardozi motifs',
                  'Premium Banarasi & velvet fabrics',
                  'Custom-tailored to your measurements'
                ].map((highlight, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-[10px] tracking-widest uppercase text-brand-cream/60">
                    <span className="text-brand-saffron text-[10px]">✦</span>
                    <span>{highlight}</span>
                  </div>
                ))}
              </div>

              <div className="self-start">
                <Link 
                  href="/shop?category=velvet-edit" 
                  className="inline-flex items-center gap-3 border border-brand-saffron text-brand-saffron hover:bg-brand-saffron hover:text-brand-maroon px-8 py-3.5 text-xs tracking-[0.2em] uppercase font-semibold transition-all duration-300 rounded-full"
                >
                  Explore The Edit
                </Link>
              </div>
            </div>

            {/* Right Column: Staggered Products */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8 items-stretch fade-up">
              {festiveProducts.map((product, idx) => {
                // Staggered vertical offsets
                const offsetClass = idx === 0 
                  ? 'lg:-translate-y-8' 
                  : idx === 1 
                  ? 'lg:translate-y-8' 
                  : 'lg:translate-y-0';
                  
                return (
                  <div 
                    key={product.id} 
                    className={`flex flex-col ${offsetClass} transition-transform duration-500 hover:scale-102`}
                  >
                    <div className="relative border border-brand-saffron/10 rounded-2xl overflow-hidden shadow-2xl bg-[#2D0A0A]/40 backdrop-blur-sm p-3 group">
                      {/* Gold corner brackets inside */}
                      <div className="absolute top-2.5 left-2.5 w-3 h-3 border-t border-l border-brand-saffron/30 pointer-events-none" />
                      <div className="absolute bottom-2.5 right-2.5 w-3 h-3 border-b border-r border-brand-saffron/30 pointer-events-none" />
                      
                      <ProductCard product={product} theme="dark" />
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </section>

      {/* 4. Testimonials Section (Infinite Loop Marquee) */}
      <section id="testimonials" className="py-32 bg-brand-paper relative overflow-hidden">
        {/* Subtle decorative block print overlays */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[radial-gradient(circle_at_center,_var(--color-brand-sand)_0%,_transparent_75%)] opacity-40 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[radial-gradient(circle_at_center,_var(--color-brand-sand)_0%,_transparent_75%)] opacity-40 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 mb-16">
          <div className="text-center mb-12 fade-up">
            <span className="font-script text-3xl text-brand-saffron block mb-2">Atelier Diaries</span>
            <h2 className="font-serif text-3xl md:text-4xl text-brand-maroon tracking-wide">Client Testimonials</h2>
            <p className="text-brand-brown/60 text-xs md:text-sm tracking-widest uppercase mt-3 font-medium">
              ✦ Trusted by patrons worldwide for bespoke luxury ✦
            </p>
          </div>
        </div>

        {/* Infinite Loop Slider Tracks */}
        <div className="hover-pause flex flex-col gap-6 md:gap-8 w-full overflow-hidden relative z-10">
          
          {/* Row 1: Sliding Left */}
          <div className="flex whitespace-nowrap gap-6 w-full">
            <div className="flex gap-6 animate-marquee-left">
              {[...testimonialsRow1, ...testimonialsRow1].map((item, idx) => (
                <div 
                  key={idx}
                  className="w-[320px] md:w-[420px] shrink-0 bg-brand-cream/80 backdrop-blur-sm border border-brand-maroon/10 p-6 md:p-8 rounded-2xl flex flex-col justify-between shadow-sm hover:shadow-md hover:border-brand-maroon/30 transition-all duration-300 relative group"
                >
                  <span className="absolute top-4 right-6 font-serif text-7xl text-brand-maroon/5 select-none pointer-events-none group-hover:text-brand-maroon/10 transition-colors">“</span>
                  <div>
                    {/* Star icons */}
                    <div className="flex gap-1 mb-4 text-brand-saffron">
                      {[...Array(item.stars)].map((_, i) => (
                        <span key={i} className="text-xs">✦</span>
                      ))}
                    </div>
                    <p className="text-brand-brown text-sm font-light italic leading-relaxed whitespace-normal mb-6">
                      "{item.quote}"
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between border-t border-brand-maroon/5 pt-4">
                    <div>
                      <h4 className="font-serif text-xs md:text-sm font-semibold text-brand-maroon">{item.author}</h4>
                      <p className="text-[9px] tracking-widest uppercase text-brand-brown/50 mt-0.5">{item.role}</p>
                    </div>
                    <span className="text-[9px] tracking-widest uppercase font-medium text-brand-terracotta">{item.location}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Row 2: Sliding Right */}
          <div className="flex whitespace-nowrap gap-6 w-full">
            <div className="flex gap-6 animate-marquee-right">
              {[...testimonialsRow2, ...testimonialsRow2].map((item, idx) => (
                <div 
                  key={idx}
                  className="w-[320px] md:w-[420px] shrink-0 bg-brand-cream/80 backdrop-blur-sm border border-brand-maroon/10 p-6 md:p-8 rounded-2xl flex flex-col justify-between shadow-sm hover:shadow-md hover:border-brand-maroon/30 transition-all duration-300 relative group"
                >
                  <span className="absolute top-4 right-6 font-serif text-7xl text-brand-maroon/5 select-none pointer-events-none group-hover:text-brand-maroon/10 transition-colors">“</span>
                  <div>
                    {/* Star icons */}
                    <div className="flex gap-1 mb-4 text-brand-saffron">
                      {[...Array(item.stars)].map((_, i) => (
                        <span key={i} className="text-xs">✦</span>
                      ))}
                    </div>
                    <p className="text-brand-brown text-sm font-light italic leading-relaxed whitespace-normal mb-6">
                      "{item.quote}"
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between border-t border-brand-maroon/5 pt-4">
                    <div>
                      <h4 className="font-serif text-xs md:text-sm font-semibold text-brand-maroon">{item.author}</h4>
                      <p className="text-[9px] tracking-widest uppercase text-brand-brown/50 mt-0.5">{item.role}</p>
                    </div>
                    <span className="text-[9px] tracking-widest uppercase font-medium text-brand-terracotta">{item.location}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* 5. Frequently Asked Questions */}
      <section className="py-32 px-6 max-w-4xl mx-auto w-full">
        <div className="text-center mb-16 fade-up">
          <span className="font-script text-4xl text-brand-saffron block mb-4">Customer Concierge</span>
          <h2 className="font-serif text-4xl text-brand-maroon">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4 fade-up">
          {[
            {
              q: "How do I order a custom-fit suit?",
              a: "All our garments can be custom tailored to your exact measurements. Simply click the 'Order on WhatsApp' or 'Inquire on Instagram' buttons on any product page, and our concierge team will guide you through the measurement process."
            },
            {
              q: "What is the typical timeline for bespoke tailoring?",
              a: "Each bespoke suit is handcrafted by our master artisans. Custom tailoring takes approximately 2 to 3 weeks from the date of measurement confirmation to dispatch. Ready-to-wear pieces are dispatched within 2–3 business days."
            },
            {
              q: "Do you offer international shipping?",
              a: "Yes, we ship our luxury garments worldwide. Express delivery typically takes 5–7 business days depending on your location, and tracking details are provided as soon as your package is dispatched."
            },
            {
              q: "Can I request custom modifications to designs?",
              a: "Absolutely. Since each piece is tailored individually, you can request custom sleeve lengths, alternate necklines, different lining fabrics, or custom embroidery motifs during your design consultation."
            },
            {
              q: "What fabrics do you use in your collections?",
              a: "We source only premium, heritage fabrics including pure Banarasi silk, hand-woven cotton, premium velvet, and raw silk. Detailed fabric specifications are listed on each product's description page."
            },
            {
              q: "What is your return and exchange policy?",
              a: "Due to the custom-made nature of bespoke garments, we do not accept returns. However, we offer complimentary alterations to ensure your custom suit fits you perfectly. For ready-to-wear pieces, exchanges are accepted within 7 days."
            }
          ].map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={idx} className="border-b border-brand-charcoal/10 pb-4">
                <button 
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between py-4 text-left font-serif text-lg md:text-xl text-brand-maroon hover:text-brand-sienna transition-colors focus:outline-none"
                >
                  <span className="pr-4">{faq.q}</span>
                  <span className={`text-brand-saffron transition-transform duration-300 text-xl font-light shrink-0 ${isOpen ? 'rotate-45' : ''}`}>
                    +
                  </span>
                </button>
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-48 opacity-100 mt-2 pb-2' : 'max-h-0 opacity-0 pointer-events-none'
                  }`}
                >
                  <p className="text-brand-brown/85 text-xs md:text-sm font-light leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. Follow us on Instagram */}
      <section className="py-24 border-t border-brand-charcoal/5 bg-brand-cream/30 w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 fade-up">
            <span className="font-script text-3xl text-brand-saffron block mb-2">Follow the Journey</span>
            <h2 className="font-serif text-3xl md:text-4xl text-brand-maroon">@jb51_clothing_house</h2>
            <p className="text-brand-brown/60 text-xs md:text-sm tracking-widest uppercase mt-3 font-medium">
              ✦ Share your style using #JB51Atelier ✦
            </p>
          </div>  

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6 mb-12">
            {[
              {
                url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&h=600&q=80",
                alt: "Pastel Silhouettes"
              },
              {
                url: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&h=600&q=80",
                alt: "Artisanal Tailoring"
              },
              {
                url: "https://images.unsplash.com/photo-1584905066893-7d5c142ba4e1?auto=format&fit=crop&w=600&h=600&q=80",
                alt: "Detailed Embroidery"
              },
              {
                url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&h=600&q=80",
                alt: "Bespoke Collection Room"
              },
              {
                url: "https://images.unsplash.com/photo-1537832816519-689ad163238b?auto=format&fit=crop&w=600&h=600&q=80",
                alt: "Artisan Ornamentation"
              }
            ].map((img, idx) => (
              <a 
                key={idx}
                href="https://instagram.com/jb51clothing"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-square w-full overflow-hidden bg-brand-brown rounded-xl shadow-sm border border-brand-charcoal/5 block"
              >
                <Image 
                  src={img.url} 
                  alt={img.alt} 
                  fill 
                  className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100" 
                  sizes="(max-width: 768px) 50vw, 20vw"
                />
                <div className="absolute inset-0 bg-brand-maroon/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Instagram className="text-brand-cream w-8 h-8 stroke-[1.25]" />
                </div>
              </a>
            ))}
          </div>

          <div className="text-center">
            <MagneticButton>
              <a 
                href="https://instagram.com/jb51_clothing_house"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 border border-brand-maroon text-brand-maroon hover:bg-brand-maroon hover:text-brand-cream py-3.5 px-8 text-xs tracking-[0.2em] uppercase font-semibold transition-all duration-300 rounded-full"
              >
                <Instagram size={14} />
                <span>Follow @jb51_clothing_house</span>
              </a>
            </MagneticButton>
          </div>
        </div>
      </section>

    </div>
  );
}
