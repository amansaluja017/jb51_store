'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { type Product, CATEGORIES } from '@repo/products';
import { api } from '@/lib/trpc/client/react';
import { ProductCard } from '@/components/products/ProductCard';
import { SlidersHorizontal, Sparkles, X } from 'lucide-react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';

// Beautiful luxury Indian lotus icon motif
const LotusIcon = ({ className = "w-6 h-6 text-brand-gold" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
    {/* Center petal */}
    <path d="M12 4C12 4 9 10 12 20C15 10 12 4 12 4Z" fill="currentColor" fillOpacity="0.08" />
    {/* Left petal */}
    <path d="M12 12C9 9 4 11 6 18C10 18 11 14 12 12Z" fill="currentColor" fillOpacity="0.04" />
    {/* Right petal */}
    <path d="M12 12C15 9 20 11 18 18C14 18 13 14 12 12Z" fill="currentColor" fillOpacity="0.04" />
    {/* Far left petal */}
    <path d="M12 16C8 14 3 16 3 20C8 20 10 18 12 16Z" fill="currentColor" fillOpacity="0.02" />
    {/* Far right petal */}
    <path d="M12 16C16 14 21 16 21 20C16 20 14 18 12 16Z" fill="currentColor" fillOpacity="0.02" />
    {/* Base stem */}
    <path d="M10 21C11 21.5 13 21.5 14 21" strokeLinecap="round" />
  </svg>
);

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
  const [hasSetInitialMax, setHasSetInitialMax] = useState(false);

  const listedProductsOnly = products.filter(p => p.isListed !== false);
  const maxAvailablePrice = listedProductsOnly.length > 0 
    ? Math.max(...listedProductsOnly.map(p => p.price)) 
    : 35000;

  useEffect(() => {
    if (products.length > 0 && !hasSetInitialMax) {
      const maxPrice = Math.max(...products.map(p => p.price));
      if (maxPrice > 0) {
        setPriceRange(maxPrice);
        setHasSetInitialMax(true);
      }
    }
  }, [products, hasSetInitialMax]);

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
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.04, ease: 'power3.out' }
      );
    }
  }, [loading, activeCategory, activeFilter, sortBy, selectedSizes, priceRange]);

  const handleCategorySelect = (catSlug: string | null) => {
    if (catSlug) {
      router.push(`/shop?category=${catSlug}`);
    } else {
      router.push('/shop');
    }
  };

  const handleFilterSelect = (filterVal: string | null) => {
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
  const totalCount = listedProductsOnly.length;
  const newArrivalsCount = listedProductsOnly.filter(p => p.newArrival).length;
  const bestsellersCount = listedProductsOnly.filter(p => p.bestseller).length;

  const resetAllFilters = () => {
    router.push('/shop');
    setActiveCategory(null);
    setActiveFilter(null);
    setSelectedSizes([]);
    setPriceRange(maxAvailablePrice);
    setSortBy('featured');
  };

  return (
    <div className="w-full bg-brand-cream/30 text-brand-charcoal min-h-screen font-sans pb-24">
      
      {/* Editorial Collection Header */}
      <section className="relative pt-36 pb-16 px-6 border-b border-brand-sand/15 overflow-hidden bg-brand-cream/70 pattern-jaali">
        {/* Glow effects */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-brand-gold/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-brand-maroon/5 blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="flex items-center justify-center gap-2.5 mb-3">
            <LotusIcon className="w-5 h-5 text-brand-gold" />
          </div>
          <span className="text-[10px] tracking-[0.3em] uppercase text-brand-maroon font-extrabold block mb-3 font-sans">
            Atelier Catalog
          </span>
          <h1 className="font-serif text-4xl md:text-6xl font-light text-brand-brown tracking-tight mb-4">
            {activeCategory 
              ? activeCategory.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
              : activeFilter === 'new' 
              ? 'New Arrivals' 
              : activeFilter === 'bestseller'
              ? 'Bestsellers'
              : 'Our Curation'
            }
          </h1>
          <div className="editorial-divider my-6" />
          <p className="text-brand-charcoal/80 text-xs md:text-sm font-light max-w-xl mx-auto leading-relaxed tracking-wide">
            Explore our edit of luxury handloom textiles, contemporary silhouettes, and bespoke tailoring designed to celebrate heritage Indian craftsmanship.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="max-w-7xl mx-auto px-6 py-6 w-full">
        
        {/* Horizontal Category Nav */}
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 py-4 border-b border-brand-sand/20 mb-6 select-none">
          <button
            onClick={() => {
              handleCategorySelect(null);
              handleFilterSelect(null);
            }}
            className={cn(
              "text-xs tracking-[0.2em] uppercase font-bold transition-all duration-300 relative pb-1.5 cursor-pointer",
              !activeCategory && !activeFilter
                ? "text-brand-maroon after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:bg-brand-gold after:rounded-full"
                : "text-brand-charcoal/60 hover:text-brand-maroon"
            )}
          >
            All Collections
          </button>
          {CATEGORIES.map(cat => {
            const catSlug = cat.toLowerCase().replace(/ \/ /g, '-').replace(/ /g, '-');
            const isActive = activeCategory === catSlug;
            return (
              <button
                key={cat}
                onClick={() => handleCategorySelect(catSlug)}
                className={cn(
                  "text-xs tracking-[0.2em] uppercase font-bold transition-all duration-300 relative pb-1.5 cursor-pointer",
                  isActive
                    ? "text-brand-maroon after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:bg-brand-gold after:rounded-full"
                    : "text-brand-charcoal/60 hover:text-brand-maroon"
                )}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Stats and Refinement Bar */}
        <div className="flex justify-between items-center gap-4 py-3 border-b border-brand-sand/20 mb-8 select-none">
          {/* Stats */}
          <div className="text-[10px] tracking-[0.2em] uppercase font-bold text-brand-charcoal/60">
            Showing <span className="text-brand-maroon font-extrabold">{filteredProducts.length}</span> bespoke creations
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            {/* Clear filters if active */}
            {(activeFilter || selectedSizes.length > 0 || priceRange < maxAvailablePrice || sortBy !== 'featured') && (
              <button
                onClick={resetAllFilters}
                className="text-[9px] tracking-widest uppercase underline underline-offset-4 text-brand-maroon hover:text-brand-wine font-extrabold transition-colors cursor-pointer"
              >
                Reset Refinements
              </button>
            )}

            {/* Refine Trigger Button */}
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={cn(
                "flex items-center gap-2 text-[10px] tracking-widest uppercase font-extrabold px-5 py-2.5 rounded-full border transition-all duration-300 cursor-pointer shadow-sm",
                isFilterOpen
                  ? "bg-brand-maroon text-white border-brand-maroon shadow-brand-maroon/10"
                  : "bg-white border-brand-sand text-brand-charcoal hover:border-brand-gold hover:text-brand-gold"
              )}
              aria-expanded={isFilterOpen}
            >
              <SlidersHorizontal size={12} />
              <span>Refine Selection</span>
            </button>
          </div>
        </div>

        {/* Refine Drawer Panel */}
        {isFilterOpen && (
          <div className="bg-brand-ivory border border-brand-sand rounded-3xl p-6 md:p-8 mb-8 grid grid-cols-1 md:grid-cols-4 gap-8 pattern-jaali relative overflow-hidden shadow-xl animate-scale-up text-brand-brown">
            {/* Overlay glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 rounded-full blur-2xl pointer-events-none" />

            {/* Column 1: Curation Filters (New Arrivals, Bestsellers) */}
            <div className="flex flex-col gap-3">
              <h4 className="text-[9px] tracking-[0.25em] uppercase font-bold text-brand-maroon border-b border-brand-sand/30 pb-2">
                Curation Drops
              </h4>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleFilterSelect(null)}
                  className={cn(
                    "text-[10px] tracking-widest uppercase font-bold text-left py-1 hover:text-brand-maroon transition-colors cursor-pointer",
                    !activeFilter ? "text-brand-maroon font-extrabold" : "text-brand-charcoal/60"
                  )}
                >
                  All Outfits ({totalCount})
                </button>
                <button
                  onClick={() => handleFilterSelect('new')}
                  className={cn(
                    "text-[10px] tracking-widest uppercase font-bold text-left py-1 hover:text-brand-maroon transition-colors cursor-pointer",
                    activeFilter === 'new' ? "text-brand-maroon font-extrabold" : "text-brand-charcoal/60"
                  )}
                >
                  New Arrivals ({newArrivalsCount})
                </button>
                <button
                  onClick={() => handleFilterSelect('bestseller')}
                  className={cn(
                    "text-[10px] tracking-widest uppercase font-bold text-left py-1 hover:text-brand-maroon transition-colors cursor-pointer",
                    activeFilter === 'bestseller' ? "text-brand-maroon font-extrabold" : "text-brand-charcoal/60"
                  )}
                >
                  Bestsellers ({bestsellersCount})
                </button>
              </div>
            </div>

            {/* Column 2: Size Filter */}
            <div className="flex flex-col gap-3">
              <h4 className="text-[9px] tracking-[0.25em] uppercase font-bold text-brand-maroon border-b border-brand-sand/30 pb-2">
                Filter by Size
              </h4>
              <div className="flex flex-wrap gap-2 pt-1">
                {['XS', 'S', 'M', 'L'].map(size => {
                  const isSelected = selectedSizes.includes(size);
                  return (
                    <button
                      key={size}
                      onClick={() => toggleSize(size)}
                      className={cn(
                        "w-9 h-9 text-[10px] font-bold rounded-xl border transition-all cursor-pointer",
                        isSelected
                          ? "bg-brand-charcoal text-white border-brand-charcoal shadow-sm"
                          : "border-brand-sand/60 text-brand-charcoal hover:border-brand-gold bg-white/50"
                      )}
                      aria-pressed={isSelected}
                      aria-label={`Filter by size ${size}`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Column 3: Price Limit Slider */}
            <div className="flex flex-col gap-3">
              <h4 className="text-[9px] tracking-[0.25em] uppercase font-bold text-brand-maroon border-b border-brand-sand/30 pb-2">
                Price Limit
              </h4>
              <div className="flex flex-col gap-3 pt-1">
                <input
                  type="range"
                  min={10000}
                  max={maxAvailablePrice}
                  step={1000}
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full accent-brand-maroon cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-bold text-brand-charcoal/60">
                  <span>Up to:</span>
                  <span className="text-brand-maroon font-extrabold">
                    {priceRange.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Column 4: Sort Order */}
            <div className="flex flex-col gap-3">
              <h4 className="text-[9px] tracking-[0.25em] uppercase font-bold text-brand-maroon border-b border-brand-sand/30 pb-2">
                Sort Order
              </h4>
              <div className="flex flex-col gap-2">
                {[
                  { value: "featured", label: "Featured Curation" },
                  { value: "price-low-high", label: "Price: Low to High" },
                  { value: "price-high-low", label: "Price: High to Low" },
                  { value: "newest", label: "Newest Arrivals" }
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setSortBy(opt.value)}
                    className={cn(
                      "text-[10px] tracking-widest uppercase font-bold text-left py-1 hover:text-brand-maroon transition-colors cursor-pointer",
                      sortBy === opt.value ? "text-brand-maroon font-extrabold" : "text-brand-charcoal/60"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Product Grid Area (Rearranged into a spacious 4-column grid on large screens) */}
        <div className="w-full">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse flex flex-col gap-3 w-full">
                  <div className="aspect-[3/4] w-full bg-brand-cream/40 rounded-3xl border border-brand-sand/20" />
                  <div className="h-4 bg-brand-cream/50 rounded-md w-2/3 mt-2" />
                  <div className="h-4 bg-brand-cream/50 rounded-md w-1/3" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-10">
              {filteredProducts.map(product => (
                <div key={product.id} className="product-card-wrapper w-full">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
          
          {/* Empty State */}
          {!loading && filteredProducts.length === 0 && (
            <div className="text-center py-20 border border-dashed border-brand-sand/50 rounded-[2.5rem] bg-brand-cream/20 pattern-jaali my-10 max-w-lg mx-auto">
              <LotusIcon className="w-12 h-12 mx-auto text-brand-maroon/60 mb-4" />
              <h3 className="font-serif text-xl text-brand-brown mb-2 font-medium">No creations match filters</h3>
              <p className="text-brand-charcoal/60 text-xs mb-6 max-w-xs mx-auto leading-relaxed font-light">
                We couldn't find any designs matching your refinement profile. Select another category or reset refinements.
              </p>
              <button 
                onClick={resetAllFilters}
                className="bg-brand-maroon hover:bg-brand-wine text-white px-7 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 shadow-md cursor-pointer"
              >
                Reset Refinements
              </button>
            </div>
          )}
        </div>

      </section>

    </div>
  );
}
