'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { type Product } from '@repo/products';
import { formatPrice, cn, generateWhatsAppMessage, generateInstagramMessage, WHATSAPP_NUMBER, INSTAGRAM_HANDLE } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import gsap from 'gsap';
import { toast } from 'sonner';
import { Heart, Truck, RotateCcw, ShieldCheck, MessageCircle, Instagram } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { api } from '@/lib/trpc/client/react';
import { ProductCard } from '@/components/products/ProductCard';

export function ProductClient({ product }: { product: Product }) {
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>(product.variants[0]?.color || '');
  const [activeImage, setActiveImage] = useState(0);
  
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
      { y: 15, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: 'power2.out' }
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
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-6 pt-36 pb-20 w-full flex flex-col lg:flex-row items-start gap-12 lg:gap-16 relative">
        
        {/* Left: Image Gallery & Thumbnails */}
        <div className="w-full lg:w-3/5 flex flex-col-reverse md:flex-row gap-4 product-animate relative z-10">
          
          {/* Thumbnails */}
          <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto hide-scrollbar md:w-20 shrink-0 select-none pb-2 md:pb-0">
            {product.images.map((img, idx) => (
              <button 
                key={idx} 
                onClick={() => setActiveImage(idx)}
                className={cn(
                  "relative aspect-[3/4] w-16 md:w-full shrink-0 border-2 rounded-xl overflow-hidden transition-all duration-300",
                  activeImage === idx 
                    ? 'border-[#FF5E36] scale-102 shadow-sm' 
                    : 'border-zinc-200 opacity-60 hover:opacity-100'
                )}
              >
                <Image src={img} alt={`Thumbnail ${idx}`} fill className="object-cover" />
              </button>
            ))}
          </div>

          {/* Large Main Image with Interactive Magnifier Zoom */}
          <div 
            className="relative aspect-[3/4] w-full flex-1 bg-zinc-50 border border-zinc-100 rounded-2xl overflow-hidden shadow-sm cursor-zoom-in"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <Image 
              src={product.images[activeImage]} 
              alt={product.name} 
              fill 
              priority
              className="object-cover transition-transform duration-100 ease-out origin-[var(--zoom-x)_var(--zoom-y)]"
              style={{
                transform: isHovering ? 'scale(2)' : 'scale(1)',
                '--zoom-x': `${zoomPos.x}%`,
                '--zoom-y': `${zoomPos.y}%`,
              } as any}
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            {/* Visual zoom indicator */}
            {!isHovering && (
              <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white text-[9px] tracking-widest uppercase font-semibold py-1.5 px-3 rounded-full pointer-events-none opacity-0 md:opacity-100">
                Hover to Zoom
              </div>
            )}
          </div>
        </div>

        {/* Right: Product Details Form */}
        <div className="w-full lg:w-2/5 flex flex-col pt-2 product-animate relative z-10 text-zinc-800">
          
          {/* Breadcrumb / Category */}
          <div className="mb-2.5 text-[10px] tracking-[0.2em] uppercase text-[#FF5E36] font-bold">
            {product.category}
          </div>
          
          {/* Product Name */}
          <h1 className="font-serif text-3xl md:text-4xl lg:text-[2.6rem] font-bold mb-3 text-zinc-950 tracking-tight leading-[1.15]">
            {product.name}
          </h1>



          {/* Price */}
          <div className="text-2xl font-serif font-bold text-[#FF5E36] mb-8">
            {formatPrice(product.price)}
          </div>
          
          {/* Description */}
          <p className="text-zinc-600 text-xs md:text-sm leading-relaxed mb-8 font-light">
            {product.description}
          </p>

          {/* Color Selection */}
          <div className="mb-6 border-t border-zinc-100 pt-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs tracking-wider uppercase text-zinc-500 font-bold">
                Shade: <span className="text-zinc-950">{selectedColor}</span>
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
                    "px-4 py-2 border rounded-full text-[11px] tracking-wider uppercase font-semibold transition-all duration-300",
                    selectedColor === color 
                      ? 'border-[#FF5E36] bg-[#FF5E36] text-white shadow-sm' 
                      : 'border-zinc-200 text-zinc-700 hover:border-zinc-400 bg-white'
                  )}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Size Selection */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs tracking-wider uppercase text-zinc-500 font-bold">Select Size</span>
              <button className="text-[10px] tracking-widest uppercase underline underline-offset-4 text-[#FF5E36] hover:text-[#E04D27] font-bold transition-colors">
                Size Guide
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
                      "w-11 h-11 border rounded-xl flex items-center justify-center text-xs transition-all duration-300 font-bold",
                      selectedSize === size 
                        ? 'border-zinc-950 bg-[#1F1A1B] text-white' 
                        : isAvailable 
                          ? 'border-zinc-200 text-zinc-700 hover:border-zinc-400 bg-white' 
                          : 'opacity-20 cursor-not-allowed border-zinc-100 bg-zinc-50 line-through text-zinc-400'
                    )}
                  >
                    {size}
                  </button>
                );
              })}
            </div>

            {/* Selected size Stock indicator */}
            {selectedSize && (
              <div className="mt-3 text-[10px] uppercase font-bold tracking-wider">
                {isSelectedOutOfStock ? (
                  <span className="text-red-500">Out of Stock</span>
                ) : currentStock <= 3 ? (
                  <span className="text-[#FF5E36]">Only {currentStock} left in stock!</span>
                ) : (
                  <span className="text-emerald-500">In Stock</span>
                )}
              </div>
            )}
          </div>

          {/* Actions Area */}
          <div className="flex flex-col gap-4 mb-8">
            <div className="flex flex-col sm:flex-row gap-4 items-stretch">
              {/* WhatsApp Inquiry Button */}
              <button 
                onClick={handleWhatsAppInquiry}
                className="flex-1 bg-[#25D366] hover:bg-[#20ba5a] text-white py-3.5 px-6 rounded-full flex items-center justify-center gap-2.5 text-xs tracking-widest uppercase font-bold transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer"
              >
                <MessageCircle size={14} className="fill-white/10" />
                <span>INQUIRE ON WHATSAPP</span>
              </button>

              {/* Instagram Inquiry Button */}
              <button 
                onClick={handleInstagramInquiry}
                className="flex-1 bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] hover:opacity-95 text-white py-3.5 px-6 rounded-full flex items-center justify-center gap-2.5 text-xs tracking-widest uppercase font-bold transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer"
              >
                <Instagram size={14} />
                <span>DM ON INSTAGRAM</span>
              </button>
            </div>

            {/* Wishlist Button */}
            <button 
              onClick={() => toggleWishlist(product.id)}
              className={cn(
                "w-full border py-3.5 rounded-full flex items-center justify-center gap-2.5 text-xs tracking-widest uppercase font-bold transition-all duration-300 hover:scale-102 cursor-pointer",
                isLiked 
                  ? "border-[#FF5E36] bg-[#FF5E36]/5 text-[#FF5E36]" 
                  : "border-zinc-200 text-zinc-600 hover:border-zinc-400 hover:text-[#FF5E36]"
              )}
            >
              <Heart size={14} className={cn(isLiked && "fill-[#FF5E36]")} />
              <span>{isLiked ? 'ADDED TO WISHLIST' : 'ADD TO WISHLIST'}</span>
            </button>
          </div>

          {/* Quick trust highlights */}
          <div className="grid grid-cols-3 gap-3 border-t border-b border-zinc-100 py-6 mb-8 text-center bg-zinc-50/50 rounded-2xl px-2">
            <div className="flex flex-col items-center">
              <Truck size={16} className="text-[#FF5E36] mb-1.5" />
              <span className="text-[9px] uppercase tracking-wider font-bold text-zinc-700">Free Express</span>
              <span className="text-[8px] text-zinc-400">Shipping</span>
            </div>
            <div className="flex flex-col items-center border-x border-zinc-200/80">
              <RotateCcw size={16} className="text-[#FF5E36] mb-1.5" />
              <span className="text-[9px] uppercase tracking-wider font-bold text-zinc-700">7-Day Easy</span>
              <span className="text-[8px] text-zinc-400">Exchanges</span>
            </div>
            <div className="flex flex-col items-center">
              <ShieldCheck size={16} className="text-[#FF5E36] mb-1.5" />
              <span className="text-[9px] uppercase tracking-wider font-bold text-zinc-700">100% Authentic</span>
              <span className="text-[8px] text-zinc-400">Handcraft</span>
            </div>
          </div>

          {/* Specs Accordions */}
          <div className="border-t border-zinc-100">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="fabric" className="border-b border-zinc-100">
                <AccordionTrigger className="font-serif text-base py-4 hover:no-underline font-semibold text-zinc-800 hover:text-[#FF5E36] transition-colors">
                  Fabric & Embellishment
                </AccordionTrigger>
                <AccordionContent className="text-xs text-zinc-500 leading-relaxed pb-4 font-light">
                  <p className="mb-2"><strong>Composition:</strong> {product.fabric}</p>
                  <p><strong>Care Instructions:</strong> {product.careInstructions}</p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="fit" className="border-b border-zinc-100">
                <AccordionTrigger className="font-serif text-base py-4 hover:no-underline font-semibold text-zinc-800 hover:text-[#FF5E36] transition-colors">
                  Silhouette & Details
                </AccordionTrigger>
                <AccordionContent className="text-xs text-zinc-500 leading-relaxed pb-4 font-light">
                  <p>{product.fit}</p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="delivery" className="border-b border-zinc-100">
                <AccordionTrigger className="font-serif text-base py-4 hover:no-underline font-semibold text-zinc-800 hover:text-[#FF5E36] transition-colors">
                  Shipping & Returns policy
                </AccordionTrigger>
                <AccordionContent className="text-xs text-zinc-500 leading-relaxed pb-4 font-light">
                  <p className="mb-2">We offer complimentary express shipping across India. Custom-made outfits are ready for shipment in 2-3 weeks, while standard products dispatch in 2-3 business days.</p>
                  <p>Standard orders can be exchanged within 7 days. Customized outfits are tailored specifically to your dimensions and cannot be returned.</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

        </div>
      </div>

      {/* Similar Products Section */}
      <div className="border-t border-zinc-100 bg-zinc-50/20 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
            <div>
              <span className="text-xs tracking-[0.2em] uppercase font-bold text-[#FF5E36] block mb-2">Recommendation</span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-zinc-900 leading-tight">Similar Outfits</h2>
            </div>
            <p className="text-xs text-zinc-400 font-light max-w-sm">
              Explore other custom-couture designs matching similar premium fabric weights, silhouettes, and occasions.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse flex flex-col gap-3">
                  <div className="aspect-[3/4] w-full bg-zinc-100 rounded-2xl" />
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
            <p className="text-sm text-zinc-500 font-light">No similar products found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
