'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, User, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';
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
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.1, ease: 'power2.out' }
      );
    }
  }, [mobileMenuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { label: 'New Arrivals', href: '/shop?filter=new' },
    { label: 'Suits', href: '/shop?category=formal-suits' },
    { label: 'Collections', href: '/shop' },
    { label: 'Festive', href: '/shop?category=velvet-edit' },
    { label: 'Bridal', href: '/shop?category=bridal' },
    { label: 'Support', href: '/support' },
  ];
  const isAdmin = pathname.startsWith('/admin');
  if (isAdmin) return null;

  const isHome = pathname === '/';
  const isTransparent = isHome && !isScrolled;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex flex-col">

      <div
        className={cn(
          'transition-all duration-300 ease-in-out border-b',
          isTransparent
            ? 'bg-transparent border-transparent py-6'
            : isScrolled
              ? 'bg-brand-cream/95 border-brand-brown/10 py-3 shadow-sm backdrop-blur-md'
              : 'bg-brand-cream/90 border-transparent py-5 backdrop-blur-md'
        )}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          
          {/* Mobile Menu Button */}
          <button 
            className={cn(
              "md:hidden p-2 -ml-2 transition-colors",
              isTransparent ? "text-white hover:text-brand-terracotta" : "text-brand-charcoal hover:text-brand-wine"
            )}
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu size={20} strokeWidth={1.5} />
          </button>

          {/* Logo with Subtle Indian Ornament */}
          <div className="flex flex-col items-center">
            <Link 
              href="/" 
              className={cn(
                "font-serif text-2xl tracking-[0.15em] uppercase font-semibold transition-colors",
                isTransparent ? "text-white hover:text-brand-terracotta" : "text-brand-charcoal hover:text-brand-wine"
              )}
            >
              JB51
            </Link>
            <span className={cn(
              "text-[7px] tracking-[0.4em] uppercase -mt-0.5 font-semibold transition-colors",
              isTransparent ? "text-white/60" : "text-brand-gold"
            )}>EST. 1951</span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "text-xs tracking-widest transition-colors uppercase font-medium relative py-1 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1px] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300",
                  isTransparent 
                    ? "text-white/95 hover:text-brand-terracotta after:bg-brand-terracotta" 
                    : "text-brand-brown hover:text-brand-sienna after:bg-brand-sienna",
                  pathname === link.href && (isTransparent ? "text-brand-terracotta after:scale-x-100" : "text-brand-sienna after:scale-x-100")
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-3 md:space-x-5">
            <Link 
              href="/wishlist" 
              className={cn(
                "hidden md:block transition-colors p-1 relative",
                isTransparent ? "text-white hover:text-brand-terracotta" : "text-brand-charcoal hover:text-brand-wine"
              )}
            >
              <Heart size={18} strokeWidth={1.5} className={cn(wishlistCount > 0 && "fill-brand-maroon text-brand-maroon")} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-maroon text-brand-cream text-[8px] font-bold rounded-full w-4 h-4 flex items-center justify-center border border-brand-cream">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link 
              href="/admin" 
              className={cn(
                "hidden md:block transition-colors p-1",
                isTransparent ? "text-white hover:text-brand-terracotta" : "text-brand-charcoal hover:text-brand-wine"
              )}
            >
              <User size={18} strokeWidth={1.5} />
            </Link>
          </div>
        </div>

        {/* Subtle Indian inspired divider ornament - Textile border style */}
        {!isTransparent && (
          <div className="w-full flex items-center justify-center mt-2 opacity-40 px-6">
            <div className="h-[2px] flex-1 pattern-jaali max-w-[300px]" />
            <span className="mx-3 text-[8px] text-brand-saffron">✤</span>
            <div className="h-[2px] flex-1 pattern-jaali max-w-[300px]" />
          </div>
        )}
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-brand-cream flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center p-6 border-b border-brand-charcoal/10">
              <div className="flex flex-col">
                <Link href="/" className="font-serif text-2xl tracking-[0.15em] uppercase font-semibold text-brand-charcoal">
                  JB51
                </Link>
                <span className="text-[7px] tracking-[0.4em] uppercase text-brand-gold -mt-0.5 font-semibold">EST. 1951</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 -mr-2 text-brand-charcoal">
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>
            <nav className="p-6 flex flex-col space-y-5">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="mobile-nav-item text-xl font-serif text-brand-charcoal uppercase tracking-wider border-b border-brand-charcoal/5 pb-3 flex items-center justify-between hover:text-brand-wine transition-colors"
                >
                  <span>{link.label}</span>
                  <span className="text-xs text-brand-gold">✦</span>
                </Link>
              ))}
            </nav>
          </div>
          <div className="p-8 border-t border-brand-charcoal/10 flex justify-around bg-brand-beige/50">
            <Link href="/wishlist" className="flex flex-col items-center text-[10px] tracking-widest uppercase text-brand-charcoal relative">
              <div className="relative">
                <Heart size={18} strokeWidth={1.5} className={cn("mb-1", wishlistCount > 0 && "fill-brand-maroon text-brand-maroon")} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-maroon text-brand-cream text-[8px] font-bold rounded-full w-4 h-4 flex items-center justify-center border border-brand-cream">
                    {wishlistCount}
                  </span>
                )}
              </div>
              Wishlist
            </Link>
            <Link href="/admin" className="flex flex-col items-center text-[10px] tracking-widest uppercase text-brand-charcoal">
              <User size={18} strokeWidth={1.5} className="mb-1" />
              Account
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
