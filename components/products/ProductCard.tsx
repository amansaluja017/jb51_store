'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/lib/data';
import { formatPrice } from '@/lib/utils';
import { Heart } from 'lucide-react';
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
      gsap.to(img, { scale: 1.05, duration: 0.6, ease: 'power2.out' });
    };

    const hoverOut = () => {
      gsap.to(img, { scale: 1, duration: 0.6, ease: 'power2.out' });
    };

    card.addEventListener('mouseenter', hoverIn);
    card.addEventListener('mouseleave', hoverOut);

    return () => {
      card.removeEventListener('mouseenter', hoverIn);
      card.removeEventListener('mouseleave', hoverOut);
    };
  }, []);

  return (
    <div ref={cardRef} className="group relative flex flex-col cursor-pointer">
      <Link href={`/product/${product.slug}`} className="block relative aspect-[3/4] overflow-hidden bg-brand-beige">
        <Image
          ref={imageRef}
          src={product.images[0]}
          alt={product.name}
          fill
          className="object-cover transition-opacity duration-700"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {/* Secondary image on hover (CSS only for smoothness) */}
        {product.images[1] && (
          <Image
            src={product.images[1]}
            alt={`${product.name} alternate view`}
            fill
            className="object-cover absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        )}
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          {product.newArrival && (
            <span className="bg-brand-cream text-brand-charcoal text-[10px] tracking-widest uppercase px-3 py-1">
              New
            </span>
          )}
          {product.bestseller && (
            <span className="bg-brand-charcoal text-brand-cream text-[10px] tracking-widest uppercase px-3 py-1">
              Bestseller
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button className="absolute top-4 right-4 z-10 p-2 text-brand-charcoal opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:scale-110">
          <Heart size={20} strokeWidth={1.5} />
        </button>
      </Link>

      <div className="mt-4 flex flex-col">
        <Link href={`/product/${product.slug}`} className="flex justify-between items-start">
          <h3 className="font-serif text-lg text-brand-charcoal leading-snug group-hover:text-brand-charcoal/70 transition-colors">
            {product.name}
          </h3>
          <span className="text-sm font-medium text-brand-charcoal ml-4">
            {formatPrice(product.price)}
          </span>
        </Link>
        <p className="text-xs text-brand-charcoal/60 mt-1 capitalize">
          {product.category}
        </p>
      </div>
    </div>
  );
}
