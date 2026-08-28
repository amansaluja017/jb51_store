'use client';

import Image from 'next/image';
import { Instagram } from 'lucide-react';
import { MagneticButton } from '@/components/ui/magnetic-button';

export function InstagramFeed() {
  const images = [
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
  ];

  return (
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
          {images.map((img, idx) => (
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
  );
}
