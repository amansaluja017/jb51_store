'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

export function CategoryGrid() {
  return (
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
            <Image src="https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80" alt="Occasion Wear" fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw" />
          </div>
          <div className="p-4 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 group-hover:text-[#FF5E36] transition-colors">Occasion Wear</span>
            <ArrowRight size={12} className="text-zinc-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Silk Co-ords */}
        <Link href="/shop?category=silk-co-ords" className="group flex flex-col rounded-2xl overflow-hidden bg-zinc-50 border border-zinc-100 hover:shadow-lg transition-all duration-500">
          <div className="relative aspect-[4/5] overflow-hidden w-full fabric-reveal">
            <Image src="https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?auto=format&fit=crop&w=600&q=80" alt="Silk Co-ords" fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw" />
          </div>
          <div className="p-4 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 group-hover:text-[#FF5E36] transition-colors">Silk Co-ords</span>
            <ArrowRight size={12} className="text-zinc-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Velvet Edit */}
        <Link href="/shop?category=velvet-edit" className="group flex flex-col rounded-2xl overflow-hidden bg-zinc-50 border border-zinc-100 hover:shadow-lg transition-all duration-500">
          <div className="relative aspect-[4/5] overflow-hidden w-full fabric-reveal">
            <Image src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80" alt="Velvet Edit" fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw" />
          </div>
          <div className="p-4 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 group-hover:text-[#FF5E36] transition-colors">Velvet Edit</span>
            <ArrowRight size={12} className="text-zinc-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Anarkali Suits */}
        <Link href="/shop?category=anarkali-suits" className="group flex flex-col rounded-2xl overflow-hidden bg-zinc-50 border border-zinc-100 hover:shadow-lg transition-all duration-500">
          <div className="relative aspect-[4/5] overflow-hidden w-full fabric-reveal">
            <Image src="https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80" alt="Anarkali Suits" fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw" />
          </div>
          <div className="p-4 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 group-hover:text-[#FF5E36] transition-colors">Anarkalis</span>
            <ArrowRight size={12} className="text-zinc-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Formal Suits */}
        <Link href="/shop?category=formal-suits" className="group flex flex-col rounded-2xl overflow-hidden bg-zinc-50 border border-zinc-100 hover:shadow-lg transition-all duration-500">
          <div className="relative aspect-[4/5] overflow-hidden w-full fabric-reveal">
            <Image src="https://images.unsplash.com/photo-1620386875077-e322fb810928?auto=format&fit=crop&w=600&q=80" alt="Formal Suits" fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw" />
          </div>
          <div className="p-4 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 group-hover:text-[#FF5E36] transition-colors">Formal Suits</span>
            <ArrowRight size={12} className="text-zinc-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>
    </section>
  );
}
