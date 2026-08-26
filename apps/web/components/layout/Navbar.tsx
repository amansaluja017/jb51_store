'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, User, Menu, X, Search, MessageCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import gsap from 'gsap';
import { cn, WHATSAPP_NUMBER } from '@/lib/utils';
import { useWishlist } from '@/context/WishlistContext';

export function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { wishlist } = useWishlist();
  
  const wishlistCount = wishlist.length;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      gsap.fromTo(
        '.mobile-nav-item',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.08, ease: 'power2.out' }
      );
    }
  }, [mobileMenuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Shop All', href: '/shop' },
    { label: 'Support', href: '/support' },
  ];

  const isAdmin = pathname.startsWith('/admin');
  if (isAdmin) return null;

  const isHome = pathname === '/';
  const isTransparent = isHome && !isScrolled;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex flex-col font-sans">
      
      {/* 1. Top Announcement Bar (Promo banner) */}
      <div className="w-full bg-[#1F1A1B] text-[#FFFBE1] text-[9px] md:text-[10px] py-2 px-6 flex items-center justify-between tracking-[0.15em] font-semibold uppercase relative z-50 border-b border-white/5 border-box">
        <div className="mx-auto md:mx-0 text-center text-[#FF5E36] tracking-wider animate-pulse">
          SUMMER SALE: UP TO 70% OFF
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
                ATELIER
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
            <input 
              type="text" 
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
              <button className={cn("md:hidden p-2 transition-colors", isTransparent ? "text-white" : "text-zinc-800")}>
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
        <div className="fixed inset-0 z-50 bg-white flex flex-col justify-between font-sans">
          <div>
            <div className="flex justify-between items-center p-6 border-b border-zinc-100">
              <div className="flex flex-col">
                <Link href="/" className="font-serif text-2xl tracking-[0.15em] uppercase font-bold text-zinc-950">
                  JB51
                </Link>
                <span className="text-[7px] tracking-[0.4em] uppercase text-[#FF5E36] -mt-0.5 font-bold">EST. 1951</span>
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)} 
                className="p-2 rounded-full hover:bg-zinc-100 text-zinc-800 transition-colors"
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
                  <span className="text-xs text-[#FF5E36]">✦</span>
                </Link>
              ))}
            </nav>
          </div>

          <div className="p-8 border-t border-zinc-100 flex justify-around bg-zinc-50">
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
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center text-[9px] tracking-widest uppercase text-zinc-800 font-semibold"
            >
              <MessageCircle size={18} strokeWidth={1.5} className="mb-1" />
              WhatsApp
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
