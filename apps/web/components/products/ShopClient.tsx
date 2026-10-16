'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { type Product } from '@repo/products';
import { api } from '@/lib/trpc/client/react';
import { ProductCard } from '@/components/products/ProductCard';
import { SlidersHorizontal, Sparkles, X } from 'lucide-react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export const CATEGORIES = [
  'Formal Suits',
  'Anarkali Suits',
  'Silk Co-ords',
  'Velvet Edit',
  'Occasion Wear'
];

// Beautiful luxury Indian lotus icon motif
const LotusIcon = ({ className = "w-6 h-6 text-[#FF5E36]" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
    {/* Center petal */}
    <path d="M12 4C12 4 9 10 12 20C15 10 12 4 12 4Z" fill="currentColor" fillOpacity="0.08" />
    {/* Left petal */}
    <path d="M12 12C9 9 4 11 6 18C10 18 11 14 12 12Z" fill="currentColor" fillOpacity="0.04" />
    {/* Right petal */}
    <path d="M12 12C15 9 20 11 18 18C14 18 13 14 12 12Z" fill="currentColor" fillOpacity="0.04" />
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
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number>(35000); // Max product price
  const [hasSetInitialMax, setHasSetInitialMax] = useState(false);

  // Dynamic categories derived from boutique defaults and live product catalogue
  const dynamicCategories = Array.from(
    new Set([...CATEGORIES, ...products.map(p => p.category).filter(Boolean)])
  );

  const slugifyCategory = (cat: string) =>
    cat.toLowerCase().replace(/ \/ /g, '-').replace(/ /g, '-');

  const listedProductsOnly = products.filter(p => p.isListed !== false);
  const maxAvailablePrice = listedProductsOnly.length > 0 
    ? Math.max(...listedProductsOnly.map(p => p.price)) 
    : 35000;

  const availableColors = Array.from(new Set(listedProductsOnly.flatMap(p => p.variants.map(v => v.color)).filter(Boolean))).slice(0, 8);

  useEffect(() => {
    if (listedProductsOnly.length > 0 && !hasSetInitialMax) {
      const maxPrice = Math.max(...listedProductsOnly.map(p => p.price));
      if (maxPrice > 0) {
        setPriceRange(maxPrice);
        setHasSetInitialMax(true);
      }
    }
  }, [listedProductsOnly, hasSetInitialMax]);

  // Sync state with URL params changes
  useEffect(() => {
    setActiveCategory(searchParams.get('category'));
    setActiveFilter(searchParams.get('filter'));
  }, [searchParams]);

  useEffect(() => {
    if (!loading) {
      gsap.killTweensOf('.product-grid-container');
      gsap.fromTo('.product-grid-container', 
        { opacity: 0.3 },
        { opacity: 1, duration: 0.5, ease: 'power2.out' }
      );

      gsap.killTweensOf('.product-card-wrapper');
      gsap.fromTo('.product-card-wrapper', 
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.03, ease: 'power3.out' }
      );
    }
  }, [loading, activeCategory, activeFilter, sortBy, selectedColors, priceRange]);

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

  const toggleColor = (color: string) => {
    setSelectedColors(prev => 
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
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
      p => slugifyCategory(p.category) === activeCategory
    );
  }

  // 2. Interactive color filters
  if (selectedColors.length > 0) {
    filteredProducts = filteredProducts.filter(p => 
      p.variants.some(v => selectedColors.includes(v.color) && v.stock > 0)
    );
  }

  // 3. Price range filter
  filteredProducts = filteredProducts.filter(p => p.price <= priceRange);

  // 4. Sorting logic
  if (sortBy === 'price-low-high') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-high-low') {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'latest' || sortBy === 'newest') {
    filteredProducts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  const clearFilters = () => {
    setActiveCategory(null);
    setActiveFilter(null);
    setSortBy('featured');
    setSelectedColors([]);
    setPriceRange(maxAvailablePrice);
    router.push('/shop');
  };

  // Calculate product counts
  const totalCount = listedProductsOnly.length;
  const newArrivalsCount = listedProductsOnly.filter(p => p.newArrival).length;
  const bestsellersCount = listedProductsOnly.filter(p => p.bestseller).length;

  const resetAllFilters = () => {
    router.push('/shop');
    setActiveCategory(null);
    setActiveFilter(null);
    setSelectedColors([]);
    setPriceRange(maxAvailablePrice);
    setSortBy('featured');
  };

  return (
    <div className="w-full bg-white text-zinc-800 min-h-screen font-sans pb-24">
      
      {/* Editorial Collection Header */}
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
                Atelier Catalog
              </span>
            </div>
            
            <h1 className="font-serif text-4xl md:text-6xl font-bold text-zinc-900 tracking-tight mb-6 leading-tight">
              {activeCategory 
                ? activeCategory.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
                : activeFilter === 'new' 
                ? 'New Arrivals' 
                : activeFilter === 'bestseller'
                ? 'Bestsellers'
                : 'Our Curation'
              }
            </h1>
            
            <div className="w-20 h-[3px] bg-[#FF5E36] mb-6 rounded-full" />
            
            <p className="text-zinc-600 text-xs md:text-sm font-light max-w-xl leading-relaxed tracking-wide mb-8">
              {activeCategory === 'formal-suits' 
                ? 'Tailored silhouettes meeting heritage fabrics. Discover structured elegance engineered for occasion wear and power dressing.'
                : activeCategory === 'anarkali-suits'
                ? 'Regal volume, sweeping lengths, and intricate zardozi hand-embroidery. Pure georgette and silk structures crafted for grandeur.'
                : activeCategory === 'silk-co-ords'
                ? 'Minimalism infused with handloom luxury. Lightweight, fluid silk sets designed for contemporary versatility and refined lounging.'
                : activeCategory === 'velvet-edit'
                ? 'Indulgent, plush micro-velvets adorned with traditional tilla and dabka handcraft. The epitome of royal winter ensembles.'
                : activeCategory === 'occasion-wear'
                ? 'Signature hand-crafted sarees, shararas, and heavy ensembles curated to celebrate your milestone moments.'
                : 'Explore our catalog of luxury handloom textiles, contemporary silhouettes, and bespoke tailoring. Each piece is individually crafted to celebrate heritage Indian craftsmanship.'
              }
            </p>

            {/* Quick Stats Panel */}
            <div className="flex gap-8 border-t border-zinc-200/80 pt-6">
              <div>
                <span className="block text-2xl font-serif font-bold text-zinc-900">
                  {filteredProducts.length}
                </span>
                <span className="text-[9px] tracking-wider uppercase text-zinc-400 font-bold">
                  Bespoke Items
                </span>
              </div>
              <div className="border-l border-zinc-200/80 pl-8">
                <span className="block text-2xl font-serif font-bold text-zinc-900">
                  {dynamicCategories.length}
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

            {/* Floating Atelier Seal */}
            <div className="absolute -top-4 right-[10%] w-16 h-16 rounded-full bg-[#FF5E36] text-white flex flex-col items-center justify-center z-30 shadow-lg animate-pulse">
              <span className="text-[7px] tracking-[0.25em] uppercase font-bold text-white/80 font-sans">Est.</span>
              <span className="text-[10px] tracking-widest font-serif font-bold">2026</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="max-w-7xl mx-auto px-6 py-6 w-full">
        
        {/* Horizontal Category Nav */}
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 py-4 border-b border-zinc-100 mb-6 select-none">
          <button
            onClick={() => {
              handleCategorySelect(null);
              handleFilterSelect(null);
            }}
            className={cn(
              "text-xs tracking-[0.2em] uppercase font-bold transition-all duration-300 relative pb-1.5 cursor-pointer after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:h-[2px] after:bg-[#FF5E36] after:transition-all after:duration-300 after:ease-out",
              !activeCategory && !activeFilter
                ? "text-[#FF5E36] after:w-8 after:opacity-100"
                : "text-zinc-500 hover:text-[#FF5E36] hover:after:w-4 hover:after:opacity-50 after:w-0 after:opacity-0"
            )}
          >
            All Collections
          </button>
          {dynamicCategories.map(cat => {
            const catSlug = slugifyCategory(cat);
            const isActive = activeCategory === catSlug;
            return (
              <button
                key={cat}
                onClick={() => handleCategorySelect(catSlug)}
                className={cn(
                  "text-xs tracking-[0.2em] uppercase font-bold transition-all duration-300 relative pb-1.5 cursor-pointer after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:h-[2px] after:bg-[#FF5E36] after:transition-all after:duration-300 after:ease-out",
                  isActive
                    ? "text-[#FF5E36] after:w-8 after:opacity-100"
                    : "text-zinc-500 hover:text-[#FF5E36] hover:after:w-4 hover:after:opacity-50 after:w-0 after:opacity-0"
                )}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Toolbar Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-6 border-y border-zinc-200 mb-8">
          {/* Stats */}
          <div className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-500">
            Showing <span className="text-[#FF5E36] font-extrabold">{filteredProducts.length}</span> bespoke creations
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            {/* Clear filters if active */}
            {(activeFilter || selectedColors.length > 0 || priceRange < maxAvailablePrice || sortBy !== 'featured') && (
              <button
                onClick={resetAllFilters}
                className="text-[9px] tracking-widest uppercase underline underline-offset-4 text-[#FF5E36] hover:text-[#E04D27] font-extrabold transition-colors cursor-pointer"
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
                  ? "bg-[#FF5E36] text-white border-[#FF5E36] shadow-[#FF5E36]/10"
                  : "bg-white border-zinc-200 text-zinc-800 hover:border-[#FF5E36] hover:text-[#FF5E36]"
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
          <div className="bg-zinc-50 border border-zinc-200 rounded-3xl p-6 md:p-8 mb-8 grid grid-cols-1 md:grid-cols-4 gap-8 relative overflow-hidden shadow-xl animate-scale-up text-zinc-800">
            {/* Overlay glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF5E36]/5 rounded-full blur-2xl pointer-events-none" />

            {/* Column 1: Curation Filters (New Arrivals, Bestsellers) */}
            <div className="flex flex-col gap-3">
              <h2 className="text-[9px] tracking-[0.25em] uppercase font-bold text-[#FF5E36] border-b border-zinc-200 pb-2">
                Curation Drops
              </h2>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleFilterSelect(null)}
                  className={cn(
                    "text-[10px] tracking-widest uppercase font-bold text-left py-1 hover:text-[#FF5E36] transition-colors cursor-pointer",
                    !activeFilter ? "text-[#FF5E36] font-extrabold" : "text-zinc-500"
                  )}
                >
                  All Outfits ({totalCount})
                </button>
                <button
                  onClick={() => handleFilterSelect('new')}
                  className={cn(
                    "text-[10px] tracking-widest uppercase font-bold text-left py-1 hover:text-[#FF5E36] transition-colors cursor-pointer",
                    activeFilter === 'new' ? "text-[#FF5E36] font-extrabold" : "text-zinc-500"
                  )}
                >
                  New Arrivals ({newArrivalsCount})
                </button>
                <button
                  onClick={() => handleFilterSelect('bestseller')}
                  className={cn(
                    "text-[10px] tracking-widest uppercase font-bold text-left py-1 hover:text-[#FF5E36] transition-colors cursor-pointer",
                    activeFilter === 'bestseller' ? "text-[#FF5E36] font-extrabold" : "text-zinc-500"
                  )}
                >
                  Bestsellers ({bestsellersCount})
                </button>
              </div>
            </div>

            {/* Column 2: Color Filter */}
            <div className="flex flex-col gap-3">
              <h2 className="text-[9px] tracking-[0.25em] uppercase font-bold text-[#FF5E36] border-b border-zinc-200 pb-2">
                Filter by Color
              </h2>
              <div className="flex flex-wrap gap-2 pt-1">
                {availableColors.map(color => {
                  const isSelected = selectedColors.includes(color);
                  return (
                    <button
                      key={color}
                      onClick={() => toggleColor(color)}
                      className={cn(
                        "px-2.5 py-1.5 text-[10px] font-bold rounded-xl border transition-all cursor-pointer",
                        isSelected
                          ? "bg-[#FF5E36] text-white border-[#FF5E36] shadow-sm"
                          : "border-zinc-200 text-zinc-600 hover:border-[#FF5E36] bg-white/50"
                      )}
                      aria-pressed={isSelected}
                      aria-label={`Filter by color ${color}`}
                    >
                      {color}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Column 3: Price Limit Slider */}
            <div className="flex flex-col gap-3">
              <h2 className="text-[9px] tracking-[0.25em] uppercase font-bold text-[#FF5E36] border-b border-zinc-200 pb-2">
                Price Limit
              </h2>
              <div className="flex flex-col gap-3 pt-1">
                <input
                  type="range"
                  min={0}
                  max={Math.max(1000, maxAvailablePrice)}
                  step={1000}
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full accent-[#FF5E36] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-bold text-zinc-500">
                  <span>Up to:</span>
                  <span className="text-[#FF5E36] font-extrabold">
                    {priceRange.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Column 4: Sort Order */}
            <div className="flex flex-col gap-3">
              <h2 className="text-[9px] tracking-[0.25em] uppercase font-bold text-[#FF5E36] border-b border-zinc-200 pb-2">
                Sort Order
              </h2>
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
                      "text-[10px] tracking-widest uppercase font-bold text-left py-1 hover:text-[#FF5E36] transition-colors cursor-pointer",
                      sortBy === opt.value ? "text-[#FF5E36] font-extrabold" : "text-zinc-500"
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
        <div className="w-full product-grid-container">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse flex flex-col gap-3 w-full">
                  <div className="aspect-[3/4] w-full bg-zinc-100 rounded-3xl border border-zinc-200/50" />
                  <div className="h-4 bg-zinc-100 rounded-md w-2/3 mt-2" />
                  <div className="h-4 bg-zinc-100 rounded-md w-1/3" />
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
            <div className="text-center py-20 border border-dashed border-zinc-200 rounded-[2.5rem] bg-zinc-50 my-10 max-w-lg mx-auto">
              <LotusIcon className="w-12 h-12 mx-auto text-[#FF5E36] mb-4" />
              <h3 className="font-serif text-xl text-zinc-900 mb-2 font-medium">No creations match filters</h3>
              <p className="text-zinc-500 text-xs mb-6 max-w-xs mx-auto leading-relaxed font-light">
                We couldn&apos;t find any designs matching your refinement profile. Select another category or reset refinements.
              </p>
              <Button 
                onClick={resetAllFilters}
                className="bg-[#FF5E36] hover:bg-[#E04D27] text-white rounded-full h-[46px] px-7"
              >
                Reset Refinements
              </Button>
            </div>
          )}
        </div>

      </section>

    </div>
  );
}
