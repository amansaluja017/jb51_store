'use client';

import Image from 'next/image';
import Link from 'next/link';
import { type Product } from '@repo/api';
import { formatPrice } from '@/lib/utils';
import { Heart, ArrowRight } from 'lucide-react';
import { useRef, useEffect } from 'react';
import gsap from 'gsap';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!cardRef.current || !imageRef.current) return;
    
    const card = cardRef.current;
    const img = imageRef.current;

    const hoverIn = () => {
      gsap.to(img, { scale: 1.04, duration: 0.8, ease: 'power2.out' });
    };

    const hoverOut = () => {
      gsap.to(img, { scale: 1, duration: 0.8, ease: 'power2.out' });
    };

    card.addEventListener('mouseenter', hoverIn);
    card.addEventListener('mouseleave', hoverOut);

    return () => {
      card.removeEventListener('mouseenter', hoverIn);
      card.removeEventListener('mouseleave', hoverOut);
    };
  }, []);

  return (
    <div 
      ref={cardRef} 
      className="group relative flex flex-col cursor-pointer bg-brand-cream overflow-hidden border border-brand-gold/10 hover:border-brand-gold/30 hover:-translate-y-1.5 transition-all duration-500 ease-out p-3"
    >
      <Link href={`/product/${product.slug}`} className="block relative aspect-[3/4] overflow-hidden bg-brand-beige">
        <Image
          ref={imageRef}
          src={product.images[0]}
          alt={product.name}
          fill
          className="object-cover transition-opacity duration-1000"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          priority={product.featured}
        />
        
        {/* Secondary image on hover (Desktop only) */}
        {product.images[1] && (
          <Image
            src={product.images[1]}
            alt={`${product.name} alternate view`}
            fill
            className="object-cover absolute inset-0 opacity-0 md:group-hover:opacity-100 transition-opacity duration-1000"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        )}
        
        {/* Editorial Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.newArrival && (
            <span className="bg-brand-cream/90 backdrop-blur-sm text-brand-wine border border-brand-wine/20 text-[9px] tracking-widest uppercase px-2.5 py-0.5 font-medium">
              New Drop
            </span>
          )}
          {product.bestseller && (
            <span className="bg-brand-wine text-brand-cream text-[9px] tracking-widest uppercase px-2.5 py-0.5 font-medium">
              Bestseller
            </span>
          )}
        </div>

        {/* Wishlist Button (Always visible on mobile, hover-revealed on desktop) */}
        <button 
          className="absolute top-3 right-3 z-10 p-2.5 rounded-full bg-brand-cream/80 backdrop-blur-sm text-brand-charcoal opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 hover:scale-105 hover:bg-brand-wine hover:text-brand-cream shadow-sm"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <Heart size={15} strokeWidth={1.5} />
        </button>

        {/* Quick View Slide Up overlay (Desktop only) */}
        <div className="absolute inset-x-0 bottom-0 bg-brand-wine/90 backdrop-blur-sm py-3 text-center translate-y-full md:group-hover:translate-y-0 transition-transform duration-500 ease-out z-10 hidden md:flex items-center justify-center gap-2">
          <span className="text-[10px] tracking-[0.2em] uppercase text-brand-cream font-medium">Quick View</span>
          <ArrowRight size={12} className="text-brand-gold animate-pulse" />
        </div>
      </Link>

      {/* Description / Metadata */}
      <div className="mt-4 flex flex-col flex-1 justify-between px-1">
        <div>
          <Link href={`/product/${product.slug}`} className="flex justify-between items-start gap-3">
            <h3 className="font-serif text-base text-brand-charcoal leading-snug group-hover:text-brand-wine transition-colors flex-1">
              {product.name}
            </h3>
            <span className="text-sm font-medium text-brand-wine shrink-0">
              {formatPrice(product.price)}
            </span>
          </Link>
          <p className="text-[10px] tracking-widest uppercase text-brand-gold mt-1.5 font-medium">
            {product.fabric || product.category}
          </p>
        </div>
      </div>
    </div>
  );
}
