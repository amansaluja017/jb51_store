'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Play } from 'lucide-react';

interface SlideProduct {
  name: string;
  price: number;
  img: string;
  slug: string;
}

interface Slide {
  image: string;
  tagline: string;
  title: string;
  subtitle: string;
  badgeProduct: SlideProduct;
}

interface HeroSliderProps {
  slides: Slide[];
  currentSlide: number;
  setCurrentSlide: (slide: number) => void;
}

export function HeroSlider({ slides, currentSlide, setCurrentSlide }: HeroSliderProps) {
  const handleScrollToAtelier = () => {
    const curatedSection = document.getElementById('curated-silhouettes');
    if (curatedSection) {
      curatedSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
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
              className="object-cover opacity-85 transition-transform duration-[2000ms] ease-out scale-100"
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
                  <Image
                    src={slide.badgeProduct.img}
                    alt={slide.badgeProduct.name}
                    fill
                    priority={idx === 0}
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col text-left pr-2">
                  <span className="text-[8px] tracking-wider uppercase font-bold text-zinc-400">Featured Outfit</span>
                  <span className="text-xs font-serif font-bold text-zinc-950 group-hover:text-[#FF5E36] transition-colors">{slide.badgeProduct.name}</span>
                  <span className="text-xs font-bold text-[#FF5E36] mt-0.5">
                    {slide.badgeProduct.price.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div className="w-7 h-7 rounded-full bg-[#FF5E36] text-white flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                  <ArrowRight size={12} />
                </div>
              </Link>
            )}

            {/* Center-Left Content block */}
            <div className="absolute inset-0 flex items-center z-20 px-6 md:px-12 max-w-7xl mx-auto w-full">
              <div className={`max-w-2xl text-left transition-all duration-700 delay-100 ${
                idx === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}>
                {/* Tagline */}
                <span className="text-[10px] md:text-xs tracking-[0.35em] uppercase text-[#FF5E36] font-bold mb-4 block">
                  {slide.tagline}
                </span>

                {/* Title */}
                <h1 className="font-serif text-5xl md:text-7xl lg:text-[4.6rem] xl:text-[5.4rem] text-white leading-[1.08] mb-6 font-bold tracking-tight">
                  {slide.title}
                </h1>

                {/* Subtitle */}
                <p className="text-zinc-300 font-light text-xs md:text-sm max-w-md mb-8 leading-relaxed">
                  {slide.subtitle}
                </p>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-4">
                  <Link
                    href="/shop"
                    className="bg-[#FF5E36] hover:bg-[#E04D27] text-white px-8 py-4 rounded-full text-xs font-bold uppercase tracking-widest inline-flex items-center gap-2.5 transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                  >
                    <span>Shop Collection</span>
                    <ArrowRight size={14} />
                  </Link>

                  <button
                    onClick={handleScrollToAtelier}
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
  );
}
