'use client';

import { useState } from 'react';
import Link from 'next/link';

export function Footer() {
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubscribing(true);
    setTimeout(() => {
      setIsSubscribing(false);
      alert('Thank you for subscribing to the JB51 newsletter.');
    }, 1200);
  };
  return (
    <footer className="bg-brand-brown text-brand-cream py-24 px-6 mt-auto relative overflow-hidden">
      {/* Traditional Indian Border at the top */}
      <div className="absolute top-0 left-0 right-0 h-[4px] pattern-jaali opacity-30" />
      <div className="absolute top-1 left-0 right-0 h-[1px] bg-brand-gold/20" />

      {/* Decorative background Paisley ornament (faint gold) */}
      <div className="absolute right-0 bottom-0 w-96 h-96 opacity-[0.04] pointer-events-none paisley-bg" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16 relative z-10">
        <div className="col-span-1">
          <div className="flex flex-col mb-6">
            <Link href="/" className="font-serif text-3xl tracking-[0.15em] uppercase font-semibold text-brand-cream hover:text-brand-gold transition-colors">
              JB51
            </Link>
            <span className="text-[8px] tracking-[0.4em] uppercase text-brand-gold font-semibold mt-0.5">EST. 1951</span>
          </div>
          <p className="text-brand-cream/70 text-xs md:text-sm max-w-xs leading-relaxed font-light mb-6">
            Contemporary silhouettes, luxury Indian handlooms, and timeless craftsmanship designed for the modern woman.
          </p>
          <p className="font-serif text-brand-gold text-sm italic">
            Crafted in India. Designed for everywhere.
          </p>
        </div>

        <div>
          <h4 className="font-serif text-sm uppercase tracking-[0.2em] text-brand-gold mb-6">The Brand</h4>
          <ul className="space-y-4 text-xs md:text-sm text-brand-cream/70 font-light mb-10">
            <li><Link href="/about" className="hover:text-brand-gold transition-colors">Our Heritage</Link></li>
            <li><Link href="/journal" className="hover:text-brand-gold transition-colors">Journal</Link></li>
            <li><Link href="/craftsmanship" className="hover:text-brand-gold transition-colors">Craftsmanship</Link></li>
          </ul>

          <h4 className="font-serif text-sm uppercase tracking-[0.2em] text-brand-gold mb-6">Customer Care</h4>
          <ul className="space-y-4 text-xs md:text-sm text-brand-cream/70 font-light">
            <li><Link href="/contact" className="hover:text-brand-gold transition-colors">Bespoke Consultations</Link></li>
            <li><Link href="/shipping" className="hover:text-brand-gold transition-colors">Shipping & Returns</Link></li>
            <li><Link href="/faq" className="hover:text-brand-gold transition-colors">FAQ</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-serif text-sm uppercase tracking-[0.2em] text-brand-gold mb-6">Collections</h4>
          <ul className="space-y-4 text-xs md:text-sm text-brand-cream/70 font-light mb-10">
            <li><Link href="/shop" className="hover:text-brand-gold transition-colors">Shop All</Link></li>
            <li><Link href="/shop?category=festive" className="hover:text-brand-gold transition-colors">The Festive Edit</Link></li>
            <li><Link href="/shop?category=bridal" className="hover:text-brand-gold transition-colors">Bridal</Link></li>
            <li><Link href="/shop?category=suits" className="hover:text-brand-gold transition-colors">Classic Suits</Link></li>
          </ul>

          <h4 className="font-serif text-sm uppercase tracking-[0.2em] text-brand-gold mb-6">Follow Us</h4>
          <ul className="space-y-4 text-xs md:text-sm text-brand-cream/70 font-light">
            <li><a href="#" className="hover:text-brand-gold transition-colors">Instagram</a></li>
            <li><a href="#" className="hover:text-brand-gold transition-colors">Pinterest</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-serif text-sm uppercase tracking-[0.2em] text-brand-gold mb-6">The Newsletter</h4>
          <p className="text-brand-cream/70 text-xs md:text-sm mb-6 leading-relaxed font-light">
            Subscribe for exclusive previews of upcoming festive drops, styling advice, and design stories.
          </p>
          <form onSubmit={handleSubscribe} className="flex border-b border-brand-cream/20 pb-2">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="bg-transparent border-none outline-none flex-1 text-xs md:text-sm placeholder:text-brand-cream/35 text-brand-cream"
              required
            />
            <button 
              type="submit" 
              disabled={isSubscribing}
              className="text-xs tracking-[0.25em] uppercase text-brand-gold hover:text-brand-cream transition-colors font-medium disabled:opacity-50 min-w-[90px] flex justify-end items-center"
            >
              {isSubscribing ? (
                <span className="w-3.5 h-3.5 border border-brand-gold/30 border-t-brand-gold rounded-full animate-spin" />
              ) : (
                "SUBSCRIBE"
              )}
            </button>
          </form>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-24 pt-8 border-t border-brand-cream/10 flex flex-col md:flex-row justify-between items-center text-[10px] tracking-widest uppercase text-brand-cream/40 font-light">
        <p>&copy; {new Date().getFullYear()} JB51. All rights reserved.</p>
      </div>
    </footer>
  );
}
