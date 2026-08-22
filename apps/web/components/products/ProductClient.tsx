'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { type Product } from '@repo/products';
import { formatPrice, generateWhatsAppMessage, generateInstagramMessage, WHATSAPP_NUMBER, INSTAGRAM_HANDLE } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import gsap from 'gsap';
import { toast } from 'sonner';

export function ProductClient({ product }: { product: Product }) {
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>(product.variants[0]?.color || '');
  const [activeImage, setActiveImage] = useState(0);
  const [isWhatsAppLoading, setIsWhatsAppLoading] = useState(false);
  const [isInstagramLoading, setIsInstagramLoading] = useState(false);
  
  // Extract unique colors and sizes
  const colors = Array.from(new Set(product.variants.map(v => v.color)));
  const sizes = Array.from(new Set(product.variants.map(v => v.size)));

  useEffect(() => {
    gsap.fromTo('.product-animate',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power2.out' }
    );
  }, []);

  const handleWhatsApp = () => {
    if (!selectedSize) {
      toast.error("Please select a size first");
      return;
    }
    setIsWhatsAppLoading(true);
    setTimeout(() => {
      setIsWhatsAppLoading(false);
      const url = typeof window !== 'undefined' ? window.location.href : '';
      const message = generateWhatsAppMessage(product, selectedSize, selectedColor, url);
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
    }, 1000);
  };

  const handleInstagram = () => {
    if (!selectedSize) {
      toast.error("Please select a size first");
      return;
    }
    setIsInstagramLoading(true);
    setTimeout(() => {
      setIsInstagramLoading(false);
      const url = typeof window !== 'undefined' ? window.location.href : '';
      const message = generateInstagramMessage(product, selectedSize, selectedColor, url);
      navigator.clipboard.writeText(message);
      toast.success("Product details copied. Send this message to us on Instagram.");
      setTimeout(() => {
        window.open(`https://instagram.com/${INSTAGRAM_HANDLE}`, '_blank');
      }, 500);
    }, 1000);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-16 w-full flex flex-col lg:flex-row items-start gap-16 bg-brand-ivory relative text-brand-brown">
      {/* Editorial subtle pattern */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none paisley-bg" />

      {/* Image Gallery */}
      <div className="w-full lg:w-1/2 flex flex-col-reverse md:flex-row gap-4 product-animate relative z-10">
        <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-y-auto hide-scrollbar md:w-24 shrink-0">
          {product.images.map((img, idx) => (
            <button 
              key={idx} 
              onClick={() => setActiveImage(idx)}
              className={`relative aspect-[3/4] w-20 md:w-full shrink-0 border transition-all ${activeImage === idx ? 'border-brand-maroon scale-102' : 'border-brand-brass/20 opacity-60 hover:opacity-100'}`}
            >
              <Image src={img} alt={`Thumbnail ${idx}`} fill className="object-cover" />
            </button>
          ))}
        </div>
        <div className="relative aspect-[3/4] w-full flex-1 bg-brand-sand border border-brand-brass/10 overflow-hidden">
          <Image 
            src={product.images[activeImage]} 
            alt={product.name} 
            fill 
            className="object-cover"
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
      </div>

      {/* Product Details */}
      <div className="w-full lg:w-1/2 flex flex-col pt-4 product-animate pb-32 md:pb-0 relative z-10">
        <div className="mb-3 text-[10px] tracking-[0.25em] uppercase text-brand-saffron font-medium">
          {product.category}
        </div>
        <h1 className="font-serif text-3xl md:text-5xl mb-4 text-brand-maroon tracking-wide leading-tight">{product.name}</h1>
        <div className="text-xl font-serif text-brand-sienna mb-8 font-medium">{formatPrice(product.price)}</div>
        
        <p className="text-brand-brown/80 text-sm md:text-base leading-relaxed mb-10 font-light max-w-xl">
          {product.description}
        </p>

        {/* Color Selection */}
        <div className="mb-8 border-t border-brand-brass/10 pt-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs tracking-wider uppercase text-brand-brown/60 font-medium">Fabric Shade: <span className="text-brand-maroon font-semibold">{selectedColor}</span></span>
          </div>
          <div className="flex flex-wrap gap-3">
            {colors.map(color => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`px-5 py-2.5 border text-xs tracking-widest uppercase transition-all duration-300 ${selectedColor === color ? 'border-brand-maroon bg-brand-maroon text-brand-cream' : 'border-brand-brass/25 text-brand-brown hover:border-brand-maroon'}`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>

        {/* Size Selection */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs tracking-wider uppercase text-brand-brown/60 font-medium">Select Size</span>
            <button className="text-[10px] tracking-widest uppercase underline underline-offset-4 text-brand-terracotta hover:text-brand-maroon transition-colors">Size Guide</button>
          </div>
          <div className="flex flex-wrap gap-3">
            {sizes.map(size => {
              const isAvailable = product.variants.some(v => v.size === size && v.color === selectedColor && v.stock > 0);
              return (
                <button
                  key={size}
                  disabled={!isAvailable}
                  onClick={() => setSelectedSize(size)}
                  className={`w-12 h-12 border flex items-center justify-center text-xs transition-all duration-300 font-medium
                    ${selectedSize === size ? 'border-brand-maroon bg-brand-maroon text-brand-cream' : ''}
                    ${!isAvailable ? 'opacity-25 cursor-not-allowed border-brand-brass/15 line-through' : 'border-brand-brass/25 hover:border-brand-maroon text-brand-brown'}
                  `}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-4 mb-16 fixed bottom-0 left-0 right-0 p-4 bg-brand-ivory/95 backdrop-blur border-t border-brand-brass/20 z-40 md:static md:bg-transparent md:border-none md:p-0 md:mb-16">
          <button 
            disabled={isWhatsAppLoading}
            onClick={handleWhatsApp}
            className="w-full bg-[#128C7E] hover:bg-[#075E54] text-white py-4 flex items-center justify-center gap-3 text-xs tracking-[0.2em] uppercase transition-colors shadow-sm font-medium disabled:opacity-75"
          >
            {isWhatsAppLoading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "ORDER ON WHATSAPP"
            )}
          </button>
          <button 
            disabled={isInstagramLoading}
            onClick={handleInstagram}
            className="w-full border border-brand-maroon text-brand-maroon py-4 flex items-center justify-center gap-3 text-xs tracking-[0.2em] uppercase hover:bg-brand-maroon hover:text-brand-cream transition-all duration-300 font-medium disabled:opacity-75"
          >
            {isInstagramLoading ? (
              <span className="w-4 h-4 border-2 border-brand-maroon/30 border-t-brand-maroon rounded-full animate-spin" />
            ) : (
              "INQUIRE ON INSTAGRAM"
            )}
          </button>
          <p className="hidden md:block text-center text-[10px] tracking-widest uppercase text-brand-terracotta/80 mt-2 font-medium">
            ✦ Secure checkout directly via WhatsApp or Instagram Concierge ✦
          </p>
        </div>

        {/* Accordions */}
        <div className="border-t border-brand-brass/15">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="fabric" className="border-b border-brand-brass/15">
              <AccordionTrigger className="font-serif text-lg py-5 hover:no-underline text-brand-brown hover:text-brand-maroon">Fabric & Embellishment</AccordionTrigger>
              <AccordionContent className="text-xs md:text-sm text-brand-brown/80 leading-relaxed pb-5 font-light">
                <p className="mb-2"><strong>Fabric Details:</strong> {product.fabric}</p>
                <p><strong>Care:</strong> {product.careInstructions}</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="fit" className="border-b border-brand-brass/15">
              <AccordionTrigger className="font-serif text-lg py-5 hover:no-underline text-brand-brown hover:text-brand-maroon">Silhouette & Details</AccordionTrigger>
              <AccordionContent className="text-xs md:text-sm text-brand-brown/80 leading-relaxed pb-5 font-light">
                <p>{product.fit}</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="delivery" className="border-b border-brand-brass/15">
              <AccordionTrigger className="font-serif text-lg py-5 hover:no-underline text-brand-brown hover:text-brand-maroon">Shipping & Returns</AccordionTrigger>
              <AccordionContent className="text-xs md:text-sm text-brand-brown/80 leading-relaxed pb-5 font-light">
                <p className="mb-2">Complimentary express shipping across India. International shipping available.</p>
                <p>Bespoke custom-made outfits are non-refundable. Standard sizing orders are eligible for size exchanges within 7 days.</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

      </div>
    </div>
  );
}
