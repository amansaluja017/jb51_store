'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { AdBannerConfig } from '@/lib/site-config';

interface BespokeBannerProps {
  config?: AdBannerConfig;
}

// Delicate Diamond Sparkle Motif (inspired by reference festive jewelry typography)
const SparkleMotif = () => (
  <div className="flex flex-col items-center justify-center gap-1 select-none opacity-90 shrink-0" aria-hidden="true">
    <span className="text-[7px] sm:text-[9px] text-amber-800 leading-none">✦</span>
    <div className="flex items-center gap-1 leading-none">
      <span className="text-[7px] sm:text-[9px] text-amber-800">✦</span>
      <span className="text-[10px] sm:text-xs text-amber-900 font-bold">✦</span>
      <span className="text-[7px] sm:text-[9px] text-amber-800">✦</span>
    </div>
    <span className="text-[7px] sm:text-[9px] text-amber-800 leading-none">✦</span>
  </div>
);

export function BespokeBanner({ config }: BespokeBannerProps) {
  const tagline = config?.tagline || 'JB51 COUTURE';
  const title = config?.title && config.title !== 'The Art of Custom Drape' ? config.title : 'Diwali SALE';
  const subtitle = config?.subtitle && !config.subtitle.startsWith('Experience the pinnacle') ? config.subtitle : '1000+ Pieces Starting at';
  const price = '₹999';
  const buttonText = config?.buttonText || 'SHOP NOW';
  const buttonLink = config?.buttonLink && config.buttonLink !== '/support' ? config.buttonLink : '/shop?filter=sale';
  const imageUrl = config?.imageUrl && config.imageUrl !== '/assets/luxury_ad_banner.png' 
    ? config.imageUrl 
    : '/assets/festive_ad_banner.jpg';

  return (
    <section className="w-full relative overflow-hidden my-8 sm:my-14 select-none">
      <div className="relative w-full md:aspect-[21/9] min-h-[480px] sm:min-h-[520px] md:min-h-[540px] lg:min-h-[600px] flex items-center">
        
        {/* Full-width Crisp Background Image (NO milky or fading overlays) */}
        <div className="absolute inset-0 z-0">
          <Image
            src={imageUrl}
            alt={title}
            fill
            priority
            className="object-cover object-[78%_center] md:object-center"
            sizes="100vw"
            quality={95}
          />
          {/* Subtle gradient on desktop for extra text crispness on the left side */}
          <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-[#FAF6F0]/40 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Text Content Layer (Positioned Above the image on the left) */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-10 md:px-16 w-full py-8 sm:py-12">
          {/* Frosted card on mobile for flawless contrast, clean transparent layout on desktop */}
          <div className="w-full md:w-1/2 lg:w-5/12 flex flex-col items-center text-center bg-white/85 sm:bg-white/90 backdrop-blur-md md:bg-transparent md:backdrop-blur-none p-6 sm:p-8 md:p-0 rounded-3xl md:rounded-none border border-amber-900/10 md:border-0 shadow-xl md:shadow-none mx-auto md:mx-0 max-w-sm sm:max-w-md md:max-w-none">
            
            {/* Top brand tagline */}
            <span className="text-[10px] sm:text-xs tracking-[0.3em] uppercase text-zinc-700 font-bold mb-2 sm:mb-3.5 block">
              {tagline}
            </span>

            {/* Festive Title with Sparkling Diamond Motifs on both sides */}
            <div className="flex items-center justify-center gap-2.5 sm:gap-5 mb-2 sm:mb-3">
              <SparkleMotif />
              <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl text-zinc-950 font-normal leading-[1.05] tracking-tight">
                {title}
              </h2>
              <SparkleMotif />
            </div>

            {/* Offer / Pieces text */}
            <p className="text-xs sm:text-sm md:text-base text-zinc-800 font-medium tracking-wide mb-1">
              {subtitle}
            </p>

            {/* Big Prominent Price */}
            <div className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-zinc-950 mb-5 sm:mb-6 tracking-tight">
              {price}
            </div>

            {/* Clean Rectangular CTA Button (as seen in reference) */}
            <Link
              href={buttonLink}
              className="w-full sm:w-auto inline-flex items-center justify-center border-2 border-zinc-950 bg-white/95 hover:bg-zinc-950 hover:text-white text-zinc-950 px-8 sm:px-11 py-3 text-xs uppercase tracking-[0.25em] font-bold transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer text-center"
            >
              {buttonText}
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
