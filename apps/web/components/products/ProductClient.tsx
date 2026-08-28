'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { type Product } from '@repo/products';
import { formatPrice, cn, generateWhatsAppMessage, generateInstagramMessage, WHATSAPP_NUMBER, INSTAGRAM_HANDLE } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import gsap from 'gsap';
import { toast } from 'sonner';
import { Heart, Truck, RotateCcw, ShieldCheck, MessageCircle, Instagram, Sparkles, Star, Ruler, ArrowRight, ArrowLeft, X } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { api } from '@/lib/trpc/client/react';
import { ProductCard } from '@/components/products/ProductCard';

// Beautiful luxury Indian lotus icon motif
const LotusIcon = ({ className = "w-6 h-6 text-brand-gold" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
    {/* Center petal */}
    <path d="M12 4C12 4 9 10 12 20C15 10 12 4 12 4Z" fill="currentColor" fillOpacity="0.08" />
    {/* Left petal */}
    <path d="M12 12C9 9 4 11 6 18C10 18 11 14 12 12Z" fill="currentColor" fillOpacity="0.04" />
    {/* Right petal */}
    <path d="M12 12C15 9 20 11 18 18C14 18 13 14 12 12Z" fill="currentColor" fillOpacity="0.04" />
    {/* Far left petal */}
    <path d="M12 16C8 14 3 16 3 20C8 20 10 18 12 16Z" fill="currentColor" fillOpacity="0.02" />
    {/* Far right petal */}
    <path d="M12 16C16 14 21 16 21 20C16 20 14 18 12 16Z" fill="currentColor" fillOpacity="0.02" />
    {/* Base stem */}
    <path d="M10 21C11 21.5 13 21.5 14 21" strokeLinecap="round" />
  </svg>
);

export function ProductClient({ product }: { product: Product }) {
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>(product.variants[0]?.color || '');
  const [activeImage, setActiveImage] = useState(0);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  const sizeGuideTriggerRef = useRef<HTMLButtonElement | null>(null);
  const sizeGuideCloseBtnRef = useRef<HTMLButtonElement | null>(null);
  const sizeGuideModalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (showSizeGuide) {
      setTimeout(() => {
        if (sizeGuideCloseBtnRef.current) {
          sizeGuideCloseBtnRef.current.focus();
        } else if (sizeGuideModalRef.current) {
          sizeGuideModalRef.current.focus();
        }
      }, 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setShowSizeGuide(false);
          return;
        }

        if (e.key === 'Tab') {
          if (!sizeGuideModalRef.current) return;
          const focusableElements = sizeGuideModalRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusableElements.length === 0) return;
          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              lastElement.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === lastElement) {
              firstElement.focus();
              e.preventDefault();
            }
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      if (sizeGuideTriggerRef.current) {
        sizeGuideTriggerRef.current.focus();
      }
    }
  }, [showSizeGuide]);
  
  // Magnifier State
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isHovering, setIsHovering] = useState(false);

  const { isInWishlist, toggleWishlist } = useWishlist();
  const isLiked = isInWishlist(product.id);

  // Fetch and filter similar products using tags
  const { data: products = [], isLoading: loading } = api.products.getAll.useQuery();

  const similarProductsByTag = products
    .filter(p => p.id !== product.id)
    .map(p => {
      const currentTags = product.tags || [];
      const compareTags = p.tags || [];
      const matchCount = currentTags.filter(t => compareTags.includes(t)).length;
      return { product: p, matchCount };
    })
    .filter(item => item.matchCount > 0)
    .sort((a, b) => b.matchCount - a.matchCount)
    .map(item => item.product);

  const fallbackCategoryProducts = products
    .filter(p => p.id !== product.id && p.category === product.category && !similarProductsByTag.some(sp => sp.id === p.id));

  const fallbackAllProducts = products
    .filter(p => p.id !== product.id && !similarProductsByTag.some(sp => sp.id === p.id) && !fallbackCategoryProducts.some(f => f.id === p.id));

  const similarProducts = [...similarProductsByTag, ...fallbackCategoryProducts, ...fallbackAllProducts].slice(0, 4);

  // Extract unique colors and sizes
  const colors = Array.from(new Set(product.variants.map(v => v.color)));
  const sizes = Array.from(new Set(product.variants.map(v => v.size)));

  useEffect(() => {
    gsap.fromTo('.product-animate',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.06, ease: 'power3.out' }
    );
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  const handleWhatsAppInquiry = () => {
    if (!selectedSize) {
      toast.error("Please select a size first");
      return;
    }
    const message = generateWhatsAppMessage(product, selectedSize, selectedColor, window.location.href);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
  };

  const handleInstagramInquiry = () => {
    if (!selectedSize) {
      toast.error("Please select a size first");
      return;
    }
    const message = generateInstagramMessage(product, selectedSize, selectedColor, window.location.href);
    navigator.clipboard.writeText(message);
    toast.success("Product details copied to clipboard!");
    setTimeout(() => {
      window.open(`https://instagram.com/${INSTAGRAM_HANDLE}`, '_blank');
    }, 1000);
  };

  // Get current stock count for selected combination
  const selectedVariant = product.variants.find(v => v.size === selectedSize && v.color === selectedColor);
  const currentStock = selectedVariant ? selectedVariant.stock : 0;
  const isSelectedOutOfStock = !!selectedSize && currentStock === 0;

  return (
    <div className="bg-brand-cream/40 min-h-screen text-brand-charcoal">
      <div aria-hidden={showSizeGuide}>
      
      {/* 1. Breadcrumbs / Navigation Back Row */}
      <div className="max-w-7xl mx-auto px-6 pt-32 md:pt-36 w-full flex items-center justify-between border-b border-brand-sand/20 pb-4">
        <Link 
          href="/shop" 
          className="group inline-flex items-center gap-2 text-[10px] tracking-widest uppercase font-bold text-brand-gold hover:text-brand-maroon transition-colors"
        >
          <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Atelier Catalog</span>
        </Link>
        <div className="hidden sm:flex items-center gap-1.5 text-[9px] tracking-[0.25em] uppercase text-zinc-400 font-semibold select-none">
          <span>Home</span>
          <span>✦</span>
          <span>Shop</span>
          <span>✦</span>
          <span className="text-brand-gold font-bold">{product.category}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-8 pb-20 w-full flex flex-col lg:flex-row items-start gap-12 lg:gap-16 relative">
        
        {/* Left Column: Asymmetrical Editorial Image Gallery */}
        <div className="w-full lg:w-3/5 flex flex-col-reverse md:flex-row gap-6 product-animate relative z-10">
          
          {/* Thumbnails list */}
          <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto hide-scrollbar md:w-20 shrink-0 select-none pb-2 md:pb-0">
            {product.images.map((img, idx) => (
              <button 
                key={idx} 
                onClick={() => setActiveImage(idx)}
                className={cn(
                  "relative aspect-[3/4] w-16 md:w-full shrink-0 border-2 rounded-xl overflow-hidden transition-all duration-300",
                  activeImage === idx 
                    ? 'border-brand-maroon scale-102 shadow-md shadow-brand-maroon/5 bg-white' 
                    : 'border-brand-sand opacity-60 hover:opacity-100 hover:border-brand-gold bg-brand-cream/10'
                )}
                aria-label={`View product image ${idx + 1}`}
              >
                <Image src={img} alt={`Thumbnail view ${idx}`} fill className="object-cover" />
              </button>
            ))}
          </div>

          {/* Large main image frame with traditional double border (Jharokha style) */}
          <div className="relative flex-1">
            <div 
              className="relative aspect-[3/4] w-full bg-white border border-brand-sand/50 rounded-3xl overflow-hidden shadow-xl shadow-brand-brown/5 cursor-crosshair group"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              {/* Fine traditional gold inset border */}
              <div className="absolute inset-3.5 border border-brand-gold/15 rounded-2xl pointer-events-none z-20" />

              <Image 
                src={product.images[activeImage]} 
                alt={product.name} 
                fill 
                priority
                className="object-cover transition-transform duration-100 ease-out origin-[var(--zoom-x)_var(--zoom-y)] lg:!transform-none"
                style={{
                  transform: isHovering ? 'scale(2.2)' : 'scale(1)',
                  '--zoom-x': `${zoomPos.x}%`,
                  '--zoom-y': `${zoomPos.y}%`,
                } as any}
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              
              {/* Lens overlay (Desktop only, follows coordinates with clamps) */}
              {isHovering && (
                <div 
                  className="absolute w-[25%] h-[25%] bg-brand-maroon/5 border border-brand-gold/30 pointer-events-none z-30 rounded-2xl hidden lg:block"
                  style={{
                    left: `clamp(0%, calc(${zoomPos.x}% - 12.5%), 75%)`,
                    top: `clamp(0%, calc(${zoomPos.y}% - 12.5%), 75%)`,
                  }}
                />
              )}

              {/* Elegant Floating Badges */}
              <div className="absolute top-6 left-6 z-20 flex flex-col gap-2">
                {product.newArrival && (
                  <span className="text-[8px] tracking-[0.25em] uppercase text-white font-bold bg-brand-terracotta px-3.5 py-1.5 rounded-full shadow-md">
                    New Edit
                  </span>
                )}
                {product.bestseller && (
                  <span className="text-[8px] tracking-[0.25em] uppercase text-white font-bold bg-brand-charcoal px-3.5 py-1.5 rounded-full shadow-md border border-white/10">
                    Bestseller
                  </span>
                )}
              </div>

              {/* Hover magnifying glass badge */}
              {!isHovering && (
                <div className="absolute bottom-6 right-6 bg-brand-charcoal/80 backdrop-blur-sm text-brand-cream text-[8px] tracking-[0.2em] uppercase font-bold py-1.5 px-3.5 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                  Hover to Magnify
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Right Column: Premium Sticky Details Panel */}
        <div className="w-full lg:w-2/5 flex flex-col pt-2 sticky top-32 product-animate relative z-10">
          
          {/* Side Magnifier Zoom Window (Desktop only, absolute positioned over details column when hovering the image) */}
          {isHovering && (
            <div className="absolute top-0 left-0 w-full aspect-[3/4] bg-white border border-brand-sand rounded-3xl overflow-hidden z-50 pointer-events-none hidden lg:block shadow-2xl animate-scale-up">
              {/* Traditional fine gold inset border inside zoom */}
              <div className="absolute inset-3.5 border border-brand-gold/15 rounded-2xl pointer-events-none z-20" />
              
              {/* Zoomed image */}
              <div className="absolute inset-0">
                <Image 
                  src={product.images[activeImage]} 
                  alt="Zoom detail preview" 
                  fill 
                  className="object-cover"
                  style={{
                    transform: `scale(4)`,
                    transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                  }}
                />
              </div>

              {/* Elegant label indicator */}
              <div className="absolute bottom-6 left-6 bg-brand-charcoal/80 backdrop-blur-sm text-brand-cream text-[8px] tracking-[0.2em] uppercase font-bold py-1.5 px-3.5 rounded-full z-20 flex items-center gap-1.5 border border-white/5">
                <Sparkles size={8} className="text-brand-gold animate-pulse" />
                <span>Zoom Detail</span>
              </div>
            </div>
          )}

          {/* Tagline / Category */}
          <span className="text-[10px] tracking-[0.3em] uppercase text-brand-gold font-bold block mb-2 font-sans">
            {product.category}
          </span>
          
          {/* Product Title */}
          <h1 className="font-serif text-3xl md:text-4xl lg:text-[2.6rem] font-light text-brand-brown tracking-tight leading-[1.1] mb-3">
            {product.name}
          </h1>

          {/* Subtitle / Attributes Row */}
          <div className="flex flex-wrap items-center gap-2.5 mb-4">
            <span className="text-[9px] tracking-wider uppercase font-bold text-brand-maroon bg-brand-maroon/5 px-2.5 py-1 rounded-full border border-brand-maroon/10">
              ✦ Handloom Heritage
            </span>
            <span className="text-[9px] tracking-wider uppercase font-bold text-brand-emerald bg-brand-emerald/5 px-2.5 py-1 rounded-full border border-brand-emerald/10">
              ✦ Artisanal Weave
            </span>
          </div>

          {/* Pricing Block */}
          <div className="flex items-baseline gap-3 mt-1 mb-5">
            {product.discountPrice ? (
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-serif text-brand-maroon font-light">{formatPrice(product.discountPrice)}</span>
                <span className="text-sm line-through text-zinc-400 font-light">{formatPrice(product.price)}</span>
                <span className="text-[9px] font-bold text-brand-terracotta uppercase tracking-wider bg-brand-terracotta/5 px-2 py-0.5 rounded-md ml-1 border border-brand-terracotta/10">
                  Save {(100 - (product.discountPrice / product.price) * 100).toFixed(0)}%
                </span>
              </div>
            ) : (
              <span className="text-3xl font-serif text-brand-maroon font-light">{formatPrice(product.price)}</span>
            )}
            <span className="text-[9px] text-zinc-400 tracking-wider uppercase block font-medium font-sans">
              (Includes Complimentary Sizing & Taxes)
            </span>
          </div>

          {/* Luxury Editorial Divider */}
          <div className="editorial-divider my-2" />
          
          {/* Description */}
          <p className="text-brand-charcoal/80 text-xs md:text-sm leading-relaxed mb-6 font-light">
            {product.description}
          </p>

          {/* Color Selection Pill Swatches */}
          <div className="mb-5 border-t border-brand-sand/20 pt-5">
            <div className="flex justify-between items-center mb-3.5">
              <span className="text-[10px] tracking-wider uppercase text-zinc-400 font-bold">
                Shade: <span className="text-brand-brown font-extrabold">{selectedColor}</span>
              </span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {colors.map(color => (
                <button
                  key={color}
                  onClick={() => {
                    setSelectedColor(color);
                    setSelectedSize(''); // Reset size on shade change
                  }}
                  className={cn(
                    "px-4 py-2 border rounded-full text-[10px] tracking-widest uppercase font-bold transition-all duration-300 cursor-pointer",
                    selectedColor === color 
                      ? 'border-brand-maroon bg-brand-maroon text-white shadow-md shadow-brand-maroon/10' 
                      : 'border-brand-sand/60 text-brand-charcoal hover:border-brand-gold hover:bg-white bg-white/40'
                  )}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Size Selection Grid */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3.5">
              <span className="text-[10px] tracking-wider uppercase text-zinc-400 font-bold">Select Size</span>
              <button 
                ref={sizeGuideTriggerRef}
                onClick={() => setShowSizeGuide(true)}
                className="text-[9px] tracking-widest uppercase underline underline-offset-4 text-brand-gold hover:text-brand-maroon font-extrabold transition-colors cursor-pointer"
              >
                Atelier Size Guide
              </button>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {sizes.map(size => {
                const isAvailable = product.variants.some(v => v.size === size && v.color === selectedColor && v.stock > 0);
                return (
                  <button
                    key={size}
                    disabled={!isAvailable}
                    onClick={() => setSelectedSize(size)}
                    className={cn(
                      "w-12 h-12 border rounded-2xl flex items-center justify-center text-xs transition-all duration-300 font-bold cursor-pointer",
                      selectedSize === size 
                        ? 'border-brand-brown bg-brand-charcoal text-white shadow-md' 
                        : isAvailable 
                          ? 'border-brand-sand/60 text-brand-charcoal hover:border-brand-gold hover:bg-white bg-white/40' 
                          : 'opacity-15 cursor-not-allowed border-brand-sand bg-zinc-100 line-through text-zinc-400'
                    )}
                  >
                    {size}
                  </button>
                );
              })}
            </div>

            {/* Selected size Stock indicator */}
            {selectedSize && (
              <div className="mt-3 text-[9px] uppercase font-bold tracking-wider">
                {isSelectedOutOfStock ? (
                  <span className="text-brand-terracotta">Out of Stock - Custom Order Available</span>
                ) : currentStock <= 3 ? (
                  <span className="text-brand-maroon">Only {currentStock} atelier tailoring slots left!</span>
                ) : (
                  <span className="text-brand-emerald">Tailoring slots open</span>
                )}
              </div>
            )}
          </div>

          {/* Actions & Concierge Inquiry Buttons */}
          <div className="flex flex-col gap-3.5 mb-6">
            <div className="flex flex-col sm:flex-row gap-3 items-stretch">
              {/* WhatsApp Inquiry Button (Emerald color palette) */}
              <button 
                onClick={handleWhatsAppInquiry}
                className="flex-1 bg-brand-emerald hover:bg-brand-emerald/90 text-white py-4 px-6 rounded-full flex items-center justify-center gap-2.5 text-[10px] tracking-widest uppercase font-extrabold transition-all duration-300 shadow-md shadow-brand-emerald/10 cursor-pointer"
              >
                <MessageCircle size={14} className="fill-white/10" />
                <span>INQUIRE ON WHATSAPP</span>
              </button>

              {/* Instagram Inquiry Button (Wine color palette) */}
              <button 
                onClick={handleInstagramInquiry}
                className="flex-1 bg-brand-wine hover:bg-brand-wine/95 text-white py-4 px-6 rounded-full flex items-center justify-center gap-2.5 text-[10px] tracking-widest uppercase font-extrabold transition-all duration-300 shadow-md shadow-brand-wine/10 cursor-pointer"
              >
                <Instagram size={14} />
                <span>DM ON INSTAGRAM</span>
              </button>
            </div>

            {/* Wishlist Button */}
            <button 
              onClick={() => toggleWishlist(product.id)}
              className={cn(
                "w-full border py-4 rounded-full flex items-center justify-center gap-2.5 text-[10px] tracking-widest uppercase font-extrabold transition-all duration-300 hover:scale-101 cursor-pointer",
                isLiked 
                  ? "border-brand-maroon bg-brand-maroon/5 text-brand-maroon" 
                  : "border-brand-sand/80 text-brand-charcoal hover:border-brand-gold hover:text-brand-gold bg-white/10"
              )}
            >
              <Heart size={14} className={cn(isLiked && "fill-brand-maroon text-brand-maroon")} />
              <span>{isLiked ? 'ADDED TO WISHLIST' : 'ADD TO WISHLIST'}</span>
            </button>
          </div>

          {/* The Karigar's Bespoke Consultation Card (Indian Touch) */}
          <div className="mb-6 p-6 rounded-3xl border border-brand-gold/15 bg-brand-cream/60 pattern-jaali relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2.5">
                <div className="w-8 h-8 rounded-full bg-brand-maroon/5 flex items-center justify-center border border-brand-maroon/10">
                  <LotusIcon className="w-4.5 h-4.5 text-brand-maroon" />
                </div>
                <h4 className="text-[9px] tracking-[0.25em] uppercase font-bold text-brand-maroon font-sans">
                  The Karigar Custom Fitting
                </h4>
              </div>
              <h3 className="font-serif text-sm font-semibold text-brand-brown mb-1.5 leading-snug">
                Bespoke Fitting & Alterations
              </h3>
              <p className="text-[11px] text-brand-charcoal/80 font-light leading-relaxed mb-3.5">
                Each suit is cut individually. We offer complimentary adjustments to sleeves, necklines, and length. Choose your closest size, and our concierge team will reach out on WhatsApp to verify your exact dimensions.
              </p>
              <button 
                onClick={handleWhatsAppInquiry}
                className="inline-flex items-center gap-2 text-[9px] tracking-widest uppercase font-extrabold text-brand-maroon hover:text-brand-wine border-b border-brand-maroon/20 hover:border-brand-maroon pb-0.5 transition-all cursor-pointer"
              >
                <span>Consult Concierge Designer</span>
                <ArrowRight size={10} />
              </button>
            </div>
          </div>

          {/* Specs / Care Accordion */}
          <div className="border-t border-brand-sand/20">
            <Accordion type="single" collapsible className="w-full font-sans">
              <AccordionItem value="fabric" className="border-b border-brand-sand/20">
                <AccordionTrigger className="font-serif text-xs uppercase tracking-wider py-4 hover:no-underline font-semibold text-brand-brown hover:text-brand-gold transition-colors flex justify-between items-center w-full">
                  <span>Craft & Embellishments</span>
                </AccordionTrigger>
                <AccordionContent className="text-xs text-brand-charcoal/80 leading-relaxed pb-4 font-light">
                  <p className="mb-2"><strong>Composition:</strong> {product.fabric}</p>
                  <p className="mb-2"><strong>Artisanal Detail:</strong> Woven on traditional handlooms utilizing genuine threads, intricate borders, and local embroidery patterns.</p>
                  <p><strong>Care Instructions:</strong> {product.careInstructions}</p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="fit" className="border-b border-brand-sand/20">
                <AccordionTrigger className="font-serif text-xs uppercase tracking-wider py-4 hover:no-underline font-semibold text-brand-brown hover:text-brand-gold transition-colors flex justify-between items-center w-full">
                  <span>Silhouette & Styling</span>
                </AccordionTrigger>
                <AccordionContent className="text-xs text-brand-charcoal/80 leading-relaxed pb-4 font-light">
                  <p className="mb-2"><strong>Profile:</strong> {product.fit}</p>
                  <p><strong>Styling Tip:</strong> Pair with raw-silk flats, subtle brass jewelry, and let the sheer dupatta carry the drape for classic celebratory elegance.</p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="delivery" className="border-b border-brand-sand/20">
                <AccordionTrigger className="font-serif text-xs uppercase tracking-wider py-4 hover:no-underline font-semibold text-brand-brown hover:text-brand-gold transition-colors flex justify-between items-center w-full">
                  <span>Concierge Delivery & Returns</span>
                </AccordionTrigger>
                <AccordionContent className="text-xs text-brand-charcoal/80 leading-relaxed pb-4 font-light">
                  <p className="mb-2">We offer complimentary express delivery across India and globally. Made-to-measure orders require 15–20 business days of design and tailoring time prior to shipment.</p>
                  <p>Exchange ready-to-wear items within 7 days. Standard sizes can be returned, but custom/bespoke altered pieces are final sale, backed by free alterations.</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

        </div>
      </div>

      {/* 2. Editorial Craftsmanship Banner (Indian Touch) */}
      <section className="max-w-7xl mx-auto px-6 mb-24 mt-12 w-full">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center bg-brand-maroon text-brand-cream rounded-[2.5rem] overflow-hidden p-8 md:p-12 relative shadow-xl shadow-brand-maroon/5 pattern-jaali">
          {/* Light glow effects */}
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-brand-gold/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-white/5 blur-3xl pointer-events-none" />
          
          {/* Left Block: Narrative */}
          <div className="md:col-span-7 flex flex-col justify-center relative z-10">
            <span className="text-[10px] tracking-[0.3em] uppercase text-brand-gold font-bold mb-3 block">
              HERITAGE CRAFT
            </span>
            <h3 className="font-serif text-3xl md:text-5xl font-light leading-[1.1] mb-6 tracking-tight">
              Sustaining the Craft <br className="hidden md:block"/>of Indian <span className="font-serif italic text-brand-gold">Karigars</span>
            </h3>
            <p className="text-brand-cream/80 font-light text-xs md:text-sm leading-relaxed mb-8 max-w-xl">
              Every drape, pleat, and embroidery detail is hand-guided by master artisans who preserve century-old textiles heritage. We partner directly with weaver guilds in Banaras, Lucknow, and Chanderi—bypassing middlemen to ensure fair wages and keep historical Indian loom arts alive.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-brand-gold hover:bg-brand-gold/90 text-brand-brown px-7 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest inline-flex items-center gap-2.5 transition-all duration-300 shadow-md"
              >
                <span>Consult Weaver Guild</span>
                <ArrowRight size={12} />
              </a>
            </div>
          </div>

          {/* Right Block: Motif Decoration */}
          <div className="md:col-span-5 flex items-center justify-center relative z-10 p-4">
            <div className="w-56 h-56 rounded-full border border-brand-gold/25 flex items-center justify-center relative bg-brand-burgundy/40 backdrop-blur-sm">
              <div className="absolute inset-2 border border-dashed border-brand-gold/15 rounded-full" />
              <div className="absolute inset-4 border border-brand-gold/5 rounded-full" />
              <LotusIcon className="w-20 h-20 text-brand-gold opacity-90 stroke-[1.2]" />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Similar Products Section */}
      <div className="border-t border-brand-sand/20 bg-brand-cream/10 py-20">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
            <div>
              <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-brand-gold block mb-2">Curated Recommendation</span>
              <h2 className="font-serif text-3xl md:text-4xl font-light text-brand-brown leading-tight">Similar Outfits</h2>
            </div>
            <p className="text-xs text-zinc-400 font-light max-w-sm">
              Explore other custom-couture designs matching similar premium fabric weights, silhouettes, and occasions.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse flex flex-col gap-3">
                  <div className="aspect-[3/4] w-full bg-brand-cream/40 rounded-2xl border border-brand-sand/30" />
                  <div className="h-4 bg-brand-cream/50 rounded-md w-2/3" />
                  <div className="h-4 bg-brand-cream/50 rounded-md w-1/3" />
                </div>
              ))}
            </div>
          ) : similarProducts.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {similarProducts.map((simProduct) => (
                <ProductCard key={simProduct.id} product={simProduct} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-400 font-light">No similar products found.</p>
          )}
        </div>
      </div>

      </div>

      {/* Size Guide Modal Overlay */}
      {showSizeGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-charcoal/40 backdrop-blur-sm p-4">
          <div 
            ref={sizeGuideModalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="sizeguide-title"
            className="bg-brand-ivory border border-brand-sand rounded-3xl max-w-lg w-full p-6 md:p-8 relative shadow-2xl animate-scale-up pattern-jaali text-brand-brown"
          >
            {/* Close button */}
            <button 
              ref={sizeGuideCloseBtnRef}
              onClick={() => setShowSizeGuide(false)}
              className="absolute top-4 right-4 text-brand-charcoal hover:text-brand-maroon transition-colors p-2 cursor-pointer"
              aria-label="Close size guide"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <LotusIcon className="w-8 h-8 text-brand-gold mx-auto mb-2" />
              <h3 id="sizeguide-title" className="font-serif text-xl text-brand-brown tracking-wide font-medium">Bespoke Size Guide</h3>
              <p className="text-[9px] text-zinc-400 font-sans tracking-widest uppercase mt-1">Atelier Dimensions</p>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-brand-sand/30 rounded-2xl bg-white mb-6">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-brand-sand/30 bg-brand-cream/30 text-brand-brown font-semibold uppercase tracking-wider text-[9px]">
                    <th className="p-3">Size</th>
                    <th className="p-3">Chest (in)</th>
                    <th className="p-3">Waist (in)</th>
                    <th className="p-3">Hips (in)</th>
                    <th className="p-3">Shoulder (in)</th>
                  </tr>
                </thead>
                <tbody className="text-brand-charcoal font-light">
                  <tr className="border-b border-brand-sand/20">
                    <td className="p-3 font-semibold">XS</td>
                    <td className="p-3">32"</td>
                    <td className="p-3">26"</td>
                    <td className="p-3">35"</td>
                    <td className="p-3">13.5"</td>
                  </tr>
                  <tr className="border-b border-brand-sand/20 bg-brand-cream/10">
                    <td className="p-3 font-semibold">S</td>
                    <td className="p-3">34"</td>
                    <td className="p-3">28"</td>
                    <td className="p-3">37"</td>
                    <td className="p-3">14.0"</td>
                  </tr>
                  <tr className="border-b border-brand-sand/20">
                    <td className="p-3 font-semibold">M</td>
                    <td className="p-3">36"</td>
                    <td className="p-3">30"</td>
                    <td className="p-3">39"</td>
                    <td className="p-3">14.5"</td>
                  </tr>
                  <tr className="border-b border-brand-sand/20 bg-brand-cream/10">
                    <td className="p-3 font-semibold">L</td>
                    <td className="p-3">38"</td>
                    <td className="p-3">32"</td>
                    <td className="p-3">41"</td>
                    <td className="p-3">15.0"</td>
                  </tr>
                  <tr className="border-b border-brand-sand/20">
                    <td className="p-3 font-semibold">XL</td>
                    <td className="p-3">40"</td>
                    <td className="p-3">34"</td>
                    <td className="p-3">43"</td>
                    <td className="p-3">15.5"</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Custom fit callout */}
            <div className="p-4 rounded-xl border border-brand-gold/20 bg-brand-cream/40 text-[11px] leading-relaxed text-brand-charcoal text-center font-light">
              <span className="font-semibold text-brand-maroon uppercase tracking-wider block mb-1">✦ Custom Sizing is Complimentary ✦</span>
              If your measurements fall between standard sizes or you prefer custom kurta/sleeve lengths, select your closest size. Our concierge will contact you on WhatsApp/Email to confirm your profile before tailoring begins.
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
