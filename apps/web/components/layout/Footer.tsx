'use client';

import Link from 'next/link';
import { ArrowRight, Instagram, MessageCircle, Sparkles } from 'lucide-react';
import { WHATSAPP_NUMBER } from '@/lib/utils';
import { useState } from 'react';
import { toast } from 'sonner';

export function Footer() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      toast.success('Thank you for subscribing to JB51 Atelier newsletter!');
      setEmail('');
    }
  };

  return (
    <footer className="bg-zinc-950 text-zinc-200 py-24 px-6 mt-auto relative overflow-hidden border-t border-zinc-900">
      {/* Premium accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#FF5E36]" />
      
      {/* Decorative aura blobs */}
      <div className="absolute top-0 left-1/4 w-80 h-80 rounded-full bg-[#FF5E36]/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-white/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 relative z-10">
        
        {/* Column 1: Brand Info (col-span-4) */}
        <div className="md:col-span-4 flex flex-col justify-between">
          <div>
            <div className="flex flex-col mb-6">
              <Link href="/" className="font-serif text-3xl tracking-[0.15em] uppercase font-bold text-white hover:text-[#FF5E36] transition-colors">
                JB51
              </Link>
              <span className="text-[7px] tracking-[0.4em] uppercase text-[#FF5E36] font-bold mt-0.5">ATELIER EST. 1951</span>
            </div>
            <p className="text-zinc-400 text-xs md:text-sm max-w-sm leading-relaxed font-light mb-6">
              Contemporary silhouettes, luxury Indian handlooms, and timeless craftsmanship designed for the modern woman. Rooted in heritage, styled for the world.
            </p>
          </div>
          <div className="flex items-center gap-2 text-zinc-500 text-[10px] uppercase tracking-wider font-semibold">
            <Sparkles size={12} className="text-[#FF5E36]" />
            <span>Crafted in India. Designed for everywhere.</span>
          </div>
        </div>

        {/* Column 2: Collections (col-span-2) */}
        <div className="md:col-span-2">
          <p className="font-serif text-xs uppercase tracking-[0.25em] text-[#FF5E36] font-bold mb-6">Collections</p>
          <ul className="space-y-3.5 text-xs text-zinc-400 font-light">
            <li><Link href="/shop" className="hover:text-white transition-colors">Shop All</Link></li>
            <li><Link href="/shop?category=occasion-wear" className="hover:text-white transition-colors">Occasion Wear</Link></li>
            <li><Link href="/shop?category=velvet-edit" className="hover:text-white transition-colors">Velvet Edit</Link></li>
            <li><Link href="/shop?category=anarkali-suits" className="hover:text-white transition-colors">Anarkali Suits</Link></li>
            <li><Link href="/shop?category=silk-co-ords" className="hover:text-white transition-colors">Silk Co-ords</Link></li>
          </ul>
        </div>

        {/* Column 3: Concierge & Support (col-span-2) */}
        <div className="md:col-span-2">
          <p className="font-serif text-xs uppercase tracking-[0.25em] text-[#FF5E36] font-bold mb-6">Concierge</p>
          <ul className="space-y-3.5 text-xs text-zinc-400 font-light">
            <li><Link href="/support" className="hover:text-white transition-colors">Customer Support</Link></li>
            <li><Link href="/wishlist" className="hover:text-white transition-colors">My Wishlist</Link></li>
            <li><Link href="/support" className="hover:text-white transition-colors">Size Guide</Link></li>
            <li><Link href="/support" className="hover:text-white transition-colors">Shipping & Returns</Link></li>
            <li><Link href="/support" className="hover:text-white transition-colors">Book Consultation</Link></li>
          </ul>
        </div>

        {/* Column 4: Newsletter & Socials (col-span-4) */}
        <div className="md:col-span-4">
          <p className="font-serif text-xs uppercase tracking-[0.25em] text-[#FF5E36] font-bold mb-6">Atelier Newsletter</p>
          <p className="text-zinc-400 text-xs font-light leading-relaxed mb-4">
            Subscribe to receive private collection previews, seasonal privileges, and sartorial updates.
          </p>
          <form onSubmit={handleSubscribe} className="relative flex items-center mb-6">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="w-full bg-zinc-900 border border-zinc-800 rounded-full px-5 py-3 text-xs outline-none text-white focus:border-zinc-700 transition-colors pr-12 placeholder:text-zinc-600"
            />
            <button
              type="submit"
              className="absolute right-1 w-9 h-9 rounded-full bg-[#FF5E36] hover:bg-[#E04D27] text-white flex items-center justify-center transition-all duration-300 shadow-md cursor-pointer"
              aria-label="Subscribe"
            >
              <ArrowRight size={14} />
            </button>
          </form>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            <a
              href="https://instagram.com/jb51_clothing_house"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full border border-zinc-850 hover:border-white text-zinc-400 hover:text-white flex items-center justify-center transition-all duration-300"
              title="Instagram"
            >
              <Instagram size={14} />
            </a>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full border border-zinc-850 hover:border-white text-zinc-400 hover:text-white flex items-center justify-center transition-all duration-300"
              title="WhatsApp"
            >
              <MessageCircle size={14} />
            </a>
          </div>
        </div>

      </div>
      
      {/* Bottom copyright row */}
      <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center text-[9px] tracking-widest uppercase text-zinc-500 font-light gap-4">
        <p>&copy; {new Date().getFullYear()} JB51. All rights reserved.</p>
        <div className="flex gap-6">
          <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
