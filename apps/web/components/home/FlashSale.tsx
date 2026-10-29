'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { FormattedRichText } from '@/components/ui/FormattedRichText';

import type { SaleSectionConfig } from '@/lib/site-config';

interface FlashSaleProps {
  config?: SaleSectionConfig;
}

export function FlashSale({ config }: FlashSaleProps) {
  // If the sale section is explicitly disabled by admin, remove the offer
  if (!config || config.enabled === false) {
    return null;
  }

  // Pre-calculate target end time
  const targetEpoch = config.endTime
    ? new Date(config.endTime).getTime()
    : ((config.hoursLeft || 0) * 3600 + (config.minutesLeft || 0) * 60 + (config.secondsLeft || 0) > 0)
    ? Date.now() + ((config.hoursLeft || 0) * 3600 + (config.minutesLeft || 0) * 60 + (config.secondsLeft || 0)) * 1000
    : 0;

  // If time already expired before render, remove the offer immediately
  if (targetEpoch > 0 && targetEpoch <= Date.now()) {
    return null;
  }

  const [isExpired, setIsExpired] = useState(targetEpoch > 0 && targetEpoch <= Date.now());
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: config.hoursLeft || 0,
    minutes: config.minutesLeft || 0,
    seconds: config.secondsLeft || 0,
  });

  // Real-time countdown timer logic
  useEffect(() => {
    if (!config || config.enabled === false) return;

    const calcTarget = config.endTime
      ? new Date(config.endTime).getTime()
      : Date.now() + ((config.hoursLeft || 0) * 3600 + (config.minutesLeft || 0) * 60 + (config.secondsLeft || 0)) * 1000;

    const tick = () => {
      const diff = calcTarget - Date.now();
      if (diff <= 0) {
        setIsExpired(true);
        return false;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ hours, minutes, seconds });
      return true;
    };

    const active = tick();
    if (!active) return;

    const interval = setInterval(() => {
      const stillActive = tick();
      if (!stillActive) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [config?.endTime, config?.hoursLeft, config?.minutesLeft, config?.secondsLeft, config?.enabled]);

  // After the countdown completes, automatically remove the offer from the web view
  if (isExpired) {
    return null;
  }

  const bgImage = config.bannerImageUrl || 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1920&q=80';

  return (
    <section className="py-24 overflow-hidden bg-zinc-950 text-white relative">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-15 parallax-bg mix-blend-overlay"
        style={{ backgroundImage: `url('${bgImage}')` }}
      />

      {/* Aura light blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#FF5E36]/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-zinc-200/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <span className="text-[10px] md:text-xs tracking-[0.35em] uppercase text-[#FF5E36] mb-5 font-bold block">
          {config?.tagline || (config?.discountPercentage ? `UP TO ${config.discountPercentage}% OFF` : 'LIMITED TIME PROMO')}
        </span>
        <h2 className="font-serif text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight leading-tight">
          {config?.title || 'Summer Season Flash Sale'}
        </h2>
        <div className="max-w-md mx-auto mb-10">
          <FormattedRichText
            text={config?.subtitle || 'Enjoy exclusive seasonal discounts on selected traditional designs and ready-to-wear silk co-ords. Offer expires shortly.'}
            paragraphClassName="text-zinc-400 text-xs md:text-sm font-light leading-relaxed"
          />
        </div>

        {/* Live Countdown Timer (Hours, Minutes, Seconds) */}
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
          href={config?.buttonLink || '/shop?filter=sale'}
          className="inline-flex items-center gap-2.5 bg-[#FF5E36] hover:bg-[#E04D27] text-white px-8 py-4 text-xs tracking-widest uppercase font-bold transition-all duration-300 rounded-full shadow-md hover:shadow-lg hover:scale-105"
        >
          <span>{config?.buttonText || 'Claim Discount'}</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  );
}
