'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { type Product, CATEGORIES } from '@repo/products';
import { api } from '@/lib/trpc/client/react';
import { ProductCard } from '@/components/products/ProductCard';
import { Filter, X, ChevronRight, SlidersHorizontal, ArrowRight, Sparkles } from 'lucide-react';
import gsap from 'gsap';

export function ShopClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const initialCategory = searchParams.get('category');
  const initialFilter = searchParams.get('filter');
  
  const { data: products = [], isLoading: loading } = api.products.getAll.useQuery();
  const [activeCategory, setActiveCategory] = useState<string | null>(initialCategory);
  const [activeFilter, setActiveFilter] = useState<string | null>(initialFilter);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Sync state with URL params changes
  useEffect(() => {
    setActiveCategory(searchParams.get('category'));
    setActiveFilter(searchParams.get('filter'));
  }, [searchParams]);

  useEffect(() => {
    if (!loading) {
      gsap.fromTo('.product-card-wrapper', 
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.0, stagger: 0.08, ease: 'power3.out' }
      );
    }
  }, [loading, activeCategory, activeFilter]);

  const handleCategorySelect = (catSlug: string | null) => {
    setIsFilterOpen(false);
    if (catSlug) {
      router.push(`/shop?category=${catSlug}`);
    } else {
      router.push('/shop');
    }
  };

  const handleFilterSelect = (filterVal: string | null) => {
    setIsFilterOpen(false);
    if (filterVal) {
      router.push(`/shop?filter=${filterVal}`);
    } else {
      router.push('/shop');
    }
  };

  // Combine category filter and custom filters
  let filteredProducts = products;
  
  if (activeFilter === 'new') {
    filteredProducts = filteredProducts.filter(p => p.newArrival);
  } else if (activeFilter === 'bestseller') {
    filteredProducts = filteredProducts.filter(p => p.bestseller);
  }
  
  if (activeCategory) {
    filteredProducts = filteredProducts.filter(
      p => p.category.toLowerCase().replace(/ \/ /g, '-').replace(/ /g, '-') === activeCategory
    );
  }

  // Calculate product counts
  const totalCount = products.length;
  const newArrivalsCount = products.filter(p => p.newArrival).length;
  const bestsellersCount = products.filter(p => p.bestseller).length;

  return (
    <div className="w-full bg-brand-ivory text-brand-brown min-h-screen">
      
      {/* Redesigned Luxury Hero Header */}
      <section className="relative pt-36 pb-20 px-6 bg-brand-paper border-b border-brand-maroon/10 overflow-hidden">
        {/* Decorative linework */}
        <div className="absolute inset-0 opacity-[0.015] pointer-events-none bg-[url('https://picsum.photos/seed/curation/1920/1080')] bg-cover bg-center" />
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-brand-sand/30 blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <span className="font-script text-4xl text-brand-saffron block mb-3">Atelier Collections</span>
          <h1 className="font-serif text-4xl md:text-6xl text-brand-maroon tracking-wide mb-6">
            {activeCategory 
              ? activeCategory.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
              : activeFilter === 'new' 
              ? 'New Arrivals' 
              : activeFilter === 'bestseller'
              ? 'Bestsellers'
              : 'The Full Curation'
            }
          </h1>
          <div className="h-[1px] bg-brand-maroon/20 w-36 mx-auto mb-6" />
          <p className="text-brand-brown/70 text-xs md:text-sm font-light max-w-xl mx-auto leading-relaxed tracking-wider">
            Discover bespoke tailoring, premium textiles, and contemporary drapes. Meticulously finished by our master artisans to elevate your wardrobe.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="max-w-7xl mx-auto px-6 py-12 w-full">
        
        {/* Stats and Mobile Filter Bar */}
        <div className="flex justify-between items-center border-b border-brand-maroon/10 pb-6 mb-10">
          <div className="flex items-center gap-4">
            <span className="text-[10px] tracking-widest uppercase font-semibold text-brand-terracotta">
              {filteredProducts.length} Silhouettes
            </span>
            {(activeCategory || activeFilter) && (
              <button 
                onClick={() => {
                  router.push('/shop');
                  setActiveCategory(null);
                  setActiveFilter(null);
                }}
                className="text-[10px] tracking-widest uppercase underline text-brand-maroon/60 hover:text-brand-maroon transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
          
          <button 
            onClick={() => setIsFilterOpen(true)} 
            className="lg:hidden flex items-center gap-2 text-xs tracking-widest uppercase border border-brand-maroon/20 px-4 py-2 bg-brand-cream/40"
          >
            <SlidersHorizontal size={14} />
            <span>Filters</span>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 items-start">
          
          {/* Desktop Left Sidebar Filter Menu */}
          <aside className={`
            fixed inset-0 z-50 bg-brand-cream p-8 transition-transform duration-500 lg:static lg:translate-x-0 lg:bg-transparent lg:p-0 lg:w-64 lg:flex-shrink-0
            ${isFilterOpen ? 'translate-x-0' : '-translate-x-full'}
          `}>
            {/* Mobile Header for Filters */}
            <div className="flex justify-between items-center mb-10 lg:hidden">
              <span className="font-serif text-2xl text-brand-maroon">Curation Filters</span>
              <button 
                onClick={() => setIsFilterOpen(false)}
                className="p-2 border border-brand-maroon/10 rounded-full"
              >
                <X size={20} className="text-brand-maroon" />
              </button>
            </div>

            {/* Filter Categories */}
            <div className="space-y-10">
              
              {/* Curation Sort / Drop */}
              <div>
                <h3 className="text-[10px] tracking-[0.2em] uppercase font-bold text-brand-terracotta mb-6 border-b border-brand-maroon/10 pb-2">
                  Curation Drop
                </h3>
                <ul className="space-y-4">
                  <li>
                    <button 
                      onClick={() => handleFilterSelect(null)}
                      className={`text-xs tracking-wider uppercase transition-colors flex justify-between items-center w-full ${!activeFilter ? 'text-brand-maroon font-semibold' : 'text-brand-brown/60 hover:text-brand-maroon'}`}
                    >
                      <span>All Masterpieces</span>
                      <span className="text-[9px] opacity-60">({totalCount})</span>
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => handleFilterSelect('new')}
                      className={`text-xs tracking-wider uppercase transition-colors flex justify-between items-center w-full ${activeFilter === 'new' ? 'text-brand-maroon font-semibold' : 'text-brand-brown/60 hover:text-brand-maroon'}`}
                    >
                      <span>New Drops</span>
                      <span className="text-[9px] opacity-60">({newArrivalsCount})</span>
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => handleFilterSelect('bestseller')}
                      className={`text-xs tracking-wider uppercase transition-colors flex justify-between items-center w-full ${activeFilter === 'bestseller' ? 'text-brand-maroon font-semibold' : 'text-brand-brown/60 hover:text-brand-maroon'}`}
                    >
                      <span>Bestsellers</span>
                      <span className="text-[9px] opacity-60">({bestsellersCount})</span>
                    </button>
                  </li>
                </ul>
              </div>

              {/* Product Categories */}
              <div>
                <h3 className="text-[10px] tracking-[0.2em] uppercase font-bold text-brand-terracotta mb-6 border-b border-brand-maroon/10 pb-2">
                  Silhouettes
                </h3>
                <ul className="space-y-4">
                  {CATEGORIES.map(cat => {
                    const catSlug = cat.toLowerCase().replace(/ \/ /g, '-').replace(/ /g, '-');
                    const count = products.filter(p => p.category === cat).length;
                    return (
                      <li key={cat}>
                        <button 
                          onClick={() => handleCategorySelect(catSlug)}
                          className={`text-xs tracking-wider uppercase transition-colors flex justify-between items-center w-full ${activeCategory === catSlug ? 'text-brand-maroon font-semibold' : 'text-brand-brown/60 hover:text-brand-maroon'}`}
                        >
                          <span>{cat}</span>
                          <span className="text-[9px] opacity-60">({count})</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

            </div>
          </aside>

          {/* Product Grid Area */}
          <div className="flex-1 w-full">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="flex flex-col gap-4">
                    <div className="aspect-[3/4] bg-brand-maroon/5 animate-pulse rounded-2xl" />
                    <div className="h-4 bg-brand-maroon/5 animate-pulse w-3/4 rounded" />
                    <div className="h-4 bg-brand-maroon/5 animate-pulse w-1/4 rounded" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
                {filteredProducts.map(product => (
                  <div key={product.id} className="product-card-wrapper">
                    <div className="relative w-full rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                      <ProductCard product={product} />
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Empty State */}
            {!loading && filteredProducts.length === 0 && (
              <div className="text-center py-24 border border-dashed border-brand-maroon/20 rounded-2xl bg-brand-cream/20">
                <Sparkles size={36} className="mx-auto text-brand-saffron mb-4 animate-pulse" />
                <h3 className="font-serif text-2xl text-brand-maroon mb-3">No silhouettes found</h3>
                <p className="text-brand-brown/60 text-xs md:text-sm mb-8 max-w-sm mx-auto">
                  We couldn't find any masterpieces matching your selections. Try resetting filters to browse our full catalog.
                </p>
                <button 
                  onClick={() => {
                    router.push('/shop');
                    setActiveCategory(null);
                    setActiveFilter(null);
                  }}
                  className="inline-flex items-center gap-2 text-xs tracking-widest uppercase border border-brand-maroon text-brand-maroon hover:bg-brand-maroon hover:text-brand-cream px-6 py-3 transition-colors rounded-full font-semibold"
                >
                  <span>Reset All Filters</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            )}
          </div>

        </div>
      </section>

    </div>
  );
}
