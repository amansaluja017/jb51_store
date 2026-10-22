'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

export function BespokeBanner() {
  return (
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
          <h2 className="font-serif text-3xl md:text-5xl font-normal leading-[1.1] mb-6 tracking-tight">
            The Art <br className="hidden md:block" />of Custom <span className="font-serif italic text-zinc-300">Drape</span>
          </h2>
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
  );
}
