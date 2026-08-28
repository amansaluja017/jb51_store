'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

export function SeasonalPrivilege() {
  return (
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
  );
}
