'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ProductCard } from '@/components/products/ProductCard';
import { type Product } from '@repo/products';

interface ProductRowProps {
  title: string;
  tagline: string;
  products: Product[];
  viewAllHref: string;
  viewAllText: string;
}

export function ProductRow({ title, tagline, products, viewAllHref, viewAllText }: ProductRowProps) {
  return (
    <section className="py-20 px-6 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-end mb-10 fade-up">
        <div>
          <span className="text-[10px] tracking-[0.25em] uppercase text-[#FF5E36] font-bold block mb-2">{tagline}</span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-zinc-950 tracking-tight">{title}</h2>
        </div>
        <Link href={viewAllHref} className="text-xs font-bold text-[#FF5E36] hover:text-[#E04D27] flex items-center gap-1 uppercase tracking-widest border-b border-transparent hover:border-[#E04D27] pb-1 transition-all">
          <span>{viewAllText}</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 fade-up">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
