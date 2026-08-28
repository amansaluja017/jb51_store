'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { api } from '@/lib/trpc/client/react';
import { ProductCard } from '@/components/products/ProductCard';
import { ArrowRight, Play, Truck, RotateCcw, ShieldCheck, Instagram, Sparkles, Star, Heart, ShoppingBag, Eye, HelpCircle } from 'lucide-react';
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
  
  // Flash Sale Countdown Timer
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 45, seconds: 30 });

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
  }, [currentSlide]);

  // Countdown timer logic
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // GSAP animations setup
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      tl.fromTo('.hero-mask',
        { clipPath: 'inset(100% 0% 0% 0%)', scale: 1.05 },
        { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: 1.5, ease: 'power4.inOut' }
      );

      // Scroll reveal animations
      gsap.utils.toArray('.fabric-reveal').forEach((el: any) => {
        gsap.fromTo(el,
          { clipPath: 'inset(0% 100% 0% 0%)' },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: 1.2,
            ease: 'power3.inOut',
            scrollTrigger: {
              trigger: el,
              start: 'top 90%',
              toggleActions: 'play none none reverse'
            }
          }
        );
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

  // Tab change animation
  useEffect(() => {
    if (!products.length) return;

    gsap.killTweensOf('.silhouette-card');

    gsap.fromTo('.silhouette-card',
      {
        opacity: 0,
        y: 35,
        scale: 0.98,
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        stagger: 0.08,
        ease: 'power2.out',
        clearProps: 'all'
      }
    );
  }, [activeTab, products]);

  const getFilteredProducts = () => {
    const listedProducts = products.filter(p => p.isListed !== false);
    if (activeTab === 'bespoke') {
      return listedProducts.filter(p => ['Occasion Wear', 'Anarkali Suits'].includes(p.category)).slice(0, 3);
    }
    if (activeTab === 'pret') {
      return listedProducts.filter(p => ['Silk Co-ords', 'Velvet Edit', 'Formal Suits'].includes(p.category)).slice(0, 3);
    }
    return listedProducts.slice(0, 3);
  };

  const filteredProducts = getFilteredProducts();
  const bestSellerProducts = products.filter(p => p.isListed !== false && p.bestseller).slice(0, 4);
  const newArrivalProducts = products.filter(p => p.isListed !== false && p.newArrival).slice(0, 4);

  return (
    <div ref={containerRef} className="flex flex-col w-full overflow-hidden bg-white text-zinc-800 font-sans">

      {/* 1. Hero Section (Visual Editorial Carousel with Floating Badges) */}
      <section className="relative w-full h-[100vh] min-h-[600px] overflow-hidden bg-zinc-950">
        
        {/* Carousel Slides */}
        <div className="relative w-full h-full">
          {slides.map((slide, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-all duration-[1200ms] cubic-bezier(0.4, 0, 0.2, 1) hero-slide-${idx} ${
                idx === currentSlide ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-105 z-0 pointer-events-none'
              }`}
            >
              {/* Slide Background Image */}
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                priority={idx === 0}
                className="object-cover hero-mask opacity-85"
                style={{ clipPath: 'inset(100% 0% 0% 0%)' }}
                sizes="100vw"
              />
              {/* Darkening gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent z-10" />

              {/* Interactive Floating Product Tag Badge (NovaTrend Inspired) */}
              {idx === currentSlide && (
                <Link
                  href={`/product/${slide.badgeProduct.slug}`}
                  className="absolute hidden md:flex items-center gap-3 bg-white/90 backdrop-blur-md p-2.5 rounded-2xl shadow-2xl border border-white/40 bottom-[20%] right-[15%] z-30 hover:scale-105 hover:bg-white transition-all duration-300 animate-scale-up group"
                >
                  <div className="relative w-12 h-16 rounded-lg overflow-hidden border border-zinc-200">
                    <Image src={slide.badgeProduct.img} alt={slide.badgeProduct.name} fill className="object-cover" />
                  </div>
                  <div className="flex flex-col text-left pr-2">
                    <span className="text-[8px] tracking-wider uppercase font-bold text-zinc-400">Featured Outfit</span>
                    <span className="text-xs font-serif font-bold text-zinc-900 group-hover:text-[#FF5E36] transition-colors">{slide.badgeProduct.name}</span>
                    <span className="text-xs font-bold text-[#FF5E36] mt-0.5">
                      {slide.badgeProduct.price.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-[#FF5E36] text-white flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                    <ArrowRight size={12} />
                  </div>
                </Link>
              )}

              {/* Slide Content Overlays */}
              <div className="max-w-7xl mx-auto px-6 md:px-12 w-full h-full flex flex-col justify-center relative z-20 text-white">
                <div className="max-w-2xl flex flex-col justify-center h-full pt-20">
                  
                  {/* Tagline */}
                  <span className="hero-text-stagger opacity-0 text-[10px] md:text-xs tracking-[0.3em] uppercase text-[#FF5E36] mb-4 font-bold inline-flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF5E36] inline-block" />
                    {slide.tagline}
                  </span>

                  {/* Title */}
                  <h1 className="hero-text-stagger opacity-0 font-serif text-5xl md:text-7xl lg:text-[4.6rem] xl:text-[5.4rem] text-white leading-[1.08] mb-6 font-bold tracking-tight">
                    {slide.title}
                  </h1>

                  {/* Subtitle */}
                  <p className="hero-text-stagger opacity-0 text-zinc-300 font-light text-xs md:text-sm max-w-md mb-8 leading-relaxed">
                    {slide.subtitle}
                  </p>

                  {/* Action Buttons */}
                  <div className="hero-text-stagger opacity-0 flex flex-wrap items-center gap-4">
                    <Link
                      href="/shop"
                      className="bg-[#FF5E36] hover:bg-[#E04D27] text-white px-8 py-4 rounded-full text-xs font-bold uppercase tracking-widest inline-flex items-center gap-2.5 transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                    >
                      <span>Shop Collection</span>
                      <ArrowRight size={14} />
                    </Link>

                    <button
                      onClick={() => {
                        const curatedSection = document.getElementById('curated-silhouettes');
                        if (curatedSection) {
                          curatedSection.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className="group inline-flex items-center gap-3 text-white hover:text-[#FF5E36] transition-colors py-2"
                      aria-label="Explore Curated Atelier Collection"
                    >
                      <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center bg-white/5 backdrop-blur-sm group-hover:border-white/40 group-hover:bg-white/10 transition-all duration-300">
                        <Play size={10} fill="currentColor" className="text-white ml-0.5" />
                      </div>
                      <span className="text-[10px] uppercase tracking-widest font-bold">Explore Atelier</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Carousel Bottom Progress Line indicators */}
        <div className="absolute bottom-10 left-6 right-6 md:left-12 md:right-12 z-20 flex items-center justify-between text-[10px] tracking-widest text-white/50">
          <div className="flex gap-4">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-1 transition-all duration-500 rounded-full ${
                  idx === currentSlide ? 'w-12 bg-[#FF5E36]' : 'w-6 bg-white/20'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
          <span className="font-mono text-white/60">0{currentSlide + 1} / 0{slides.length}</span>
        </div>
      </section>

      {/* 2. Trust Badges Row (NovaTrend / AND SHOP inspired) */}
      <section className="bg-white py-6 border-b border-zinc-100 z-20 relative select-none">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4 divide-y md:divide-y-0 md:divide-x divide-zinc-100">
          <div className="flex items-center gap-3.5 pl-2 py-2 md:py-0">
            <div className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center text-[#FF5E36] shrink-0">
              <Truck size={18} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-zinc-950 uppercase tracking-wider">Free Shipping</h4>
              <p className="text-[10px] text-zinc-400 mt-0.5">On orders over 30,000 INR</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 pl-2 md:pl-6 py-2 md:py-0">
            <div className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center text-[#FF5E36] shrink-0">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-zinc-950 uppercase tracking-wider">Secure Payments</h4>
              <p className="text-[10px] text-zinc-400 mt-0.5">100% encrypted checkout</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 pl-2 md:pl-6 py-2 md:py-0">
            <div className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center text-[#FF5E36] shrink-0">
              <RotateCcw size={18} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-zinc-950 uppercase tracking-wider">Easy Exchange</h4>
              <p className="text-[10px] text-zinc-400 mt-0.5">No questions asked 7-day policy</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 pl-2 md:pl-6 py-2 md:py-0">
            <div className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center text-[#FF5E36] shrink-0">
              <Sparkles size={18} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-zinc-950 uppercase tracking-wider">24/7 Support</h4>
              <p className="text-[10px] text-zinc-400 mt-0.5">Premium concierge assistance</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Shop by Categories Grid (NovaTrend Inspired) */}
      <section className="py-24 px-6 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-end mb-12 fade-up">
          <div>
            <span className="text-[10px] tracking-[0.25em] uppercase text-[#FF5E36] font-bold block mb-2">CURATED COLLECTIONS</span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-zinc-950 tracking-tight">Shop by Categories</h2>
          </div>
          <Link href="/shop" className="text-xs font-bold text-[#FF5E36] hover:text-[#E04D27] flex items-center gap-1 uppercase tracking-widest border-b border-transparent hover:border-[#E04D27] pb-1 transition-all">
            <span>View All Categories</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 fade-up">
          
          {/* Occasion Wear */}
          <Link href="/shop?category=occasion-wear" className="group flex flex-col rounded-2xl overflow-hidden bg-zinc-50 border border-zinc-100 hover:shadow-lg transition-all duration-500">
            <div className="relative aspect-[4/5] overflow-hidden w-full fabric-reveal">
              <Image src="https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80" alt="Occasion Wear" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
            </div>
            <div className="p-4 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 group-hover:text-[#FF5E36] transition-colors">Occasion Wear</span>
              <ArrowRight size={12} className="text-zinc-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Silk Co-ords */}
          <Link href="/shop?category=silk-co-ords" className="group flex flex-col rounded-2xl overflow-hidden bg-zinc-50 border border-zinc-100 hover:shadow-lg transition-all duration-500">
            <div className="relative aspect-[4/5] overflow-hidden w-full fabric-reveal">
              <Image src="https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?auto=format&fit=crop&w=600&q=80" alt="Silk Co-ords" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
            </div>
            <div className="p-4 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 group-hover:text-[#FF5E36] transition-colors">Silk Co-ords</span>
              <ArrowRight size={12} className="text-zinc-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Velvet Edit */}
          <Link href="/shop?category=velvet-edit" className="group flex flex-col rounded-2xl overflow-hidden bg-zinc-50 border border-zinc-100 hover:shadow-lg transition-all duration-500">
            <div className="relative aspect-[4/5] overflow-hidden w-full fabric-reveal">
              <Image src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80" alt="Velvet Edit" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
            </div>
            <div className="p-4 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 group-hover:text-[#FF5E36] transition-colors">Velvet Edit</span>
              <ArrowRight size={12} className="text-zinc-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Anarkali Suits */}
          <Link href="/shop?category=anarkali-suits" className="group flex flex-col rounded-2xl overflow-hidden bg-zinc-50 border border-zinc-100 hover:shadow-lg transition-all duration-500">
            <div className="relative aspect-[4/5] overflow-hidden w-full fabric-reveal">
              <Image src="https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80" alt="Anarkali Suits" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
            </div>
            <div className="p-4 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 group-hover:text-[#FF5E36] transition-colors">Anarkalis</span>
              <ArrowRight size={12} className="text-zinc-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Formal Suits */}
          <Link href="/shop?category=formal-suits" className="group flex flex-col rounded-2xl overflow-hidden bg-zinc-50 border border-zinc-100 hover:shadow-lg transition-all duration-500">
            <div className="relative aspect-[4/5] overflow-hidden w-full fabric-reveal">
              <Image src="https://images.unsplash.com/photo-1620386875077-e322fb810928?auto=format&fit=crop&w=600&q=80" alt="Formal Suits" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
            </div>
            <div className="p-4 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 group-hover:text-[#FF5E36] transition-colors">Formal Suits</span>
              <ArrowRight size={12} className="text-zinc-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

        </div>
      </section>

      {/* Editorial Advertisement Section (Atelier Feature) */}
      <section className="py-16 px-6 max-w-7xl mx-auto w-full fade-up">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center bg-zinc-950 text-white rounded-[2.5rem] overflow-hidden p-8 md:p-12 relative">
          
          {/* Subtle design aura blobs */}
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#FF5E36]/5 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-white/5 blur-3xl pointer-events-none" />

          {/* Left Block: Narrative & Call to Action */}
          <div className="md:col-span-5 flex flex-col justify-center relative z-10">
            <span className="text-[10px] tracking-[0.3em] uppercase text-[#FF5E36] font-bold mb-3 block">
              ATELIER SERVICE
            </span>
            <h3 className="font-serif text-3xl md:text-5xl font-normal leading-[1.1] mb-6 tracking-tight">
              The Art <br className="hidden md:block"/>of Custom <span className="font-serif italic text-zinc-300">Drape</span>
            </h3>
            <p className="text-zinc-400 font-light text-xs md:text-sm leading-relaxed mb-8">
              Experience the pinnacle of bespoke couture. Our master craftsmen tailor each ensemble to your exact measurements, ensuring a silhouette that flows with effortless grace and timeless sophistication.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/support"
                className="bg-[#FF5E36] hover:bg-[#E04D27] text-white px-7 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest inline-flex items-center gap-2.5 transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                <span>Book Appointment</span>
                <ArrowRight size={12} />
              </Link>
              <Link
                href="/shop"
                className="border border-white/20 hover:border-white/40 hover:bg-white/5 text-white px-7 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300"
              >
                Explore Atelier
              </Link>
            </div>
          </div>

          {/* Right Block: Image advertisement frame */}
          <div className="md:col-span-7 relative z-10 w-full h-full min-h-[350px] md:min-h-[480px] rounded-2xl overflow-hidden fabric-reveal shadow-xl">
            <Image
              src="/assets/luxury_ad_banner.png"
              alt="The Art of Drape - Atelier Collection"
              fill
              className="object-cover hover:scale-105 transition-transform duration-[1.5s]"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

        </div>
      </section>

      {/* 4. Curated Silhouettes (Editorial Collection tabs with GSAP) */}
      <section id="curated-silhouettes" className="py-20 px-6 max-w-7xl mx-auto w-full bg-zinc-50 rounded-[2.5rem] relative overflow-hidden my-12">
        <div className="absolute top-12 left-12 text-zinc-200/40 font-serif text-[130px] select-none pointer-events-none hidden xl:block font-bold">
          ATELIER
        </div>

        <div className="text-center mb-10 silhouette-header relative z-10">
          <span className="text-[10px] tracking-[0.25em] uppercase text-[#FF5E36] font-bold block mb-2">HANDPICKED CURATION</span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-zinc-950 tracking-tight">Curated Silhouettes</h2>
        </div>

        {/* Dynamic Category Tabs */}
        <div className="flex justify-center items-center gap-6 md:gap-10 mb-12 border-b border-zinc-200 max-w-md mx-auto pb-3 silhouette-tabs relative z-10">
          {[
            { id: 'all', label: 'All' },
            { id: 'bespoke', label: 'Bespoke' },
            { id: 'pret', label: 'Ready-to-Wear' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`font-semibold tracking-wider text-xs uppercase pb-2 transition-all duration-300 border-b-2 focus:outline-none cursor-pointer ${
                activeTab === tab.id
                  ? 'border-[#FF5E36] text-[#FF5E36]'
                  : 'border-transparent text-zinc-400 hover:text-zinc-800'
              }`}
              aria-label={`Filter by category ${tab.label}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start pt-4 relative z-10">
            {filteredProducts.map((product, idx) => (
              <div
                key={product.id}
                className="silhouette-card relative flex flex-col"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-zinc-400 text-sm tracking-wider relative z-10">
            No silhouettes in this curation yet.
          </div>
        )}
      </section>

      {/* 5. New Arrivals Grid */}
      <section className="py-20 px-6 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-end mb-10 fade-up">
          <div>
            <span className="text-[10px] tracking-[0.25em] uppercase text-[#FF5E36] font-bold block mb-2">LATEST DROPS</span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-zinc-950 tracking-tight">New Arrivals</h2>
          </div>
          <Link href="/shop?filter=new" className="text-xs font-bold text-[#FF5E36] hover:text-[#E04D27] flex items-center gap-1 uppercase tracking-widest border-b border-transparent hover:border-[#E04D27] pb-1 transition-all">
            <span>View All New</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 fade-up">
          {newArrivalProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 6. Interactive Flash Sale Banner Section (Countdown Timer) */}
      <section className="py-24 overflow-hidden bg-zinc-950 text-white relative">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center opacity-15 parallax-bg mix-blend-overlay" />

        {/* Aura light blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#FF5E36]/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-zinc-200/5 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <span className="text-[10px] md:text-xs tracking-[0.3em] uppercase text-[#FF5E36] mb-5 font-bold block">
            LIMITED TIME PROMO
          </span>
          <h2 className="font-serif text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight leading-tight">
            Summer Season Flash Sale
          </h2>
          <p className="text-zinc-400 text-xs md:text-sm font-light leading-relaxed max-w-md mx-auto mb-10">
            Enjoy up to 70% off on selected traditional designs and ready-to-wear silk co-ords. Offer expires shortly.
          </p>

          {/* JavaScript Live Countdown Timer */}
          <div className="flex justify-center items-center gap-4 md:gap-6 mb-12">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-2xl md:text-3xl font-mono font-bold tracking-wider">
                {String(timeLeft.hours).padStart(2, '0')}
              </div>
              <span className="text-[9px] uppercase tracking-widest text-zinc-500 mt-2 font-bold">Hours</span>
            </div>
            <span className="text-2xl text-zinc-600 font-mono">:</span>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-2xl md:text-3xl font-mono font-bold tracking-wider">
                {String(timeLeft.minutes).padStart(2, '0')}
              </div>
              <span className="text-[9px] uppercase tracking-widest text-zinc-500 mt-2 font-bold">Mins</span>
            </div>
            <span className="text-2xl text-zinc-600 font-mono">:</span>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-2xl md:text-3xl font-mono font-bold tracking-wider text-[#FF5E36]">
                {String(timeLeft.seconds).padStart(2, '0')}
              </div>
              <span className="text-[9px] uppercase tracking-widest text-[#FF5E36] mt-2 font-bold">Secs</span>
            </div>
          </div>

          <Link
            href="/shop?filter=sale"
            className="inline-flex items-center gap-2.5 bg-[#FF5E36] hover:bg-[#E04D27] text-white px-8 py-4 text-xs tracking-widest uppercase font-bold transition-all duration-300 rounded-full shadow-md"
          >
            <span>Claim Discount</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* 7. Best Sellers Grid */}
      <section className="py-20 px-6 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-end mb-10 fade-up">
          <div>
            <span className="text-[10px] tracking-[0.25em] uppercase text-[#FF5E36] font-bold block mb-2">TRENDING BESTSELLERS</span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-zinc-950 tracking-tight">Best Sellers</h2>
          </div>
          <Link href="/shop?filter=bestseller" className="text-xs font-bold text-[#FF5E36] hover:text-[#E04D27] flex items-center gap-1 uppercase tracking-widest border-b border-transparent hover:border-[#E04D27] pb-1 transition-all">
            <span>View All Bestsellers</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 fade-up">
          {bestSellerProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 8. Testimonials Section (Infinite Loop Marquee) */}
      <section id="testimonials" className="py-24 bg-zinc-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 mb-12">
          <div className="text-center mb-10 fade-up">
            <span className="text-[10px] tracking-[0.25em] uppercase text-[#FF5E36] font-bold block mb-2">ATELIER DIARIES</span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-zinc-950 tracking-tight">Customer Testimonials</h2>
          </div>
        </div>

        {/* Infinite Loop Slider Tracks */}
        <div className="hover-pause flex flex-col gap-6 w-full overflow-hidden relative z-10 select-none">

          {/* Row 1: Sliding Left */}
          <div className="flex whitespace-nowrap w-full overflow-hidden">
            <div className="flex gap-6 animate-marquee-left shrink-0">
              {[...testimonialsRow1, ...testimonialsRow1].map((item, idx) => (
                <div
                  key={idx}
                  className="w-[300px] md:w-[380px] shrink-0 bg-white border border-zinc-100 p-6 rounded-2xl flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 relative group"
                >
                  <span className="absolute top-2 right-5 font-serif text-7xl text-zinc-100 select-none pointer-events-none group-hover:text-zinc-200 transition-colors">“</span>
                  <div>
                    {/* Star icons */}
                    <div className="flex gap-1 mb-3 text-amber-400">
                      {[...Array(item.stars)].map((_, i) => (
                        <Star key={i} size={11} className="fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-zinc-600 text-[11px] md:text-xs font-light italic leading-relaxed whitespace-normal mb-5">
                      "{item.quote}"
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-zinc-100 pt-3 text-[10px]">
                    <div>
                      <h4 className="font-bold text-zinc-950">{item.author}</h4>
                      <p className="text-[8px] tracking-wider uppercase text-zinc-400 mt-0.5">{item.role}</p>
                    </div>
                    <span className="text-[8px] tracking-widest uppercase font-bold text-[#FF5E36] bg-[#FF5E36]/5 px-2 py-0.5 rounded-full">{item.location}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Row 2: Sliding Right */}
          <div className="flex whitespace-nowrap w-full overflow-hidden">
            <div className="flex gap-6 animate-marquee-right shrink-0">
              {[...testimonialsRow2, ...testimonialsRow2].map((item, idx) => (
                <div
                  key={idx}
                  className="w-[300px] md:w-[380px] shrink-0 bg-white border border-zinc-100 p-6 rounded-2xl flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 relative group"
                >
                  <span className="absolute top-2 right-5 font-serif text-7xl text-zinc-100 select-none pointer-events-none group-hover:text-zinc-200 transition-colors">“</span>
                  <div>
                    {/* Star icons */}
                    <div className="flex gap-1 mb-3 text-amber-400">
                      {[...Array(item.stars)].map((_, i) => (
                        <Star key={i} size={11} className="fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-zinc-600 text-[11px] md:text-xs font-light italic leading-relaxed whitespace-normal mb-5">
                      "{item.quote}"
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-zinc-100 pt-3 text-[10px]">
                    <div>
                      <h4 className="font-bold text-zinc-950">{item.author}</h4>
                      <p className="text-[8px] tracking-wider uppercase text-zinc-400 mt-0.5">{item.role}</p>
                    </div>
                    <span className="text-[8px] tracking-widest uppercase font-bold text-[#FF5E36] bg-[#FF5E36]/5 px-2 py-0.5 rounded-full">{item.location}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* 8.5 Seasonal Discount Advertisement Section (Split layout - Image Left, Text Right) */}
      <section className="py-16 px-6 max-w-7xl mx-auto w-full fade-up">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center bg-zinc-950 text-white rounded-[2.5rem] overflow-hidden p-8 md:p-12 relative">
          
          {/* Subtle design aura blobs */}
          <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-[#FF5E36]/5 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-white/5 blur-3xl pointer-events-none" />

          {/* Left Block: Image advertisement frame */}
          <div className="md:col-span-7 order-2 md:order-1 relative z-10 w-full h-full min-h-[350px] md:min-h-[480px] rounded-2xl overflow-hidden fabric-reveal shadow-xl">
            <Image
              src="/assets/discount_ad_banner.png"
              alt="Limited Festive Discount - Couture Edit"
              fill
              className="object-cover hover:scale-105 transition-transform duration-[1.5s]"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {/* Elegant discount badge overlay */}
            <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/40 shadow-lg flex flex-col items-center">
              <span className="text-[9px] uppercase tracking-widest font-extrabold text-zinc-400">Exclusive Code</span>
              <span className="font-serif text-sm font-bold text-zinc-950 mt-0.5">FESTIVE15</span>
              <span className="text-[9px] font-bold text-[#FF5E36] mt-0.5">15% OFF ALL COUTURE</span>
            </div>
          </div>

          {/* Right Block: Narrative & Call to Action */}
          <div className="md:col-span-5 order-1 md:order-2 flex flex-col justify-center relative z-10">
            <span className="text-[10px] tracking-[0.3em] uppercase text-[#FF5E36] font-bold mb-3 block">
              SEASONAL PRIVILEGE
            </span>
            <h3 className="font-serif text-3xl md:text-5xl font-normal leading-[1.1] mb-6 tracking-tight">
              The Festive <br className="hidden md:block"/>Couture <span className="font-serif italic text-zinc-300">Edit</span>
            </h3>
            <p className="text-zinc-400 font-light text-xs md:text-sm leading-relaxed mb-8">
              Unlock extraordinary savings on our signature collections. Hand-spun silk, intricate zardozi, and handloom masterpieces designed to make every celebration memorable. Enjoy exclusive atelier pricing for a limited time.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/shop?filter=sale"
                className="bg-[#FF5E36] hover:bg-[#E04D27] text-white px-7 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest inline-flex items-center gap-2.5 transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                <span>Shop Festive Sale</span>
                <ArrowRight size={12} />
              </Link>
              <Link
                href="/support"
                className="border border-white/20 hover:border-white/40 hover:bg-white/5 text-white px-7 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300"
              >
                Consult Stylist
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* 9. Frequently Asked Questions */}
      <section className="py-24 px-6 max-w-3xl mx-auto w-full">
        <div className="text-center mb-12 fade-up">
          <span className="text-[10px] tracking-[0.25em] uppercase text-[#FF5E36] font-bold block mb-2">CUSTOMER CONCIERGE</span>
          <h2 className="font-serif text-3xl font-bold text-zinc-950">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3.5 fade-up">
          {[
            {
              q: "How do I order a custom-fit suit?",
              a: "Select your desired garment and size. During standard checkout, you can input custom measurements. Additionally, our concierge team actively contacts all bespoke orders via email or WhatsApp to confirm your proportions."
            },
            {
              q: "What is the typical timeline for bespoke tailoring?",
              a: "Each custom suit is handcrafted by our master designers. Tailoring requires 2 to 3 weeks from measurement confirmation to shipment. Ready-to-wear lines are dispatched within 2–3 business days."
            },
            {
              q: "Do you offer international shipping?",
              a: "Yes, we ship globally. Express transit usually takes 5–7 business days depending on location. Full tracking credentials will be provided upon dispatch."
            },
            {
              q: "Can I request custom modifications to designs?",
              a: "Absolutely. Since each outfit is individually finalized, you can request custom sleeve lengths, necklines, colors, or fabrics. Simply reach out immediately after booking."
            },
            {
              q: "What is your return and exchange policy?",
              a: "Ready-to-wear items can be exchanged within 7 days of delivery. Because customized garments are created strictly to your specifications, they are non-refundable, but we offer free tailoring adjustments if needed."
            }
          ].map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={idx} className="border border-zinc-100 rounded-2xl overflow-hidden bg-zinc-50/50">
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left font-serif font-bold text-base text-zinc-900 hover:text-[#FF5E36] transition-colors focus:outline-none cursor-pointer"
                  aria-expanded={isOpen ? "true" : "false"}
                  aria-label={`Toggle FAQ: ${faq.q}`}
                >
                  <span className="pr-4">{faq.q}</span>
                  <span className={`text-[#FF5E36] transition-transform duration-300 text-lg font-light shrink-0 ${isOpen ? 'rotate-45' : ''}`}>
                    +
                  </span>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-40 opacity-100 p-5 pt-0 border-t border-zinc-100 bg-white' : 'max-h-0 opacity-0 pointer-events-none'
                  }`}
                >
                  <p className="text-zinc-500 text-xs md:text-sm font-light leading-relaxed mt-4">
                    {faq.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 10. Follow us on Instagram Grid */}
      <section className="py-20 border-t border-zinc-100 bg-zinc-50/40 w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12 fade-up">
            <span className="text-[10px] tracking-[0.25em] uppercase text-[#FF5E36] font-bold block mb-2">FOLLOW THE JOURNEY</span>
            <h2 className="font-serif text-3xl font-bold text-zinc-950">@jb51_clothing_house</h2>
            <p className="text-zinc-400 text-xs mt-2 uppercase tracking-widest font-semibold">
              ✦ Share your style using #JB51Atelier ✦
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
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
                className="group relative aspect-square w-full overflow-hidden bg-zinc-900 rounded-2xl border border-zinc-200/50 block shadow-sm"
              >
                <Image
                  src={img.url}
                  alt={img.alt}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                  sizes="(max-width: 768px) 50vw, 20vw"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Instagram className="text-white w-7 h-7 stroke-[1.5]" />
                </div>
              </a>
            ))}
          </div>

          <div className="text-center">
            {/* Desktop: Magnetic Button */}
            <div className="hidden md:block">
              <MagneticButton>
                <a
                  href="https://instagram.com/jb51_clothing_house"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 border border-zinc-900 text-zinc-900 hover:bg-zinc-900 hover:text-white py-3.5 px-8 text-xs tracking-widest uppercase font-bold transition-all duration-300 rounded-full"
                >
                  <Instagram size={14} />
                  <span>Follow @jb51_clothing_house</span>
                </a>
              </MagneticButton>
            </div>

            {/* Mobile: Simple Button */}
            <div className="block md:hidden">
              <a
                href="https://instagram.com/jb51_clothing_house"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-full max-w-[280px] gap-2.5 border border-zinc-900 text-zinc-900 hover:bg-zinc-900 hover:text-white py-3.5 px-6 text-xs tracking-widest uppercase font-bold transition-all duration-300 rounded-full mx-auto"
              >
                <Instagram size={14} />
                <span>Follow @jb51_clothing_house</span>
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
