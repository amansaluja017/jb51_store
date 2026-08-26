'use client';

import Link from 'next/link';
import { WHATSAPP_NUMBER } from '@/lib/utils';

export function Footer() {
  return (
    <footer className="bg-brand-brown text-brand-cream py-20 px-6 mt-auto relative overflow-hidden">
      {/* Traditional Indian Border at the top */}
      <div className="absolute top-0 left-0 right-0 h-[4px] pattern-jaali opacity-30" />
      <div className="absolute top-1 left-0 right-0 h-[1px] bg-brand-gold/20" />

      {/* Decorative background Paisley ornament (faint gold) */}
      <div className="absolute right-0 bottom-0 w-96 h-96 opacity-[0.04] pointer-events-none paisley-bg" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-16 relative z-10">
        
        {/* Column 1: Brand Info */}
        <div className="md:col-span-2">
          <div className="flex flex-col mb-6">
            <Link href="/" className="font-serif text-3xl tracking-[0.15em] uppercase font-semibold text-brand-cream hover:text-brand-gold transition-colors">
              JB51
            </Link>
            <span className="text-[8px] tracking-[0.4em] uppercase text-brand-gold font-semibold mt-0.5">EST. 1951</span>
          </div>
          <p className="text-brand-cream/70 text-xs md:text-sm max-w-sm leading-relaxed font-light mb-6">
            Contemporary silhouettes, luxury Indian handlooms, and timeless craftsmanship designed for the modern woman.
          </p>
          <p className="font-serif text-brand-gold text-sm italic">
            Crafted in India. Designed for everywhere.
          </p>
        </div>

        {/* Column 2: Collections */}
        <div>
          <h4 className="font-serif text-sm uppercase tracking-[0.2em] text-brand-gold mb-6">Collections</h4>
          <ul className="space-y-4 text-xs md:text-sm text-brand-cream/70 font-light">
            <li><Link href="/shop" className="hover:text-brand-gold transition-colors">Shop All</Link></li>
            <li><Link href="/shop?category=occasion-wear" className="hover:text-brand-gold transition-colors">Occasion Wear</Link></li>
            <li><Link href="/shop?category=velvet-edit" className="hover:text-brand-gold transition-colors">Velvet Edit</Link></li>
            <li><Link href="/shop?category=anarkali-suits" className="hover:text-brand-gold transition-colors">Anarkali Suits</Link></li>
            <li><Link href="/shop?category=silk-co-ords" className="hover:text-brand-gold transition-colors">Silk Co-ords</Link></li>
          </ul>
        </div>

        {/* Column 3: Concierge & Socials */}
        <div>
          <h4 className="font-serif text-sm uppercase tracking-[0.2em] text-brand-gold mb-6">Concierge & Connect</h4>
          <ul className="space-y-4 text-xs md:text-sm text-brand-cream/70 font-light">
            <li><Link href="/support" className="hover:text-brand-gold transition-colors">Customer Support</Link></li>
            <li><Link href="/wishlist" className="hover:text-brand-gold transition-colors">My Wishlist</Link></li>
            <li>
              <a 
                href="https://instagram.com/jb51_clothing_house" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-brand-gold transition-colors"
              >
                Instagram
              </a>
            </li>
            <li>
              <a 
                href={`https://wa.me/${WHATSAPP_NUMBER}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-brand-gold transition-colors"
              >
                WhatsApp Support
              </a>
            </li>
          </ul>
        </div>

      </div>
      
      {/* Bottom copyright row */}
      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-brand-cream/10 flex flex-col md:flex-row justify-between items-center text-[10px] tracking-widest uppercase text-brand-cream/40 font-light">
        <p>&copy; {new Date().getFullYear()} JB51. All rights reserved.</p>
      </div>
    </footer>
  );
}
