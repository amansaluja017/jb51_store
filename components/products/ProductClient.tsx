'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Product } from '@/lib/data';
import { formatPrice, generateWhatsAppMessage, generateInstagramMessage, WHATSAPP_NUMBER, INSTAGRAM_HANDLE } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import gsap from 'gsap';
import { toast } from 'sonner';

export function ProductClient({ product }: { product: Product }) {
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>(product.variants[0]?.color || '');
  const [activeImage, setActiveImage] = useState(0);
  
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
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const message = generateWhatsAppMessage(product, selectedSize, selectedColor, url);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
  };

  const handleInstagram = () => {
    if (!selectedSize) {
      toast.error("Please select a size first");
      return;
    }
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const message = generateInstagramMessage(product, selectedSize, selectedColor, url);
    navigator.clipboard.writeText(message);
    toast.success("Product details copied. Send this message to us on Instagram.");
    setTimeout(() => {
      window.open(`https://instagram.com/${INSTAGRAM_HANDLE}`, '_blank');
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 w-full flex flex-col lg:flex-row gap-16">
      
      {/* Image Gallery */}
      <div className="w-full lg:w-1/2 flex flex-col-reverse md:flex-row gap-4 product-animate">
        <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-y-auto hide-scrollbar md:w-24 shrink-0">
          {product.images.map((img, idx) => (
            <button 
              key={idx} 
              onClick={() => setActiveImage(idx)}
              className={`relative aspect-[3/4] w-20 md:w-full shrink-0 border transition-all ${activeImage === idx ? 'border-brand-charcoal' : 'border-transparent opacity-60 hover:opacity-100'}`}
            >
              <Image src={img} alt={`Thumbnail ${idx}`} fill className="object-cover" />
            </button>
          ))}
        </div>
        <div className="relative aspect-[3/4] flex-1 bg-brand-beige">
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
      <div className="w-full lg:w-1/2 flex flex-col pt-4 product-animate pb-32 md:pb-0">
        <div className="mb-2 text-xs tracking-widest uppercase text-brand-charcoal/60">
          {product.category}
        </div>
        <h1 className="font-serif text-4xl md:text-5xl mb-4 text-brand-charcoal">{product.name}</h1>
        <div className="text-xl mb-8">{formatPrice(product.price)}</div>
        
        <p className="text-brand-charcoal/80 leading-relaxed mb-10">
          {product.description}
        </p>

        {/* Color Selection */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium tracking-wide">Color: <span className="text-brand-charcoal/60 font-normal">{selectedColor}</span></span>
          </div>
          <div className="flex flex-wrap gap-3">
            {colors.map(color => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`px-6 py-3 border text-sm transition-colors ${selectedColor === color ? 'border-brand-charcoal bg-brand-charcoal text-brand-cream' : 'border-brand-charcoal/20 hover:border-brand-charcoal text-brand-charcoal'}`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>

        {/* Size Selection */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium tracking-wide">Size</span>
            <button className="text-xs tracking-widest uppercase underline underline-offset-4 text-brand-charcoal/60 hover:text-brand-charcoal">Size Guide</button>
          </div>
          <div className="flex flex-wrap gap-3">
            {sizes.map(size => {
              const isAvailable = product.variants.some(v => v.size === size && v.color === selectedColor && v.stock > 0);
              return (
                <button
                  key={size}
                  disabled={!isAvailable}
                  onClick={() => setSelectedSize(size)}
                  className={`w-14 h-14 border flex items-center justify-center text-sm transition-colors 
                    ${selectedSize === size ? 'border-brand-charcoal bg-brand-charcoal text-brand-cream' : ''}
                    ${!isAvailable ? 'opacity-30 cursor-not-allowed border-brand-charcoal/20 line-through' : 'border-brand-charcoal/20 hover:border-brand-charcoal text-brand-charcoal'}
                  `}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-4 mb-16 fixed bottom-0 left-0 right-0 p-4 bg-brand-cream border-t border-brand-charcoal/10 z-40 md:static md:bg-transparent md:border-none md:p-0 md:mb-16">
          <button 
            onClick={handleWhatsApp}
            className="w-full bg-[#25D366] hover:bg-[#20b858] text-white py-4 md:py-5 flex items-center justify-center gap-3 text-sm tracking-widest uppercase transition-colors"
          >
            Order on WhatsApp
          </button>
          <button 
            onClick={handleInstagram}
            className="w-full border border-brand-charcoal py-4 md:py-5 flex items-center justify-center gap-3 text-sm tracking-widest uppercase hover:bg-brand-charcoal/5 transition-colors"
          >
            Order via Instagram
          </button>
          <p className="hidden md:block text-center text-xs text-brand-charcoal/50 mt-2">
            Send this product directly to us on WhatsApp or Instagram to complete your purchase.
          </p>
        </div>

        {/* Accordions */}
        <div className="border-t border-brand-charcoal/10">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="fabric" className="border-b border-brand-charcoal/10">
              <AccordionTrigger className="font-serif text-lg py-6 hover:no-underline hover:text-brand-charcoal/60">Fabric & Care</AccordionTrigger>
              <AccordionContent className="text-sm text-brand-charcoal/80 leading-relaxed pb-6">
                <p className="mb-2"><strong>Fabric:</strong> {product.fabric}</p>
                <p><strong>Care:</strong> {product.careInstructions}</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="fit" className="border-b border-brand-charcoal/10">
              <AccordionTrigger className="font-serif text-lg py-6 hover:no-underline hover:text-brand-charcoal/60">Fit & Details</AccordionTrigger>
              <AccordionContent className="text-sm text-brand-charcoal/80 leading-relaxed pb-6">
                <p>{product.fit}</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="delivery" className="border-b border-brand-charcoal/10">
              <AccordionTrigger className="font-serif text-lg py-6 hover:no-underline hover:text-brand-charcoal/60">Delivery & Returns</AccordionTrigger>
              <AccordionContent className="text-sm text-brand-charcoal/80 leading-relaxed pb-6">
                <p className="mb-2">Complimentary express shipping on all orders.</p>
                <p>Easy returns within 14 days of receipt. All bespoke or tailored items are non-refundable.</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

      </div>
    </div>
  );
}
