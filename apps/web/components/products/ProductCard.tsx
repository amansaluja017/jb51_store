'use client';

import Image from 'next/image';
import Link from 'next/link';
import { type Product } from '@repo/products';
import { formatPrice } from '@/lib/utils';
import { Heart, Plus } from 'lucide-react';
import { useRef, useEffect } from 'react';
import gsap from 'gsap';

interface ProductCardProps {
  product: Product;
  featured?: boolean;
  theme?: 'light' | 'dark';
}

export function ProductCard({ product, featured = false, theme = 'light' }: ProductCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!cardRef.current || !imageRef.current) return;
    
    const card = cardRef.current;
    const img = imageRef.current;

    const hoverIn = () => {
      gsap.to(img, { scale: 1.05, duration: 1.2, ease: 'power2.out' });
    };

    const hoverOut = () => {
      gsap.to(img, { scale: 1, duration: 1.2, ease: 'power2.out' });
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
      className="group relative flex flex-col cursor-pointer overflow-hidden bg-transparent w-full h-full"
    >
      <Link href={`/product/${product.slug}`} className={`block relative overflow-hidden bg-brand-sand ${featured ? 'aspect-[4/5] md:aspect-[3/4]' : 'aspect-[3/4]'}`}>
        <Image
          ref={imageRef}
          src={product.images[0]}
          alt={product.name}
          fill
          className="object-cover transition-opacity duration-700 group-hover:opacity-0"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={product.featured || featured}
        />
        
        {/* Secondary image on hover */}
        {product.images[1] && (
          <Image
            src={product.images[1]}
            alt={`${product.name} alternate view`}
            fill
            className="object-cover absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 scale-105 group-hover:scale-100"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        )}
        
        {/* Editorial Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          {product.newArrival && (
            <span className="text-[9px] tracking-[0.2em] uppercase text-brand-maroon font-semibold bg-brand-cream/80 backdrop-blur-sm px-3 py-1">
              New Drop
            </span>
          )}
          {product.bestseller && (
            <span className="text-[9px] tracking-[0.2em] uppercase text-brand-cream font-semibold bg-brand-terracotta/90 backdrop-blur-sm px-3 py-1">
              Bestseller
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button 
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-brand-cream/60 backdrop-blur-md text-brand-brown opacity-0 group-hover:opacity-100 transition-all duration-500 hover:bg-brand-maroon hover:text-brand-cream"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <Heart size={16} strokeWidth={1.5} />
        </button>

        {/* Quick Add Button sliding in */}
        <div className="absolute bottom-4 left-4 right-4 z-10 translate-y-[150%] group-hover:translate-y-0 transition-transform duration-500 ease-out hidden md:block">
          <button 
            className="w-full bg-brand-cream/90 backdrop-blur-md text-brand-maroon py-3 text-[10px] tracking-[0.2em] uppercase font-semibold flex items-center justify-center gap-2 hover:bg-brand-maroon hover:text-brand-cream transition-colors"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <span>Quick Add</span>
            <Plus size={14} />
          </button>
        </div>
      </Link>

      {/* Description / Metadata */}
      <div className={`mt-5 flex flex-col flex-1 justify-between transform transition-transform duration-500 group-hover:-translate-y-1 z-20 ${theme === 'dark' ? 'bg-transparent text-brand-cream' : 'bg-brand-ivory text-brand-brown'}`}>
        <div>
          <Link href={`/product/${product.slug}`} className="flex flex-col md:flex-row md:justify-between md:items-start gap-1 md:gap-3 mb-1">
            <h3 className={`font-serif text-lg leading-snug transition-colors flex-1 ${theme === 'dark' ? 'text-brand-cream group-hover:text-brand-saffron' : 'text-brand-brown group-hover:text-brand-maroon'}`}>
              {product.name}
            </h3>
            <span className={`text-sm font-medium shrink-0 ${theme === 'dark' ? 'text-brand-saffron' : 'text-brand-sienna'}`}>
              {formatPrice(product.price)}
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <p className={`text-[10px] tracking-widest uppercase font-medium ${theme === 'dark' ? 'text-brand-cream/60' : 'text-brand-brown/60'}`}>
              {product.fabric || product.category}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
