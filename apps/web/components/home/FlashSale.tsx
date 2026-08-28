'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function FlashSale() {
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 45, seconds: 30 });

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

  return (
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

        {/* Live Countdown Timer */}
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
  );
}
