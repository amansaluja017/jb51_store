'use client';

import { useRouter, usePathname } from 'next/navigation';
import { createContext, useContext, useState, useEffect, useRef } from 'react';
import gsap from 'gsap';

interface TransitionContextType {
  startTransition: (href: string) => void;
  isLoading: boolean;
}

const TransitionContext = createContext<TransitionContextType>({
  startTransition: () => {},
  isLoading: false,
});

export const useTransition = () => useContext(TransitionContext);

export function PageTransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const spinnerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  // Animate curtain out when pathname changes
  useEffect(() => {
    if (isLoading) {
      const tl = gsap.timeline({
        onComplete: () => {
          setIsLoading(false);
        }
      });
      // Slide up and fade out the curtain to reveal the new page content
      tl.to(spinnerRef.current, { opacity: 0, scale: 0.8, duration: 0.3, ease: 'power2.in' })
        .to(textRef.current, { opacity: 0, y: -10, duration: 0.3, ease: 'power2.in' }, '-=0.2')
        .to(overlayRef.current, { 
          clipPath: 'inset(0% 0% 100% 0%)', 
          duration: 0.8, 
          ease: 'power4.inOut' 
        }, '-=0.1');
    }
  }, [pathname]);

  const startTransition = (href: string) => {
    if (href === pathname) return;
    setIsLoading(true);

    const tl = gsap.timeline({
      onComplete: () => {
        router.push(href);
      }
    });

    // Reset clip path and slide down curtain
    gsap.set(overlayRef.current, { clipPath: 'inset(100% 0% 0% 0%)' });
    gsap.set([spinnerRef.current, textRef.current], { opacity: 0, scale: 1, y: 0 });

    tl.to(overlayRef.current, { 
      clipPath: 'inset(0% 0% 0% 0%)', 
      duration: 0.8, 
      ease: 'power4.inOut' 
    })
    .to(textRef.current, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, '-=0.2')
    .to(spinnerRef.current, { opacity: 1, duration: 0.4, ease: 'power2.out' }, '-=0.2')
    // Hold loading screen for a premium simulated delay
    .to({}, { duration: 1.0 });
  };

  // Intercept all internal link clicks globally
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      let target = e.target as HTMLElement | null;
      while (target && target.tagName !== 'A') {
        target = target.parentElement;
      }

      if (target && target.tagName === 'A') {
        const href = target.getAttribute('href');
        const targetAttr = target.getAttribute('target');
        
        // Only intercept relative internal paths that don't open in a new tab
        if (href && href.startsWith('/') && !href.startsWith('//') && targetAttr !== '_blank') {
          // If it's a direct admin or auth link, let it proceed normally, else transition smoothly
          if (href.startsWith('/admin') && !pathname.startsWith('/admin')) {
            // Proceed normally
            return;
          }
          e.preventDefault();
          startTransition(href);
        }
      }
    };

    document.addEventListener('click', handleLinkClick);
    return () => document.removeEventListener('click', handleLinkClick);
  }, [pathname]);

  return (
    <TransitionContext.Provider value={{ startTransition, isLoading }}>
      {children}
      
      {/* Global Transition Overlay Curtain */}
      <div 
        ref={overlayRef}
        className="fixed inset-0 z-[9999] bg-brand-wine flex flex-col items-center justify-center pointer-events-none"
        style={{ clipPath: 'inset(100% 0% 0% 0%)' }}
      >
        <div className="flex flex-col items-center select-none pointer-events-none">
          {/* Elegant gold spinner */}
          <div 
            ref={spinnerRef}
            className="w-12 h-12 border-2 border-brand-gold/30 border-t-brand-gold rounded-full animate-spin mb-6" 
          />
          <div ref={textRef} className="flex flex-col items-center">
            <span className="font-serif text-3xl text-brand-cream tracking-[0.2em] uppercase font-semibold">JB51</span>
            <span className="text-[9px] tracking-[0.4em] uppercase text-brand-gold mt-1 font-medium">Loading Collection</span>
          </div>
        </div>
      </div>
    </TransitionContext.Provider>
  );
}
