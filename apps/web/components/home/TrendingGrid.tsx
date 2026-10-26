'use client';

import { useState } from 'react';
import { ProductCard } from '@/components/products/ProductCard';
import { type Product } from '@repo/products';

interface TrendingGridProps {
  products: Product[];
}

export function TrendingGrid({ products }: TrendingGridProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'bespoke' | 'pret'>('all');

  const getFilteredProducts = () => {
    const listedProducts = products.filter(p => p.isListed !== false);
    if (activeTab === 'bespoke') {
      return listedProducts.filter(p => ['Occasion Wear', 'Anarkali Suits'].includes(p.category)).slice(0, 3);
    }
    if (activeTab === 'pret') {
      return listedProducts.filter(p => ['Silk Co-ords', 'Velvet Edit', 'Formal Suits'].includes(p.category)).slice(0, 3);
    }
    return listedProducts.slice(0, 3);
  };

  const filteredProducts = getFilteredProducts();

  return (
    <section id="curated-silhouettes" className="py-20 px-6 max-w-7xl mx-auto w-full bg-zinc-50 rounded-[2.5rem] relative overflow-hidden my-12">
      <div className="absolute top-12 left-12 text-zinc-200/40 font-serif text-[130px] select-none pointer-events-none hidden xl:block font-bold">
        COLLECTION
      </div>

      <div className="text-center mb-10 silhouette-header relative z-10">
        <span className="text-[10px] tracking-[0.25em] uppercase text-[#FF5E36] font-bold block mb-2">HANDPICKED CURATION</span>
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-zinc-950 tracking-tight">Curated Silhouettes</h2>
      </div>

      {/* Dynamic Category Tabs */}
      <div className="flex justify-center items-center gap-6 md:gap-10 mb-12 border-b border-zinc-200 max-w-md mx-auto pb-3 silhouette-tabs relative z-10">
        {[
          { id: 'all', label: 'All' },
          { id: 'bespoke', label: 'Bespoke' },
          { id: 'pret', label: 'Ready-to-Wear' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`font-semibold tracking-wider text-xs uppercase pb-2 transition-all duration-300 border-b-2 focus:outline-none cursor-pointer ${activeTab === tab.id
                ? 'border-[#FF5E36] text-[#FF5E36]'
                : 'border-transparent text-zinc-400 hover:text-zinc-800'
              }`}
            aria-label={`Filter by category ${tab.label}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start pt-4 relative z-10">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="silhouette-card relative flex flex-col"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-zinc-400 text-sm tracking-wider relative z-10">
          No silhouettes in this curation yet.
        </div>
      )}
    </section>
  );
}
