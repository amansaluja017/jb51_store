import React from 'react';
import Image from 'next/image';

interface ShopHeaderProps {
  activeCategory: string | null;
  activeFilter: string | null;
  displayedCount: number;
  totalCategories: number;
}

export const LotusIcon = ({ className = "w-6 h-6 text-[#FF5E36]" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
    <path d="M12 4C12 4 9 10 12 20C15 10 12 4 12 4Z" fill="currentColor" fillOpacity="0.08" />
    <path d="M12 12C9 9 4 11 6 18C10 18 11 14 12 12Z" fill="currentColor" fillOpacity="0.04" />
    <path d="M12 12C15 9 20 11 18 18C14 18 13 14 12 12Z" fill="currentColor" fillOpacity="0.04" />
    <path d="M10 21C11 21.5 13 21.5 14 21" strokeLinecap="round" />
  </svg>
);

export function ShopHeader({
  activeCategory,
  activeFilter,
  displayedCount,
  totalCategories,
}: ShopHeaderProps) {
  const getCategoryTitle = () => {
    if (activeCategory) {
      return activeCategory.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
    if (activeFilter === 'new') return 'New Arrivals';
    if (activeFilter === 'bestseller') return 'Bestsellers';
    return 'Our Curation';
  };

  const getCategoryDescription = () => {
    switch (activeCategory) {
      case 'formal-suits':
        return 'Tailored silhouettes meeting heritage fabrics. Discover structured elegance engineered for occasion wear and power dressing.';
      case 'anarkali-suits':
        return 'Regal volume, sweeping lengths, and intricate zardozi hand-embroidery. Pure georgette and silk structures crafted for grandeur.';
      case 'silk-co-ords':
        return 'Minimalism infused with handloom luxury. Lightweight, fluid silk sets designed for contemporary versatility and refined lounging.';
      case 'velvet-edit':
        return 'Indulgent, plush micro-velvets adorned with traditional tilla and dabka handcraft. The epitome of royal winter ensembles.';
      case 'occasion-wear':
        return 'Signature hand-crafted sarees, shararas, and heavy ensembles curated to celebrate your milestone moments.';
      default:
        return 'Explore our catalog of luxury handloom textiles, contemporary silhouettes, and bespoke tailoring. Each piece is individually crafted to celebrate heritage Indian craftsmanship.';
    }
  };

  return (
    <section className="relative pt-32 pb-16 lg:pt-40 lg:pb-24 px-6 border-b border-zinc-200/60 overflow-hidden bg-[#FAF9F5] text-zinc-900 select-none">
      {/* Decorative Grid Backdrop */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000003_1px,transparent_1px),linear-gradient(to_bottom,#00000003_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Glow effects */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#FF5E36]/5 blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-black/5 blur-[80px] pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        {/* Left: Typography & Editorial Description */}
        <div className="lg:col-span-7 flex flex-col justify-center text-left">
          <div className="inline-flex items-center gap-2 mb-4">
            <LotusIcon className="w-5 h-5 text-[#FF5E36]" />
            <span className="text-[10px] tracking-[0.3em] uppercase text-[#FF5E36] font-bold font-sans">
              Store Catalog
            </span>
          </div>

          <h1 className="font-serif text-4xl md:text-6xl font-bold text-zinc-900 tracking-tight mb-6 leading-tight">
            {getCategoryTitle()}
          </h1>

          <div className="w-20 h-[3px] bg-[#FF5E36] mb-6 rounded-full" />

          <p className="text-zinc-600 text-xs md:text-sm font-light max-w-xl leading-relaxed tracking-wide mb-8">
            {getCategoryDescription()}
          </p>

          {/* Quick Stats Panel */}
          <div className="flex gap-8 border-t border-zinc-200/80 pt-6">
            <div>
              <span className="block text-2xl font-serif font-bold text-zinc-900">
                {displayedCount}
              </span>
              <span className="text-[9px] tracking-wider uppercase text-zinc-400 font-bold">
                Loaded Creations
              </span>
            </div>
            <div className="border-l border-zinc-200/80 pl-8">
              <span className="block text-2xl font-serif font-bold text-zinc-900">
                {totalCategories}
              </span>
              <span className="text-[9px] tracking-wider uppercase text-zinc-400 font-bold">
                Collections
              </span>
            </div>
            <div className="border-l border-zinc-200/80 pl-8">
              <span className="block text-2xl font-serif font-bold text-zinc-900">
                100%
              </span>
              <span className="text-[9px] tracking-wider uppercase text-zinc-400 font-bold">
                Custom Fit
              </span>
            </div>
          </div>
        </div>

        {/* Right: Premium Editorial Double Collage */}
        <div className="lg:col-span-5 relative w-full h-[320px] md:h-[400px] flex items-center justify-center mt-6 lg:mt-0 select-none">
          {/* Main Portrait Frame */}
          <div className="absolute w-[60%] h-[85%] rounded-[2rem] overflow-hidden border border-black/5 shadow-2xl z-10 transform -rotate-3 hover:rotate-0 transition-transform duration-550 ease-out group">
            <Image
              src="https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?auto=format&fit=crop&w=800&q=80"
              alt="Main curation"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          </div>

          {/* Overlapping Offset Frame */}
          <div className="absolute w-[45%] h-[65%] rounded-[1.5rem] overflow-hidden border border-black/5 shadow-2xl z-20 bottom-0 left-[5%] transform rotate-6 hover:rotate-2 transition-transform duration-550 ease-out group">
            <Image
              src="https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80"
              alt="Detail curation"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          </div>

          {/* Floating Seal */}
          <div className="absolute -top-4 right-[10%] w-16 h-16 rounded-full bg-[#FF5E36] text-white flex flex-col items-center justify-center z-30 shadow-lg animate-pulse">
            <span className="text-[7px] tracking-[0.25em] uppercase font-bold text-white/80 font-sans">Est.</span>
            <span className="text-[10px] tracking-widest font-serif font-bold">1951</span>
          </div>
        </div>
      </div>
    </section>
  );
}
