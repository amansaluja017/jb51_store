'use client';

import { ArrowRight } from 'lucide-react';
import { WHATSAPP_NUMBER } from '@/lib/utils';
import { useAnalytics } from '@/hooks/useAnalytics';

const LotusIcon = ({ className = "w-6 h-6 text-[#FF5E36]" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
    <path d="M12 4C12 4 9 10 12 20C15 10 12 4 12 4Z" fill="currentColor" fillOpacity="0.08" />
    <path d="M12 12C9 9 4 11 6 18C10 18 11 14 12 12Z" fill="currentColor" fillOpacity="0.04" />
    <path d="M12 12C15 9 20 11 18 18C14 18 13 14 12 12Z" fill="currentColor" fillOpacity="0.04" />
    <path d="M10 21C11 21.5 13 21.5 14 21" strokeLinecap="round" />
  </svg>
);

export function HeritageCraftBanner() {
  const { trackEvent } = useAnalytics();
  return (
    <section className="max-w-7xl mx-auto px-6 mb-24 mt-12 w-full">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center bg-brand-maroon text-brand-cream rounded-[2.5rem] overflow-hidden p-8 md:p-12 relative shadow-xl shadow-brand-maroon/5 pattern-jaali">
        {/* Light glow effects */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-brand-gold/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        
        {/* Left Block: Narrative */}
        <div className="md:col-span-7 flex flex-col justify-center relative z-10">
          <span className="text-[10px] tracking-[0.3em] uppercase text-brand-gold font-bold mb-3 block">
            HERITAGE CRAFT
          </span>
          <h2 className="font-serif text-3xl md:text-5xl font-light leading-[1.1] mb-6 tracking-tight">
            Sustaining the Craft <br className="hidden md:block"/>of Indian <span className="font-serif italic text-brand-gold">Karigars</span>
          </h2>
          <p className="text-brand-cream/80 font-light text-xs md:text-sm leading-relaxed mb-8 max-w-xl">
            Every drape, pleat, and embroidery detail is hand-guided by master artisans who preserve century-old textiles heritage. We partner directly with weaver guilds in Banaras, Lucknow, and Chanderi—bypassing middlemen to ensure fair wages and keep historical Indian loom arts alive.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent({ type: 'whatsapp' })}
              className="bg-brand-gold hover:bg-brand-gold/90 text-brand-brown px-7 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest inline-flex items-center gap-2.5 transition-all duration-300 shadow-md"
            >
              <span>Consult Weaver Guild</span>
              <ArrowRight size={12} />
            </a>
          </div>
        </div>

        {/* Right Block: Motif Decoration */}
        <div className="md:col-span-5 flex items-center justify-center relative z-10 p-4">
          <div className="w-56 h-56 rounded-full border border-brand-gold/25 flex items-center justify-center relative bg-brand-burgundy/40 backdrop-blur-sm">
            <div className="absolute inset-2 border border-dashed border-brand-gold/15 rounded-full" />
            <div className="absolute inset-4 border border-brand-gold/5 rounded-full" />
            <LotusIcon className="w-20 h-20 text-brand-gold opacity-90 stroke-[1.2]" />
          </div>
        </div>
      </div>
    </section>
  );
}
