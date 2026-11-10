'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

import type { AdBannerConfig } from '@/lib/site-config';

interface SeasonalPrivilegeProps {
  config?: AdBannerConfig;
}

export function SeasonalPrivilege({ config }: SeasonalPrivilegeProps) {
  if (config?.enabled === false) {
    return null;
  }

  const tagline = config?.tagline || 'SEASONAL PRIVILEGE';
  const title = config?.title || 'The Festive Couture Edit';
  const subtitle = config?.subtitle || 'Unlock extraordinary savings on signature handcrafted ensembles. Hand-spun silk, intricate zardozi, and heritage loom masterpieces tailored to perfection.';
  const buttonText = config?.buttonText || 'Shop Festive Sale';
  const buttonLink = config?.buttonLink || '/shop?filter=sale';
  const secondaryButtonText = config?.secondaryButtonText || 'Consult Stylist';
  const secondaryButtonLink = config?.secondaryButtonLink || '/support';
  const imageUrl = config?.imageUrl || '/assets/discount_ad_banner.jpg';

  return (
    <section className="w-full relative overflow-hidden bg-zinc-950 text-white my-8 sm:my-14 select-none">
      <div className="relative w-full min-h-[480px] sm:min-h-[520px] md:min-h-[580px] flex items-center">
        
        {/* Full-width Crisp Background Image (100% opacity, no milky wash, no chevron artifacts) */}
        <div className="absolute inset-0 z-0">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover object-[80%_center] md:object-[75%_center]"
            sizes="100vw"
            quality={90}
          />

          {/* Gentle edge gradient on desktop to keep typography crisp on the far left */}
          <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-zinc-950/85 via-zinc-950/40 to-transparent pointer-events-none" />
        </div>

        {/* Text Content Layer (Positioned Above the image) */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-10 md:px-16 w-full py-8 sm:py-12">
          {/* Card on mobile, clean overlay on desktop */}
          <div className="w-full md:w-7/12 lg:w-5/12 flex flex-col items-start text-left bg-zinc-950/85 backdrop-blur-md md:bg-transparent md:backdrop-blur-none p-6 sm:p-8 md:p-0 rounded-3xl md:rounded-none border border-white/10 md:border-0 shadow-2xl md:shadow-none mx-auto md:mx-0 max-w-sm sm:max-w-md md:max-w-none">
            
            {/* Tagline */}
            <span className="text-[10px] sm:text-xs tracking-[0.3em] uppercase text-[#FF5E36] font-bold mb-2.5 block">
              {tagline}
            </span>

            {/* Headline */}
            <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl font-light leading-[1.1] mb-3.5 tracking-tight text-white">
              {title.includes('Couture') ? (
                <>
                  {title.split('Couture')[0]}Couture <span className="font-serif italic text-amber-200">{title.split('Couture')[1] || 'Edit'}</span>
                </>
              ) : (
                title
              )}
            </h2>

            {/* Paragraph Description */}
            <p className="text-zinc-300 font-light text-xs sm:text-sm leading-relaxed mb-5 max-w-md">
              {subtitle}
            </p>

            {/* Exclusive Code Badge */}
            <div className="mb-6 inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15">
              <div className="flex items-center gap-2">
                <span className="text-[9px] uppercase tracking-widest font-extrabold text-zinc-300">Code</span>
                <span className="font-mono text-xs font-bold text-white bg-white/20 px-2 py-0.5 rounded">FESTIVE15</span>
                <span className="text-[10px] font-bold text-[#FF5E36]">• 15% OFF</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              <Link
                href={buttonLink}
                className="bg-[#FF5E36] hover:bg-[#E04D27] text-white px-7 py-3 rounded-full text-xs font-bold uppercase tracking-widest inline-flex items-center justify-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 text-center"
              >
                <span>{buttonText}</span>
                <ArrowRight size={13} />
              </Link>
              {secondaryButtonText && (
                <Link
                  href={secondaryButtonLink}
                  className="border border-white/25 hover:border-white/50 hover:bg-white/5 text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 text-center"
                >
                  {secondaryButtonText}
                </Link>
              )}
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
