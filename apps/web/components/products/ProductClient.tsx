'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatPrice, cn, generateWhatsAppMessage, generateInstagramMessage, WHATSAPP_NUMBER, INSTAGRAM_HANDLE } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { toast } from 'sonner';
import { Heart, MessageCircle, Instagram, ZoomIn, ArrowRight, ArrowLeft } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { api } from '@/lib/trpc/client/react';
import { ProductCard } from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';
import { HeritageCraftBanner } from '@/components/products/HeritageCraftBanner';
import { FormattedRichText } from '@/components/ui/FormattedRichText';
import { useAnalytics } from '@/hooks/useAnalytics';
import type { Product } from '@repo/products';

// Beautiful luxury Indian lotus icon motif
const LotusIcon = ({ className = "w-6 h-6 text-[#FF5E36]" }) => (
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

// Helper for premium color swatches background rendering
const getColorHex = (colorName: string) => {
  const name = colorName.toLowerCase();
  if (name.includes('ivory')) return '#FDFBF7';
  if (name.includes('velvet') || name.includes('crimson')) return '#9E1B32';
  if (name.includes('emerald') || name.includes('green')) return '#0B6623';
  if (name.includes('blue') || name.includes('indigo')) return '#0041C2';
  if (name.includes('gold') || name.includes('mustard')) return '#E5A93B';
  if (name.includes('black')) return '#18181B';
  if (name.includes('rose') || name.includes('pink')) return '#FFC0CB';
  return '#E4E4E7'; // light zinc fallback
};

export function ProductClient({ product }: { product: Product }) {
  const variants = product.variants || [];
  const images: string[] = product.images || [];
  const [selectedColor, setSelectedColor] = useState<string>(variants[0]?.color || '');
  const [activeImage, setActiveImage] = useState(0);

  // Magnifier State
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isHovering, setIsHovering] = useState(false);

  const { isInWishlist, toggleWishlist } = useWishlist();
  const isLiked = isInWishlist(product.id);

  const sellingPrice = product.sellingPrice ?? product.discountPrice ?? product.price;
  const mrp = product.mrp ?? (product.discountPrice ? product.price : undefined);
  const hasDiscount = Boolean(mrp && mrp > sellingPrice);
  const discountPercent = hasDiscount ? Math.round(((mrp! - sellingPrice) / mrp!) * 100) : 0;
  const savedAmount = hasDiscount ? mrp! - sellingPrice : 0;

  // Fetch live product status from API route: api.products.getStatus
  const { data: liveStatus } = api.products.getStatus.useQuery(
    { slug: product.slug },
    { enabled: !!product?.slug }
  );

  // Fetch and filter similar products using paginated category batch
  const { data: categoryBatch, isLoading: loading } = api.products.getPaginated.useQuery({
    category: product.category,
    limit: 8,
  });
  const products = (categoryBatch?.items || []) as Product[];

  const similarProductsByTag = (products || [])
    .filter((p: Product) => p.id !== product.id)
    .map((p: Product) => {
      const currentTags = product.tags || [];
      const compareTags = p.tags || [];
      const matchCount = currentTags.filter((t: string) => compareTags.includes(t)).length;
      return { product: p, matchCount };
    })
    .filter((item) => item.matchCount > 0)
    .sort((a, b) => b.matchCount - a.matchCount)
    .map((item) => item.product);

  const fallbackCategoryProducts = (products || [])
    .filter((p: Product) => p.id !== product.id && p.category === product.category && !similarProductsByTag.some((sp) => sp.id === p.id));

  const fallbackAllProducts = (products || [])
    .filter((p: Product) => p.id !== product.id && !similarProductsByTag.some((sp) => sp.id === p.id) && !fallbackCategoryProducts.some((f) => f.id === p.id));

  const similarProducts = [...similarProductsByTag, ...fallbackCategoryProducts, ...fallbackAllProducts].slice(0, 4);

  // Extract unique colors
  const colors = Array.from(new Set(variants.map((v) => v.color).filter(Boolean))) as string[];

  const { trackEvent } = useAnalytics();
  const hasTrackedView = useRef(false);

  // Track product view exactly once on page mount
  useEffect(() => {
    if (!hasTrackedView.current && (product?.id || product?.slug)) {
      hasTrackedView.current = true;
      trackEvent({
        type: 'view',
        productId: product.id,
        slug: product.slug,
      });
    }
  }, [product?.id, product?.slug, trackEvent]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    // Clamp coordinates to keep the 25% lens selector box fully within the image bounds (12.5% padding from edges)
    const clampedX = Math.max(12.5, Math.min(87.5, x));
    const clampedY = Math.max(12.5, Math.min(87.5, y));

    setZoomPos({ x: clampedX, y: clampedY });
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  const handleWhatsAppInquiry = () => {
    trackEvent({
      type: 'whatsapp',
      productId: product.id,
      slug: product.slug,
    });
    const message = generateWhatsAppMessage(product, selectedColor, window.location.href);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
  };

  const handleInstagramInquiry = () => {
    trackEvent({
      type: 'instagram',
      productId: product.id,
      slug: product.slug,
    });
    const message = generateInstagramMessage(product, selectedColor, window.location.href);
    navigator.clipboard.writeText(message);
    toast.success("Product details copied to clipboard!");
    setTimeout(() => {
      window.open(`https://instagram.com/${INSTAGRAM_HANDLE}`, '_blank');
    }, 1000);
  };

  // Get current stock count for selected shade
  const selectedVariant = variants.find((v: any) => v.color === selectedColor) || variants[0];
  const currentStock = selectedVariant ? selectedVariant.stock : 0;
  const isSelectedOutOfStock = currentStock === 0 || liveStatus?.inStock === false;

  return (
    <div className="bg-white min-h-screen text-zinc-800">
      <div>

        {/* 1. Breadcrumbs / Navigation Back Row */}
        <div className="max-w-7xl mx-auto px-6 pt-32 md:pt-36 w-full flex items-center justify-between border-b border-zinc-100 pb-4">
          <Link
            href="/shop"
            className="group inline-flex items-center gap-2 text-[10px] tracking-widest uppercase font-bold text-[#FF5E36] hover:text-[#E04D27] transition-colors"
          >
            <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to Catalog</span>
          </Link>
          <div className="hidden sm:flex items-center gap-1.5 text-[9px] tracking-[0.25em] uppercase text-zinc-400 font-semibold select-none">
            <span>Home</span>
            <span>•</span>
            <span>Shop</span>
            <span>•</span>
            <span className="text-[#FF5E36] font-bold">{product.category || 'Collection'}</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-8 pb-20 w-full flex flex-col lg:flex-row items-start gap-12 lg:gap-16 relative">

          {/* Left Column: Asymmetrical Editorial Image Gallery */}
          <div className="w-full lg:w-3/5 flex flex-col-reverse md:flex-row gap-6 product-animate relative z-20">

            {/* Thumbnails list */}
            <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto hide-scrollbar md:w-20 shrink-0 select-none pb-2 md:pb-0">
              {images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={cn(
                    "relative aspect-[3/4] w-16 md:w-full shrink-0 border-2 rounded-xl overflow-hidden transition-all duration-300",
                    activeImage === idx
                      ? 'border-[#FF5E36] scale-102 shadow-md shadow-[#FF5E36]/5 bg-white'
                      : 'border-zinc-200 opacity-60 hover:opacity-100 hover:border-zinc-400 bg-zinc-50'
                  )}
                  aria-label={`View product image ${idx + 1}`}
                >
                  <Image src={img} alt={`${product.name} Thumbnail ${idx + 1}`} fill className="object-cover" sizes="80px" />
                </button>
              ))}
            </div>

            {/* Main Visual Display (with Zoom capability) */}
            <div className="relative flex-1 aspect-[3/4] select-none">
              <div
                className="relative aspect-[3/4] w-full bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-lg cursor-crosshair group"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                {/* Luxury gold frame border accent */}
                <div className="absolute inset-3.5 border border-zinc-200/40 rounded-2xl pointer-events-none z-20" />

                <Image
                  src={images[activeImage] || images[0] || '/placeholder.jpg'}
                  alt={product.name || 'Product'}
                  fill
                  priority
                  className={cn("object-cover transition-transform duration-100 ease-out z-10", isHovering ? "scale-150 lg:scale-100" : "scale-100")}
                  style={{
                    transformOrigin: isHovering ? `${zoomPos.x}% ${zoomPos.y}%` : 'center center'
                  }}
                  sizes="(max-width: 1024px) 100vw, 60vw"
                />

                {/* Magnifier glass selector square */}
                {isHovering && (
                  <div
                    className="absolute w-[25%] h-[25%] bg-[#FF5E36]/5 border border-[#FF5E36]/20 pointer-events-none z-30 rounded-2xl hidden lg:block"
                    style={{
                      left: `calc(${zoomPos.x}% - 12.5%)`,
                      top: `calc(${zoomPos.y}% - 12.5%)`,
                    }}
                  />
                )}

                {/* Status Badges */}
                <div className="absolute top-6 left-6 z-20 flex flex-col gap-2">
                  {product.newArrival && (
                    <span className="text-[8px] tracking-[0.25em] uppercase text-white font-bold bg-[#FF5E36] px-3.5 py-1.5 rounded-full shadow-md">
                      New Arrival
                    </span>
                  )}
                  {product.bestseller && (
                    <span className="text-[8px] tracking-[0.25em] uppercase text-white font-bold bg-zinc-900 px-3.5 py-1.5 rounded-full shadow-md border border-white/10">
                      Bestseller
                    </span>
                  )}
                </div>

                {/* Interactive tap zoom label for desktops */}
                <div className="absolute bottom-6 right-6 bg-zinc-900/80 backdrop-blur-sm text-white text-[8px] tracking-[0.2em] uppercase font-bold py-1.5 px-3.5 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                  Hover to Zoom
                </div>
              </div>

              {/* Side Zoom preview box for larger viewports */}
              {isHovering && (
                <div className="absolute top-0 left-[calc(100%+32px)] w-[68%] h-[68%] bg-white border border-zinc-200 rounded-3xl overflow-hidden z-50 pointer-events-none hidden lg:block shadow-2xl animate-scale-up">
                  <div className="absolute inset-3.5 border border-zinc-200/40 rounded-2xl pointer-events-none z-20" />
                  <Image
                    src={images[activeImage] || images[0] || '/placeholder.jpg'}
                    alt={`${product.name || 'Product'} Zoom View`}
                    fill
                    className="object-cover pointer-events-none"
                    style={{
                      transform: 'scale(4)',
                      transformOrigin: `${((zoomPos.x - 12.5) / 75) * 100}% ${((zoomPos.y - 12.5) / 75) * 100}%`
                    }}
                    sizes="(max-width: 1024px) 100vw, 60vw"
                  />
                  <div className="absolute bottom-6 left-6 bg-zinc-900/80 backdrop-blur-sm text-white text-[8px] tracking-[0.2em] uppercase font-bold py-1.5 px-3.5 rounded-full z-20 flex items-center gap-1.5 border border-white/5">
                    <ZoomIn size={8} className="text-[#FF5E36] animate-pulse" />
                    Fabric Magnifier
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Tailored Description & Custom Sizing Panel */}
          <div className="w-full lg:w-2/5 flex flex-col product-animate relative z-10">

            <span className="text-[10px] tracking-[0.3em] uppercase text-zinc-400 font-bold block mb-2 font-sans">
              JB51 Collection
            </span>

            {/* Product Title */}
            <h1 className="font-serif text-3xl md:text-4xl lg:text-[2.6rem] font-light text-zinc-900 tracking-tight leading-[1.1] mb-3">
              {product.name}
            </h1>

            {/* Subtitle / Attributes Row */}
            <div className="flex flex-wrap items-center gap-2.5 mb-4">
              <span className="text-[9px] tracking-wider uppercase font-bold text-[#FF5E36] bg-[#FF5E36]/5 px-2.5 py-1 rounded-full border border-[#FF5E36]/10">
                • Handloom Heritage
              </span>
              <span className="text-[9px] tracking-wider uppercase font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                • Artisanal Weave
              </span>
            </div>

            {/* Pricing Block */}
            <div className="flex items-baseline gap-3 mt-1 mb-5 flex-wrap">
              {hasDiscount ? (
                <div className="flex items-baseline gap-2.5 flex-wrap">
                  <span className="text-3xl font-serif text-zinc-900 font-light">{formatPrice(sellingPrice)}</span>
                  <span className="text-base line-through text-zinc-400 font-light">{formatPrice(mrp!)}</span>
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                    Save {discountPercent}% (₹{savedAmount.toLocaleString('en-IN')})
                  </span>
                </div>
              ) : (
                <span className="text-3xl font-serif text-zinc-900 font-light">{formatPrice(sellingPrice)}</span>
              )}
              <span className="text-[9px] text-zinc-400 tracking-wider uppercase block font-medium font-sans">
                (Includes Complimentary Sizing & Taxes)
              </span>
            </div>

            {/* Luxury Editorial Divider */}
            <div className="editorial-divider my-2" />

            {/* Description */}
            <div className="text-zinc-600 text-xs md:text-sm leading-relaxed mb-6 font-light">
              <FormattedRichText text={product.description} />
            </div>

            {/* Color Selection Pill Swatches - Redesigned as luxurious color swatches */}
            <div className="mb-5 border-t border-zinc-100 pt-5">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] tracking-wider uppercase text-zinc-400 font-bold">
                  Shade: <span className="text-zinc-800 font-extrabold">{selectedColor}</span>
                </span>
              </div>
              <div className="flex flex-wrap gap-3">
                {colors.map(color => {
                  const isSelected = selectedColor === color;
                  const hex = getColorHex(color);
                  return (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className="group relative flex items-center justify-center cursor-pointer select-none"
                      title={color}
                    >
                      {/* Ring wrapper */}
                      <span className={cn(
                        "w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-300",
                        isSelected ? "border-zinc-900 scale-105" : "border-zinc-200 group-hover:border-zinc-400"
                      )}>
                        {/* Swatch circle */}
                        <span
                          className="w-5.5 h-5.5 rounded-full border border-zinc-200/50 shadow-inner"
                          style={{ backgroundColor: hex }}
                        />
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Selected Shade Stock indicator */}
              <div className="mt-3 text-[9px] uppercase font-bold tracking-wider">
                {isSelectedOutOfStock ? (
                  <span className="text-[#FF5E36]">Out of Stock - Custom Order Available</span>
                ) : currentStock <= 3 ? (
                  <span className="text-rose-600">Only {currentStock} bespoke tailoring slots left!</span>
                ) : (
                  <span className="text-emerald-600">Tailoring slots open ({currentStock} available)</span>
                )}
              </div>
            </div>

            {/* Actions & Concierge Inquiry Buttons - Redesigned side-by-side grid to prevent stretching and overflow */}
            <div className="flex flex-col gap-3 mb-6">
              <div className="grid grid-cols-2 gap-3">
                {/* WhatsApp Inquiry Button */}
                <Button
                  onClick={handleWhatsAppInquiry}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-md shadow-emerald-600/10 text-[10px] tracking-widest h-12 px-2"
                >
                  <MessageCircle size={14} className="fill-white/10 mr-1.5 shrink-0" />
                  <span className="truncate">WhatsApp</span>
                </Button>

                {/* Instagram Inquiry Button */}
                <Button
                  onClick={handleInstagramInquiry}
                  className="bg-zinc-950 hover:bg-zinc-900 text-white rounded-full shadow-md shadow-zinc-950/10 text-[10px] tracking-widest h-12 px-2"
                >
                  <Instagram size={14} className="mr-1.5 shrink-0" />
                  <span className="truncate">Instagram</span>
                </Button>
              </div>

              {/* Wishlist Button */}
              <Button
                onClick={() => toggleWishlist(product.id)}
                className={cn(
                  "w-full rounded-full border hover:scale-[1.01] h-12 text-[10px] tracking-widest",
                  isLiked
                    ? "border-[#FF5E36] bg-[#FF5E36]/5 text-[#FF5E36] hover:bg-[#FF5E36]/10"
                    : "border-zinc-200 text-zinc-800 hover:border-zinc-800 bg-white"
                )}
              >
                <Heart size={14} className={cn("mr-1.5 shrink-0", isLiked && "fill-[#FF5E36] text-[#FF5E36]")} />
                <span>{isLiked ? 'Added to Wishlist' : 'Add to Wishlist'}</span>
              </Button>
            </div>

            {/* The Karigar's Bespoke Consultation Card (Indian Touch) */}
            <div className="mb-6 p-6 rounded-3xl border border-zinc-200 bg-zinc-50/50 pattern-jaali relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF5E36]/5 rounded-full blur-2xl pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#FF5E36]/5 flex items-center justify-center border border-[#FF5E36]/10">
                    <LotusIcon className="w-4.5 h-4.5 text-[#FF5E36]" />
                  </div>
                  <span className="text-[9px] tracking-[0.25em] uppercase font-bold text-[#FF5E36] font-sans">
                    The Karigar Custom Fitting
                  </span>
                </div>
                <h2 className="font-serif text-sm font-semibold text-zinc-900 mb-1.5 leading-snug">
                  Bespoke Fitting & Alterations
                </h2>
                <p className="text-[11px] text-zinc-650 leading-relaxed mb-3.5 font-light">
                  Each suit is cut individually. We offer complimentary adjustments to sleeves, necklines, and length. Choose your preferred shade, and our concierge team will reach out on WhatsApp to verify your exact dimensions.
                </p>
                <button
                  onClick={handleWhatsAppInquiry}
                  className="inline-flex items-center gap-2 text-[9px] tracking-widest uppercase font-extrabold text-[#FF5E36] hover:text-[#E04D27] border-b border-[#FF5E36]/20 hover:border-[#FF5E36] pb-0.5 transition-all cursor-pointer font-sans"
                >
                  <span>Consult Concierge Designer</span>
                  <ArrowRight size={10} />
                </button>
              </div>
            </div>

            {/* Specs / Care Accordion */}
            <div className="border-t border-zinc-200/50">
              <Accordion type="single" collapsible className="w-full font-sans">
                <AccordionItem value="fabric" className="border-b border-zinc-200/50">
                  <AccordionTrigger className="font-serif text-xs uppercase tracking-wider py-4 hover:no-underline font-semibold text-zinc-900 hover:text-[#FF5E36] transition-colors flex justify-between items-center w-full">
                    <span>Craft & Embellishments</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-xs text-zinc-650 leading-relaxed pb-4 font-light">
                    <div className="mb-2"><strong>Composition:</strong> <FormattedRichText text={product.fabric} className="inline" /></div>
                    <p className="mb-2"><strong>Artisanal Detail:</strong> Woven on traditional handlooms utilizing genuine threads, intricate borders, and local embroidery patterns.</p>
                    <div><strong>Care Instructions:</strong> <FormattedRichText text={product.careInstructions} className="inline" /></div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="fit" className="border-b border-zinc-200/50">
                  <AccordionTrigger className="font-serif text-xs uppercase tracking-wider py-4 hover:no-underline font-semibold text-zinc-900 hover:text-[#FF5E36] transition-colors flex justify-between items-center w-full">
                    <span>Silhouette & Styling</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-xs text-zinc-650 leading-relaxed pb-4 font-light">
                    <div className="mb-2"><strong>Profile:</strong> <FormattedRichText text={product.fit} className="inline" /></div>
                    <p><strong>Styling Tip:</strong> Pair with raw-silk flats, subtle brass jewelry, and let the sheer dupatta carry the drape for classic celebratory elegance.</p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="delivery" className="border-b border-zinc-200/50">
                  <AccordionTrigger className="font-serif text-xs uppercase tracking-wider py-4 hover:no-underline font-semibold text-zinc-900 hover:text-[#FF5E36] transition-colors flex justify-between items-center w-full">
                    <span>Concierge Delivery & Returns</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-xs text-zinc-650 leading-relaxed pb-4 font-light">
                    <p className="mb-2">We offer complimentary express delivery across India and globally. Made-to-measure orders require 15–20 business days of design and tailoring time prior to shipment.</p>
                    <p>Exchange ready-to-wear items within 7 days. Standard sizes can be returned, but custom/bespoke altered pieces are final sale, backed by free alterations.</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

          </div>
        </div>

        {/* 2. Editorial Craftsmanship Banner */}
        <HeritageCraftBanner />

        {/* 3. Similar Products Section */}
        <div className="border-t border-zinc-200/50 bg-zinc-50/50 py-20">
          <div className="max-w-7xl mx-auto px-6">

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
              <div>
                <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-[#FF5E36] block mb-2">Curated Recommendation</span>
                <h2 className="font-serif text-3xl md:text-4xl font-light text-zinc-900 leading-tight">Similar Outfits</h2>
              </div>
              <p className="text-xs text-zinc-400 font-light max-w-sm">
                Explore other custom-couture designs matching similar premium fabric weights, silhouettes, and occasions.
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse flex flex-col gap-3">
                    <div className="aspect-[3/4] w-full bg-zinc-100 rounded-2xl border border-zinc-200/50" />
                    <div className="h-4 bg-zinc-100 rounded-md w-2/3" />
                    <div className="h-4 bg-zinc-100 rounded-md w-1/3" />
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
    </div>
  );
}
