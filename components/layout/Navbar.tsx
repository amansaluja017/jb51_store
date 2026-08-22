'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Heart, User, ShoppingBag, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';

export function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    { label: 'Blazers', href: '/shop?category=blazers' },
    { label: 'Co-ords', href: '/shop?category=co-ord-sets' },
    { label: 'Occasion', href: '/shop?category=wedding-occasion' },
    { label: 'About', href: '/about' },
  ];

  const isAdmin = pathname.startsWith('/admin');
  if (isAdmin) return null; // Let admin have its own layout

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out border-b',
        isScrolled ? 'bg-brand-cream/90 backdrop-blur-md border-brand-charcoal/10 py-3' : 'bg-transparent border-transparent py-6'
      )}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 -ml-2 text-brand-charcoal"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu size={24} strokeWidth={1.5} />
        </button>

        {/* Logo */}
        <Link href="/" className="font-serif text-2xl tracking-wide uppercase font-medium">
          JB51
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm tracking-wide text-brand-charcoal hover:text-brand-charcoal/60 transition-colors uppercase"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-4 md:space-x-6">
          <button className="text-brand-charcoal hover:opacity-60 transition-opacity">
            <Search size={20} strokeWidth={1.5} />
          </button>
          <Link href="/wishlist" className="hidden md:block text-brand-charcoal hover:opacity-60 transition-opacity">
            <Heart size={20} strokeWidth={1.5} />
          </Link>
          <Link href="/admin" className="hidden md:block text-brand-charcoal hover:opacity-60 transition-opacity">
            <User size={20} strokeWidth={1.5} />
          </Link>
          <Link href="/cart" className="text-brand-charcoal hover:opacity-60 transition-opacity">
            <ShoppingBag size={20} strokeWidth={1.5} />
          </Link>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-brand-cream flex flex-col">
          <div className="flex justify-between items-center p-6 border-b border-brand-charcoal/10">
            <Link href="/" className="font-serif text-2xl tracking-wide uppercase font-medium">
              JB51
            </Link>
            <button onClick={() => setMobileMenuOpen(false)} className="p-2 -mr-2">
              <X size={24} strokeWidth={1.5} />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto p-6 flex flex-col space-y-6">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="mobile-nav-item text-2xl font-serif text-brand-charcoal uppercase tracking-wider border-b border-brand-charcoal/5 pb-4"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="p-6 border-t border-brand-charcoal/10 flex justify-around">
             <Link href="/wishlist" className="flex flex-col items-center text-xs tracking-widest uppercase">
                <Heart size={20} strokeWidth={1.5} className="mb-2" />
                Wishlist
             </Link>
             <Link href="/admin" className="flex flex-col items-center text-xs tracking-widest uppercase">
                <User size={20} strokeWidth={1.5} className="mb-2" />
                Account
             </Link>
          </div>
        </div>
      )}
    </header>
  );
}
