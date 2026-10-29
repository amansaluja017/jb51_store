'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Heart, User, Menu, X, Search, MessageCircle, Instagram } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn, WHATSAPP_NUMBER, formatPrice } from '@/lib/utils';
import { useWishlist } from '@/context/WishlistContext';
import { api } from '@/lib/trpc/client/react';
import { useAnalytics } from '@/hooks/useAnalytics';

import { useDebounce } from '@/hooks/useDebounce';
import type { SiteConfigData } from '@/lib/site-config';

interface NavbarProps {
  siteConfig?: SiteConfigData;
}

export function Navbar({ siteConfig }: NavbarProps = {}) {
  const { trackEvent } = useAnalytics();
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { wishlist } = useWishlist();

  const wishlistCount = wishlist.length;

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  // Debounce search input (250ms) to prevent excessive backend queries
  const debouncedSearchQuery = useDebounce(searchQuery.trim(), 250);

  // Hit backend pg_trgm suggestions route matching name, description, tags
  const { data: suggestionsData, isLoading: isSuggestionsLoading } = api.products.suggestions.useQuery(
    { query: debouncedSearchQuery },
    { enabled: debouncedSearchQuery.length > 0 }
  );

  const suggestedProducts = suggestionsData?.products || [];
  const suggestedCategories = suggestionsData?.categories || [];
  const suggestedTags = suggestionsData?.tags || [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchFocused(false);
      setShowMobileSearch(false);
      router.push(`/search/${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const announcements = siteConfig?.promotionalHeader?.length
    ? siteConfig.promotionalHeader
    : [
        'Summer Sale: Up to 70% Off',
        'Complimentary shipping on orders above ₹15,000',
        'Bespoke customization available at our store',
      ];
  const [announcementIdx, setAnnouncementIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setAnnouncementIdx((prev) => (prev + 1) % announcements.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [announcements.length]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu and search on route change
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileMenuOpen(false);
    setShowMobileSearch(false);
    setSearchQuery('');
  }

  // Disable body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Shop All', href: '/shop' },
    { label: 'Support', href: '/support' },
  ];

  const isHome = pathname === '/';
  const isTransparent = isHome && !isScrolled;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex flex-col font-sans">

      {/* 1. Top Announcement Bar (Promo banner) */}
      <div className="w-full bg-zinc-950 text-zinc-300 text-[8px] md:text-[9px] py-2 px-6 flex items-center justify-center tracking-[0.2em] font-semibold uppercase relative z-50 border-b border-white/5">
        <div className="relative overflow-hidden h-4 flex items-center justify-center w-full">
          {announcements.map((text: string, idx: number) => (
            <div
              key={idx}
              className={cn(
                "absolute transition-all duration-700 ease-in-out transform flex items-center justify-center gap-2 w-full text-center",
                idx === announcementIdx
                  ? "opacity-100 translate-y-0 scale-100"
                  : idx === (announcementIdx - 1 + announcements.length) % announcements.length
                    ? "opacity-0 -translate-y-4 scale-95"
                    : "opacity-0 translate-y-4 scale-95"
              )}
            >
              <span className="text-[#FF5E36] text-[10px]">•</span>
              <span>{text}</span>
              <span className="text-[#FF5E36] text-[10px]">•</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <div
        className={cn(
          'transition-all duration-500 ease-in-out border-b backdrop-blur-md',
          isTransparent
            ? 'bg-black/10 border-white/10 py-5'
            : isScrolled
              ? 'bg-white/95 border-zinc-100 py-3 shadow-md'
              : 'bg-white/90 border-zinc-200/50 py-4'
        )}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between gap-4">

          {/* Left Column: Logo & Nav Links */}
          <div className="flex items-center gap-6 lg:gap-8 flex-1 justify-start">
            {/* Mobile menu trigger */}
            <button
              className={cn(
                "md:hidden p-2 -ml-2 transition-colors rounded-full hover:bg-zinc-100/10",
                isTransparent ? "text-white" : "text-zinc-800"
              )}
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open mobile menu"
            >
              <Menu size={20} strokeWidth={1.5} />
            </button>

            {/* Brand Logo */}
            <Link href="/" className="flex flex-col items-start shrink-0">
              <span className={cn(
                "font-serif text-xl md:text-2xl tracking-[0.15em] uppercase font-bold transition-all duration-300",
                isTransparent ? "text-white hover:text-[#FF5E36]" : "text-zinc-950 hover:text-[#FF5E36]"
              )}>
                JB51
              </span>
              <span className={cn(
                "text-[6px] tracking-[0.45em] uppercase -mt-1 font-bold transition-colors",
                isTransparent ? "text-white/60" : "text-[#FF5E36]"
              )}>
                STORE
              </span>
            </Link>

            {/* Desktop Navigation Links (Clean 2-item array on left) */}
            <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
              {navLinks
                .filter((link) => link.label !== 'Support')
                .map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={cn(
                      "text-xs tracking-[0.15em] transition-all duration-300 uppercase font-semibold relative py-1.5 after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:h-[2px] after:w-0 hover:after:w-full after:transition-all after:duration-300 rounded-md px-1",
                      isTransparent
                        ? "text-white/90 hover:text-white after:bg-[#FF5E36]"
                        : "text-zinc-600 hover:text-zinc-950 after:bg-[#FF5E36]",
                      pathname === link.href && (isTransparent ? "text-white after:w-full" : "text-zinc-950 after:w-full")
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
            </nav>
          </div>

          {/* Center Column: Perfectly Centered Search Bar */}
          <div className="hidden md:block flex-1 max-w-sm lg:max-w-md relative group mx-auto">
            <form onSubmit={handleSearchSubmit} role="search">
              <input
                id="search-input-desktop"
                name="searchQuery"
                type="search"
                autoComplete="off"
                aria-label="Search products"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                placeholder="Search products..."
                className={cn(
                  "pl-10 pr-4 py-2 rounded-full text-xs outline-none border transition-all duration-300 w-full text-center placeholder:text-center focus:placeholder:text-zinc-400 focus:text-left focus:pl-10",
                  isTransparent
                    ? "bg-white/10 border-white/20 text-white placeholder-white/50 focus:bg-white focus:text-zinc-800 focus:placeholder-zinc-400 focus:border-white"
                    : "bg-zinc-50 border-zinc-200 text-zinc-800 placeholder-zinc-400 focus:bg-white focus:border-zinc-300 focus:ring-1 focus:ring-[#FF5E36]"
                )}
              />
              <Search
                size={14}
                className={cn(
                  "absolute left-4 top-1/2 -translate-y-1/2 transition-colors",
                  isTransparent ? "text-white/50" : "text-zinc-400"
                )}
              />
            </form>

            {/* Suggestions Panel */}
            {isSearchFocused && searchQuery.trim() !== '' && (
              <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white/95 backdrop-blur-md border border-zinc-200/60 shadow-2xl rounded-2xl p-4 z-50 text-left">
                <div className="text-[9px] tracking-wider uppercase text-zinc-400 font-bold mb-3 flex items-center justify-between">
                  <span>Suggested Ensembles</span>
                  {isSuggestionsLoading && <span className="text-[8px] text-zinc-400 animate-pulse">Searching...</span>}
                </div>

                {/* Categories & Tags Suggestions */}
                {(suggestedCategories.length > 0 || suggestedTags.length > 0) && (
                  <div className="flex flex-wrap gap-1.5 mb-3 pb-2.5 border-b border-zinc-100">
                    {suggestedCategories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setIsSearchFocused(false);
                          router.push(`/shop?category=${encodeURIComponent(cat)}`);
                        }}
                        className="text-[9px] font-semibold bg-zinc-100 hover:bg-[#FF5E36]/10 hover:text-[#FF5E36] text-zinc-700 px-2 py-0.5 rounded-full transition-colors"
                      >
                        {cat}
                      </button>
                    ))}
                    {suggestedTags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          setIsSearchFocused(false);
                          router.push(`/search/${encodeURIComponent(tag)}`);
                        }}
                        className="text-[9px] font-medium bg-zinc-50 border border-zinc-200 hover:border-[#FF5E36] hover:text-[#FF5E36] text-zinc-600 px-2 py-0.5 rounded-full transition-colors"
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                )}

                {suggestedProducts.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {suggestedProducts.map(p => {
                      const imageSrc = p.image || (p as any).images?.[0] || 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500';
                      return (
                        <Link
                          key={p.id}
                          href={`/product/${p.slug}`}
                          className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-zinc-50 transition-colors"
                        >
                          <div className="relative w-10 h-12 rounded-lg overflow-hidden border border-zinc-100 flex-shrink-0 bg-zinc-50">
                            <Image
                              src={imageSrc}
                              alt={p.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-zinc-900 truncate">{p.name}</div>
                            <div className="text-[9px] text-zinc-450 uppercase tracking-wider flex items-center gap-1.5">
                              <span>{p.fabric || p.category || 'Collection'}</span>
                              {p.matchedField && p.matchedField !== 'name' && (
                                <span className="text-[8px] bg-orange-50 text-[#FF5E36] px-1 rounded font-medium">
                                  matches {p.matchedField}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs font-bold text-[#FF5E36]">
                              {formatPrice(p.sellingPrice ?? p.discountPrice ?? p.price)}
                            </div>
                            {Boolean(p.mrp && p.mrp > (p.sellingPrice ?? p.discountPrice ?? p.price)) && (
                              <div className="text-[9px] line-through text-zinc-400">
                                {formatPrice(p.mrp!)}
                              </div>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                    <div className="border-t border-zinc-100 pt-2.5 mt-1.5 flex justify-between items-center text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                      <span>{suggestedProducts.length} matching items</span>
                      <button
                        type="button"
                        onClick={() => router.push(`/search/${encodeURIComponent(searchQuery.trim())}`)}
                        className="text-[#FF5E36] hover:underline cursor-pointer"
                      >
                        View all results
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-zinc-500 py-3 text-center font-light">
                    {isSuggestionsLoading
                      ? 'Finding suggestions...'
                      : `No bespoke creations found for "${searchQuery}"`}
                  </div>
                )}
              </div>
            )}
          </div>          {/* Right Column: Actions (Support, Wishlist, Account, Cart) */}
          <div className="flex items-center justify-end flex-1 gap-6 lg:gap-8">
            {/* Support Link (Desktop only) */}
            <Link
              href="/support"
              className={cn(
                "hidden md:inline-block text-xs tracking-[0.15em] transition-all duration-300 uppercase font-semibold relative py-1.5 after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:h-[2px] after:w-0 hover:after:w-full after:transition-all after:duration-300 rounded-md px-1",
                isTransparent
                  ? "text-white/90 hover:text-white after:bg-[#FF5E36]"
                  : "text-zinc-600 hover:text-zinc-950 after:bg-[#FF5E36]",
                pathname === "/support" && (isTransparent ? "text-white after:w-full" : "text-zinc-950 after:w-full")
              )}
            >
              Support
            </Link>

            {/* Actions Icons Group */}
            <div className="flex items-center space-x-2 md:space-x-4">
              {/* Search (Mobile only) */}
              <button
                onClick={() => setShowMobileSearch(!showMobileSearch)}
                className={cn("md:hidden p-2 transition-colors", isTransparent ? "text-white" : "text-zinc-800")}
                aria-label="Search site"
              >
                <Search size={18} strokeWidth={1.5} />
              </button>



              {/* Wishlist Icon */}
              <Link
                href="/wishlist"
                className={cn(
                  "transition-colors p-2 rounded-full hover:bg-zinc-100/10 relative",
                  isTransparent ? "text-white hover:text-[#FF5E36]" : "text-zinc-800 hover:text-[#FF5E36]"
                )}
                title="Wishlist"
              >
                <Heart size={18} strokeWidth={1.5} className={cn(wishlistCount > 0 && "fill-[#FF5E36] text-[#FF5E36]")} />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 bg-[#FF5E36] text-white text-[8px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center border border-white">
                    {wishlistCount}
                  </span>
                )}
              </Link>


            </div>
          </div>

        </div>
      </div>

      {/* 3. Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col justify-between font-sans overflow-hidden">
          <div className="flex-1 overflow-y-auto flex flex-col">
            <div className="flex justify-between items-center p-6 pt-[calc(env(safe-area-inset-top)+1.5rem)] border-b border-zinc-100">
              <div className="flex flex-col">
                <Link href="/" className="font-serif text-2xl tracking-[0.15em] uppercase font-bold text-zinc-950">
                  JB51
                </Link>
                <span className="text-[7px] tracking-[0.4em] uppercase text-[#FF5E36] -mt-0.5 font-bold">EST. 1951</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-full hover:bg-zinc-100 text-zinc-800 transition-colors"
                aria-label="Close mobile menu"
              >
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>

            <nav className="p-6 flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="mobile-nav-item text-lg font-serif text-zinc-800 uppercase tracking-wider border-b border-zinc-100 pb-3 flex items-center justify-between hover:text-[#FF5E36] transition-colors"
                >
                  <span>{link.label}</span>
                  <span className="text-xs text-[#FF5E36]">•</span>
                </Link>
              ))}
            </nav>
          </div>

          <div className="p-8 border-t border-zinc-100 flex justify-around bg-zinc-50 shrink-0">
            <Link href="/wishlist" className="flex flex-col items-center text-[9px] tracking-widest uppercase text-zinc-800 relative font-semibold">
              <div className="relative mb-1">
                <Heart size={18} strokeWidth={1.5} className={cn(wishlistCount > 0 && "fill-[#FF5E36] text-[#FF5E36]")} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#FF5E36] text-white text-[8px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center border border-white">
                    {wishlistCount}
                  </span>
                )}
              </div>
              Wishlist
            </Link>
            <a
              href={`https://wa.me/${siteConfig?.contactInfo?.whatsappNumber || WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent({ type: 'whatsapp' })}
              className="flex flex-col items-center text-[9px] tracking-widest uppercase text-zinc-800 font-semibold"
            >
              <MessageCircle size={18} strokeWidth={1.5} className="mb-1" />
              WhatsApp
            </a>
          </div>
        </div>
      )}
      {/* 4. Mobile Search Dropdown Bar */}
      {showMobileSearch && (
        <div className="md:hidden bg-white border-b border-zinc-200 py-3 px-6 relative z-40 animate-fade-in-down shadow-sm">
          <form onSubmit={handleSearchSubmit} role="search" className="relative flex items-center gap-3">
            <Search size={16} className="text-zinc-400 absolute left-3" />
            <input
              id="search-input-mobile"
              name="searchQuery"
              type="search"
              autoComplete="off"
              aria-label="Search products"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              autoFocus
              className="w-full bg-zinc-50 border border-zinc-200 rounded-full pl-9 pr-10 py-2 text-xs outline-none focus:border-zinc-300 focus:bg-white text-zinc-800"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-16 text-zinc-400 p-1 hover:text-zinc-655"
              >
                <X size={14} />
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setShowMobileSearch(false);
                setSearchQuery('');
              }}
              className="text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-800"
            >
              Cancel
            </button>
          </form>

          {/* Suggestions Dropdown for Mobile */}
          {searchQuery.trim() !== '' && (
            <div className="mt-3 bg-zinc-50 rounded-2xl p-3 border border-zinc-100 max-h-[300px] overflow-y-auto">
              <div className="text-[9px] tracking-wider uppercase text-zinc-400 font-bold mb-2 flex justify-between">
                <span>Suggested Ensembles</span>
                {isSuggestionsLoading && <span className="animate-pulse">Searching...</span>}
              </div>

              {/* Mobile Categories & Tags Suggestions */}
              {(suggestedCategories.length > 0 || suggestedTags.length > 0) && (
                <div className="flex flex-wrap gap-1 mb-2 pb-2 border-b border-zinc-200/40">
                  {suggestedCategories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setShowMobileSearch(false);
                        router.push(`/shop?category=${encodeURIComponent(cat)}`);
                      }}
                      className="text-[8px] font-semibold bg-white border border-zinc-200 text-zinc-700 px-2 py-0.5 rounded-full"
                    >
                      {cat}
                    </button>
                  ))}
                  {suggestedTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setShowMobileSearch(false);
                        router.push(`/search/${encodeURIComponent(tag)}`);
                      }}
                      className="text-[8px] bg-white border border-zinc-200 text-zinc-600 px-2 py-0.5 rounded-full"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              )}

              {suggestedProducts.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {suggestedProducts.map(p => {
                    const imageSrc = p.image || (p as any).images?.[0] || 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500';
                    return (
                      <Link
                        key={p.id}
                        href={`/product/${p.slug}`}
                        onClick={() => setShowMobileSearch(false)}
                        className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-white transition-colors"
                      >
                        <div className="relative w-8 h-10 rounded-lg overflow-hidden border border-zinc-200 flex-shrink-0 bg-white">
                          <Image
                            src={imageSrc}
                            alt={p.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-zinc-900 truncate">{p.name}</div>
                          <div className="text-[8px] text-zinc-400 uppercase tracking-wider">{p.fabric || p.category || 'Collection'}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold text-[#FF5E36]">
                            {formatPrice(p.sellingPrice ?? p.discountPrice ?? p.price)}
                          </div>
                          {Boolean(p.mrp && p.mrp > (p.sellingPrice ?? p.discountPrice ?? p.price)) && (
                            <div className="text-[9px] line-through text-zinc-400">
                              {formatPrice(p.mrp!)}
                            </div>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                  <div className="border-t border-zinc-200/50 pt-2 mt-1 flex justify-between items-center text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
                    <span>{suggestedProducts.length} matching items</span>
                    <button
                      type="button"
                      onClick={() => {
                        setShowMobileSearch(false);
                        router.push(`/search/${encodeURIComponent(searchQuery.trim())}`);
                      }}
                      className="text-[#FF5E36] hover:underline cursor-pointer"
                    >
                      View all
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-zinc-500 py-3 text-center font-light">
                  {isSuggestionsLoading
                    ? 'Finding suggestions...'
                    : `No bespoke creations found for "${searchQuery}"`}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  );
}
