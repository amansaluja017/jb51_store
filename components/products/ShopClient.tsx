'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { getProducts, Product, CATEGORIES } from '@/lib/data';
import { ProductCard } from '@/components/products/ProductCard';
import { Filter, X } from 'lucide-react';
import gsap from 'gsap';

export function ShopClient() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(initialCategory);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    getProducts().then(data => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!loading) {
      gsap.fromTo('.product-card', 
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power2.out' }
      );
    }
  }, [loading, activeCategory]);

  const filteredProducts = activeCategory 
    ? products.filter(p => p.category.toLowerCase().replace(/ \/ /g, '-').replace(/ /g, '-') === activeCategory)
    : products;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 w-full flex flex-col md:flex-row gap-12">
      
      {/* Mobile Filter Toggle */}
      <div className="md:hidden flex justify-between items-center border-b border-brand-charcoal/10 pb-4 mb-4">
        <h1 className="font-serif text-3xl">Collection</h1>
        <button onClick={() => setIsFilterOpen(true)} className="flex items-center gap-2 text-sm tracking-widest uppercase">
          <Filter size={16} /> Filters
        </button>
      </div>

      {/* Sidebar Filters */}
      <div className={`
        fixed inset-0 z-50 bg-brand-cream p-6 transition-transform duration-300 md:static md:translate-x-0 md:bg-transparent md:p-0 md:w-64 md:flex-shrink-0
        ${isFilterOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex justify-between items-center mb-10 md:hidden">
          <span className="font-serif text-2xl">Filters</span>
          <button onClick={() => setIsFilterOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <div className="hidden md:block mb-12">
          <h1 className="font-serif text-4xl mb-2">Collection</h1>
          <p className="text-brand-charcoal/60 text-sm">{products.length} pieces</p>
        </div>

        <div className="space-y-10">
          <div>
            <h3 className="text-xs tracking-widest uppercase font-medium mb-6">Categories</h3>
            <ul className="space-y-4">
              <li>
                <button 
                  onClick={() => { setActiveCategory(null); setIsFilterOpen(false); }}
                  className={`text-sm hover:text-brand-charcoal transition-colors ${!activeCategory ? 'text-brand-charcoal font-medium' : 'text-brand-charcoal/60'}`}
                >
                  All Pieces
                </button>
              </li>
              {CATEGORIES.map(cat => {
                const catSlug = cat.toLowerCase().replace(/ \/ /g, '-').replace(/ /g, '-');
                return (
                  <li key={cat}>
                    <button 
                      onClick={() => { setActiveCategory(catSlug); setIsFilterOpen(false); }}
                      className={`text-sm hover:text-brand-charcoal transition-colors ${activeCategory === catSlug ? 'text-brand-charcoal font-medium' : 'text-brand-charcoal/60'}`}
                    >
                      {cat}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="flex-1">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="aspect-[3/4] bg-brand-charcoal/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            {filteredProducts.map(product => (
              <div key={product.id} className="product-card">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
        
        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-32">
            <h3 className="font-serif text-2xl mb-4">No pieces found</h3>
            <p className="text-brand-charcoal/60 mb-8">We couldn't find any pieces matching your current filters.</p>
            <button 
              onClick={() => setActiveCategory(null)}
              className="border-b border-brand-charcoal pb-1 text-sm tracking-widest uppercase"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
