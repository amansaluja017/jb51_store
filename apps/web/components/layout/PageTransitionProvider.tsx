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

const LOADING_MESSAGES = [
  "Curating Silhouettes",
  "Draping Silk Fabrics",
  "Tailoring Atelier Suits",
  "Polishing Craftsmanship",
  "Threading Golden Embellishments",
  "Structuring Luxury Fits"
];

export function PageTransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);
  
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
      tl.to(spinnerRef.current, { opacity: 0, scale: 0.8, duration: 0.25, ease: 'power2.in' })
        .to(textRef.current, { opacity: 0, y: -15, duration: 0.25, ease: 'power2.in' }, '-=0.15')
        .to(overlayRef.current, { 
          clipPath: 'inset(0% 0% 100% 0%)', 
          duration: 0.7, 
          ease: 'power4.inOut' 
        }, '-=0.1');
    }
  }, [pathname]);

  const startTransition = (href: string) => {
    if (href === pathname) return;
    
    // Choose a random bespoke atelier loading message
    const randomMsg = LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)];
    setLoadingMessage(randomMsg);
    
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
      duration: 0.7, 
      ease: 'power4.inOut' 
    })
    .to(textRef.current, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }, '-=0.15')
    .to(spinnerRef.current, { opacity: 1, duration: 0.35, ease: 'power2.out' }, '-=0.15')
    // Hold loading screen for a premium simulated delay
    .to({}, { duration: 0.9 });
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
        className="fixed inset-0 z-[9999] bg-zinc-950 flex flex-col items-center justify-center pointer-events-none"
        style={{ clipPath: 'inset(100% 0% 0% 0%)' }}
      >
        <div className="flex flex-col items-center select-none pointer-events-none text-center">
          
          {/* Custom Dual-Ring Luxury Loader */}
          <div ref={spinnerRef} className="relative w-16 h-16 mb-8">
            {/* Outer Ring */}
            <div className="absolute inset-0 border-[2px] border-zinc-800 rounded-full" />
            <div className="absolute inset-0 border-[2px] border-transparent border-t-[#FF5E36] rounded-full animate-spin" style={{ animationDuration: '1.2s' }} />
            
            {/* Inner Ring (Reversed) */}
            <div className="absolute inset-2 border-[1.5px] border-zinc-800 rounded-full" />
            <div className="absolute inset-2 border-[1.5px] border-transparent border-b-[#FF5E36] rounded-full animate-spin" style={{ animationDuration: '0.8s', animationDirection: 'reverse' }} />
          </div>

          <div ref={textRef} className="flex flex-col items-center">
            {/* Logo */}
            <span className="font-serif text-3xl text-white tracking-[0.25em] uppercase font-bold">
              JB51
            </span>
            <span className="text-[7px] tracking-[0.6em] uppercase text-[#FF5E36] mt-1 font-bold">
              ATELIER
            </span>
            
            {/* Dynamic Status Text */}
            <div className="mt-8 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF5E36] animate-pulse" />
              <span className="text-[9px] tracking-[0.3em] uppercase text-zinc-400 font-semibold animate-pulse">
                {loadingMessage}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF5E36] animate-pulse" />
            </div>
          </div>

        </div>
      </div>
    </TransitionContext.Provider>
  );
}
