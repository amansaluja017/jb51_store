'use client';

import Image from 'next/image';
import Link from 'next/link';
import { type Product } from '@repo/products';
import { formatPrice, cn } from '@/lib/utils';
import { Heart, Eye, Sparkles, ArrowRight } from 'lucide-react';
import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useWishlist } from '@/context/WishlistContext';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
  featured?: boolean;
  theme?: 'light' | 'dark';
}

export function ProductCard({ product, featured = false, theme = 'light' }: ProductCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isLiked = isInWishlist(product.id);

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



  const isDark = theme === 'dark';

  return (
    <div
      ref={cardRef}
      className={cn(
        "group relative flex flex-col cursor-pointer overflow-hidden rounded-2xl border transition-all duration-300 w-full h-full",
        isDark 
          ? "bg-zinc-900/40 border-zinc-800/60 hover:border-zinc-700/80 shadow-md hover:shadow-xl" 
          : "bg-white border-zinc-100 hover:border-zinc-200 shadow-sm hover:shadow-lg"
      )}
    >
      {/* Product Image Container */}
      <Link 
        href={`/product/${product.slug}`} 
        className={cn(
          "block relative overflow-hidden bg-zinc-50",
          featured ? "aspect-[4/5] md:aspect-[3/4]" : "aspect-[3/4]"
        )}
      >
        <Image
          ref={imageRef}
          src={product.images[0]}
          alt={product.name}
          fill
          className="object-cover transition-opacity duration-500 group-hover:opacity-0"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          priority={product.featured || featured}
        />

        {/* Secondary image on hover */}
        {product.images[1] && (
          <Image
            src={product.images[1]}
            alt={`${product.name} alternate view`}
            fill
            className="object-cover absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 scale-102 group-hover:scale-100"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        )}

        {/* Badges */}
        <div className="absolute top-3.5 left-3.5 flex flex-col gap-1.5 z-10">
          {product.newArrival && (
            <span className="text-[8px] md:text-[9px] tracking-wider uppercase text-white font-bold bg-[#FF5E36] px-2.5 py-1 rounded-full shadow-sm">
              NEW
            </span>
          )}
          {product.bestseller && (
            <span className="text-[8px] md:text-[9px] tracking-wider uppercase text-white font-bold bg-[#1F1A1B] px-2.5 py-1 rounded-full shadow-sm">
              BESTSELLER
            </span>
          )}
        </div>

        {/* Wishlist Heart Button */}
        <button
          className={cn(
            "absolute top-3.5 right-3.5 z-10 p-2 rounded-full transition-all duration-300 shadow-sm",
            isLiked
              ? "bg-white text-[#FF5E36] opacity-100"
              : "bg-white/80 backdrop-blur-md text-zinc-600 opacity-0 group-hover:opacity-100 hover:bg-white hover:text-[#FF5E36]"
          )}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
        >
          <Heart size={15} className={cn(isLiked && "fill-[#FF5E36]")} />
        </button>

        {/* Quick View overlay indicator (visible on hover) */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
          <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-md text-[10px] tracking-widest font-semibold uppercase text-zinc-800 flex items-center gap-1.5 transform translate-y-3 group-hover:translate-y-0 transition-transform duration-500">
            <Eye size={12} />
            <span>Quick View</span>
          </div>
        </div>
      </Link>

      {/* Details Container */}
      <div className={cn(
        "p-4 flex flex-col flex-1 justify-between",
        isDark ? "text-white" : "text-zinc-800"
      )}>
        <div>
          {/* Category */}
          <span className={cn(
            "text-[9px] tracking-widest uppercase font-bold block mb-1",
            isDark ? "text-zinc-400" : "text-zinc-400"
          )}>
            {product.category}
          </span>

          {/* Product Name */}
          <Link 
            href={`/product/${product.slug}`} 
            className={cn(
              "font-serif text-sm md:text-base font-semibold leading-tight line-clamp-1 hover:text-[#FF5E36] transition-colors block mb-1.5",
              isDark ? "text-white" : "text-zinc-950"
            )}
          >
            {product.name}
          </Link>

          {/* Fabric */}
          <p className="text-[10px] text-zinc-400 font-light truncate mb-2">
            {product.fabric || 'Premium Handloom'}
          </p>
        </div>

        {/* Price & Add to Cart Action */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-100/50">
          <div className="flex flex-col">
            {product.discountPrice ? (
              <div className="flex items-center gap-2">
                <span className="text-xs line-through text-zinc-400">{formatPrice(product.price)}</span>
                <span className="text-sm font-bold text-[#FF5E36]">{formatPrice(product.discountPrice)}</span>
              </div>
            ) : (
              <span className={cn(
                "text-sm font-bold",
                isDark ? "text-white" : "text-zinc-900"
              )}>
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {/* View Details Link */}
          <Link
            href={`/product/${product.slug}`}
            className={cn(
              "p-2.5 rounded-full transition-all duration-300 flex items-center justify-center hover:scale-105 shadow-sm",
              isDark
                ? "bg-zinc-800 hover:bg-[#FF5E36] text-white"
                : "bg-zinc-100 hover:bg-[#FF5E36] text-zinc-800 hover:text-white"
            )}
            title="View Details"
          >
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
