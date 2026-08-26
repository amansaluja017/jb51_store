'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { type Product, CATEGORIES } from '@repo/products';
import { api } from '@/lib/trpc/client/react';
import { ProductCard } from '@/components/products/ProductCard';
import { X, SlidersHorizontal, ArrowRight, Sparkles, Sliders, ChevronDown } from 'lucide-react';
import gsap from 'gsap';
import { Dropdown } from '@/components/ui/Dropdown';

export function ShopClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const initialCategory = searchParams.get('category');
  const initialFilter = searchParams.get('filter');
  
  const { data: products = [], isLoading: loading } = api.products.getAll.useQuery();
  const [activeCategory, setActiveCategory] = useState<string | null>(initialCategory);
  const [activeFilter, setActiveFilter] = useState<string | null>(initialFilter);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Interactive Filters state
  const [sortBy, setSortBy] = useState<string>('featured');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number>(35000); // Max product price

  // Sync state with URL params changes
  useEffect(() => {
    setActiveCategory(searchParams.get('category'));
    setActiveFilter(searchParams.get('filter'));
  }, [searchParams]);

  useEffect(() => {
    if (!loading) {
      gsap.killTweensOf('.product-card-wrapper');
      gsap.fromTo('.product-card-wrapper', 
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.05, ease: 'power2.out' }
      );
    }
  }, [loading, activeCategory, activeFilter, sortBy, selectedSizes, priceRange]);

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

  const toggleSize = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  // Combine category filter and custom filters
  let filteredProducts = products.filter(p => p.isListed !== false);
  
  // 1. URL params filters
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

  // 2. Interactive size filters
  if (selectedSizes.length > 0) {
    filteredProducts = filteredProducts.filter(p => 
      p.variants.some(v => selectedSizes.includes(v.size) && v.stock > 0)
    );
  }

  // 3. Price range filter
  filteredProducts = filteredProducts.filter(p => p.price <= priceRange);

  // 4. Sorting logic
  if (sortBy === 'price-low-high') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-high-low') {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'newest') {
    filteredProducts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Calculate product counts
  const listedProductsOnly = products.filter(p => p.isListed !== false);
  const totalCount = listedProductsOnly.length;
  const newArrivalsCount = listedProductsOnly.filter(p => p.newArrival).length;
  const bestsellersCount = listedProductsOnly.filter(p => p.bestseller).length;

  const resetAllFilters = () => {
    router.push('/shop');
    setActiveCategory(null);
    setActiveFilter(null);
    setSelectedSizes([]);
    setPriceRange(35000);
    setSortBy('featured');
  };

  return (
    <div className="w-full bg-white text-zinc-800 min-h-screen font-sans">
      
      {/* Editorial Collection Header */}
      <section className="relative pt-36 pb-16 px-6 bg-zinc-50 border-b border-zinc-100 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.015] pointer-events-none bg-[url('https://picsum.photos/seed/curation/1920/1080')] bg-cover bg-center" />
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-zinc-200/50 blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <span className="text-[10px] tracking-[0.25em] uppercase text-[#FF5E36] font-bold block mb-3">ATELIER COLLECTIONS</span>
          <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold text-zinc-950 tracking-tight mb-4">
            {activeCategory 
              ? activeCategory.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
              : activeFilter === 'new' 
              ? 'New Arrivals' 
              : activeFilter === 'bestseller'
              ? 'Bestsellers'
              : 'Our Curation'
            }
          </h1>
          <p className="text-zinc-500 text-xs md:text-sm font-light max-w-xl mx-auto leading-relaxed tracking-wide mt-4">
            Explore our edit of luxury handloom textiles, contemporary silhouettes, and bespoke tailoring designed to elevate your style.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="max-w-7xl mx-auto px-6 py-10 w-full">
        
        {/* Stats and Sorting Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-100 pb-5 mb-8">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-zinc-950 uppercase tracking-wider">
              {filteredProducts.length} Products
            </span>
            {(activeCategory || activeFilter || selectedSizes.length > 0 || priceRange < 35000) && (
              <button 
                onClick={resetAllFilters}
                className="text-[11px] tracking-wider uppercase underline underline-offset-4 text-zinc-400 hover:text-[#FF5E36] transition-colors font-semibold"
              >
                Clear All
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Sorting Dropdown */}
            <Dropdown
              options={[
                { value: "featured", label: "Featured" },
                { value: "price-low-high", label: "Price: Low to High" },
                { value: "price-high-low", label: "Price: High to Low" },
                { value: "newest", label: "Newest" }
              ]}
              value={sortBy}
              onChange={setSortBy}
              labelPrefix="Sort by:"
              className="flex-1 sm:w-48"
            />

            {/* Mobile Filter Toggle */}
            <button 
              onClick={() => setIsFilterOpen(true)} 
              className="lg:hidden flex-1 flex items-center justify-center gap-2 text-xs font-bold tracking-wider uppercase border border-zinc-200 rounded-full px-5 py-3 bg-zinc-50 hover:bg-white transition-all shadow-sm"
            >
              <SlidersHorizontal size={13} />
              <span>Filters</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 items-start">
          
          {/* Mobile Overlay Backdrop */}
          {isFilterOpen && (
            <div 
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsFilterOpen(false)}
            />
          )}

          {/* Desktop Left Sidebar Filter Menu (or Mobile overlay) */}
          <aside className={`
            fixed inset-y-0 left-0 z-50 bg-white p-6 transition-transform duration-500 max-w-[85vw] w-80 shadow-2xl border-r border-zinc-100 overflow-y-auto
            lg:static lg:translate-x-0 lg:bg-transparent lg:p-0 lg:w-64 lg:flex-shrink-0 lg:shadow-none lg:border-none
            ${isFilterOpen ? 'translate-x-0' : '-translate-x-full'}
          `}>
            {/* Mobile Header for Filters */}
            <div className="flex justify-between items-center mb-8 lg:hidden">
              <span className="font-serif text-xl font-bold text-zinc-950">Filters</span>
              <button 
                onClick={() => setIsFilterOpen(false)}
                className="p-1.5 border border-zinc-200 rounded-full text-zinc-400 hover:text-zinc-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Filter Sections */}
            <div className="space-y-8">
              
              {/* Category Links */}
              <div>
                <h3 className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-950 mb-4 border-b border-zinc-100 pb-2">
                  Curation Drop
                </h3>
                <ul className="space-y-3">
                  <li>
                    <button 
                      onClick={() => handleFilterSelect(null)}
                      className={`text-xs tracking-wide uppercase transition-colors flex justify-between items-center w-full ${!activeFilter ? 'text-[#FF5E36] font-bold' : 'text-zinc-500 hover:text-zinc-950'}`}
                    >
                      <span>All Products</span>
                      <span className="text-[9px] font-mono opacity-60">({totalCount})</span>
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => handleFilterSelect('new')}
                      className={`text-xs tracking-wide uppercase transition-colors flex justify-between items-center w-full ${activeFilter === 'new' ? 'text-[#FF5E36] font-bold' : 'text-zinc-500 hover:text-zinc-950'}`}
                    >
                      <span>New Arrivals</span>
                      <span className="text-[9px] font-mono opacity-60">({newArrivalsCount})</span>
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => handleFilterSelect('bestseller')}
                      className={`text-xs tracking-wide uppercase transition-colors flex justify-between items-center w-full ${activeFilter === 'bestseller' ? 'text-[#FF5E36] font-bold' : 'text-zinc-500 hover:text-zinc-950'}`}
                    >
                      <span>Bestsellers</span>
                      <span className="text-[9px] font-mono opacity-60">({bestsellersCount})</span>
                    </button>
                  </li>
                </ul>
              </div>

              {/* Product Categories */}
              <div>
                <h3 className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-950 mb-4 border-b border-zinc-100 pb-2">
                  Categories
                </h3>
                <ul className="space-y-3">
                  {CATEGORIES.map(cat => {
                    const catSlug = cat.toLowerCase().replace(/ \/ /g, '-').replace(/ /g, '-');
                    const count = products.filter(p => p.category === cat).length;
                    return (
                      <li key={cat}>
                        <button 
                          onClick={() => handleCategorySelect(catSlug)}
                          className={`text-xs tracking-wide uppercase transition-colors flex justify-between items-center w-full ${activeCategory === catSlug ? 'text-[#FF5E36] font-bold' : 'text-zinc-500 hover:text-zinc-950'}`}
                        >
                          <span>{cat}</span>
                          <span className="text-[9px] font-mono opacity-60">({count})</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Size Filter */}
              <div>
                <h3 className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-950 mb-4 border-b border-zinc-100 pb-2">
                  Filter by Size
                </h3>
                <div className="flex flex-wrap gap-2">
                  {['XS', 'S', 'M', 'L'].map(size => {
                    const isSelected = selectedSizes.includes(size);
                    return (
                      <button
                        key={size}
                        onClick={() => toggleSize(size)}
                        className={`w-9 h-9 text-[11px] font-bold rounded-lg border transition-all ${
                          isSelected 
                            ? 'bg-[#1F1A1B] text-white border-zinc-950 shadow-sm' 
                            : 'border-zinc-200 text-zinc-600 hover:border-zinc-400 bg-white'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Filter */}
              <div>
                <h3 className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-950 mb-4 border-b border-zinc-100 pb-2">
                  Price Limit
                </h3>
                <div className="space-y-3">
                  <input 
                    type="range" 
                    min={10000} 
                    max={35000} 
                    step={1000} 
                    value={priceRange}
                    onChange={(e) => setPriceRange(Number(e.target.value))}
                    className="w-full accent-[#FF5E36] cursor-pointer"
                  />
                  <div className="flex justify-between text-xs font-semibold text-zinc-500">
                    <span>Up to:</span>
                    <span className="text-zinc-950 font-bold">{priceRange.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}</span>
                  </div>
                </div>
              </div>

            </div>
          </aside>

          {/* Product Grid Area */}
          <div className="flex-1 w-full">
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="flex flex-col rounded-2xl border border-zinc-100 bg-white overflow-hidden shadow-sm w-full">
                    {/* Image Aspect ratio */}
                    <div className="aspect-[3/4] bg-zinc-50 animate-pulse w-full" />
                    
                    {/* Info container */}
                    <div className="p-4 flex flex-col justify-between flex-1 gap-3">
                      <div className="space-y-2">
                        {/* Category */}
                        <div className="h-2.5 bg-zinc-100 animate-pulse w-1/3 rounded-md" />
                        {/* Title */}
                        <div className="h-4 bg-zinc-100 animate-pulse w-3/4 rounded-md" />
                        {/* Fabric */}
                        <div className="h-3 bg-zinc-50 animate-pulse w-1/2 rounded-md" />
                      </div>
                      
                      {/* Divider and price block */}
                      <div className="flex items-center justify-between pt-2 border-t border-zinc-100/50">
                        <div className="h-4 bg-zinc-100 animate-pulse w-16 rounded-md" />
                        <div className="w-8 h-8 rounded-full bg-zinc-100 animate-pulse" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                {filteredProducts.map(product => (
                  <div key={product.id} className="product-card-wrapper">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            )}
            
            {/* Empty State */}
            {!loading && filteredProducts.length === 0 && (
              <div className="text-center py-20 border-2 border-dashed border-zinc-200 rounded-2xl bg-zinc-50/50">
                <Sparkles size={36} className="mx-auto text-[#FF5E36] mb-4 animate-pulse" />
                <h3 className="font-serif text-xl font-bold text-zinc-950 mb-2">No silhouettes found</h3>
                <p className="text-zinc-500 text-xs mb-6 max-w-xs mx-auto leading-relaxed">
                  We couldn't find any products matching your current filters. Try resetting to explore the full curation.
                </p>
                <button 
                  onClick={resetAllFilters}
                  className="bg-brand-charcoal hover:bg-[#FF5E36] text-white px-6 py-3 rounded-full text-xs font-semibold uppercase tracking-widest transition-all duration-300 shadow-sm"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>

        </div>
      </section>

    </div>
  );
}
