'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Star, ArrowLeft, ArrowRight } from 'lucide-react';
import { api } from '@/lib/trpc/client/react';

interface TestimonialItem {
  id: string | number;
  author: string;
  role: string;
  subtitle: string;
  quote: string;
  stars: number;
  rating: string;
  avatar: string;
}

const DEFAULT_TESTIMONIALS: TestimonialItem[] = [
  {
    id: '1',
    author: 'Rina P.',
    role: 'Business Owner',
    subtitle: 'Recent graduate, Marketing at Sweatpals',
    stars: 5,
    rating: '5.0',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&h=240&q=80',
    quote:
      'QFR Has Helped Me Manage My Business Finances More Efficiently. The Detailed And Accurate Reports Make Financial Planning Much Easier. Highly Recommended For Entrepreneurs!',
  },
  {
    id: '2',
    author: 'Indra M.',
    role: 'Private Employee',
    subtitle: 'Recent graduate, Marketing at Sweatpals',
    stars: 5,
    rating: '5.0',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&h=240&q=80',
    quote:
      'QFR Is The Best Solution For Anyone Looking To Take Control Of Their Finances. Its Analysis Is Detailed, Features Are Comprehensive, And The Interface Is Incredibly User-Friendly!',
  },
  {
    id: '3',
    author: 'Maya L.',
    role: 'Freelancer',
    subtitle: 'Recent graduate, Marketing at Sweatpals',
    stars: 5,
    rating: '5.0',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=240&h=240&q=80',
    quote:
      'Data Security And Ease Of Access Are My Top Priorities, And QFR Delivers Both. Now I Can Manage My Personal Finances With Peace Of Mind.',
  },
  {
    id: '4',
    author: 'Aaradhya M.',
    role: 'Creative Director',
    subtitle: 'Bespoke Client • Mumbai',
    stars: 5,
    rating: '5.0',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=240&h=240&q=80',
    quote:
      'The Banarasi silk drape is pure poetry. The tailoring is absolutely perfect, fits like a dream. Every single thread speaks of generational artistry and heritage craftsmanship.',
  },
  {
    id: '5',
    author: 'Priya S.',
    role: 'Architect',
    subtitle: 'Regular Patron • London',
    stars: 5,
    rating: '5.0',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=240&h=240&q=80',
    quote:
      'Outstanding customer service on WhatsApp. They adjusted the neckline and silhouette exactly as I requested, and my bespoke order arrived safely ahead of schedule.',
  },
  {
    id: '6',
    author: 'Rohan D.',
    role: 'Tech Lead',
    subtitle: 'Verified Patron • San Francisco',
    stars: 5,
    rating: '5.0',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&h=240&q=80',
    quote:
      'The fabric quality is breathtaking. Breathable pure handloom silks and royal velvet textures. Generational craftsmanship is evident in every single stitch.',
  },
];

export function Testimonials() {
  const { data: dbReviews = [] } = api.reviews.getAll.useQuery();

  // Combine database reviews if available
  const allTestimonials: TestimonialItem[] = (
    dbReviews && dbReviews.length > 0
      ? [
          ...dbReviews.map((r, i) => ({
            id: `db-${r.id || i}`,
            author: r.name || 'Verified Patron',
            role: 'Patron',
            subtitle: r.location ? `Verified Patron • ${r.location}` : 'Verified Customer',
            quote: r.message,
            stars: Number(r.stars) || 5,
            rating: '5.0',
            avatar:
              DEFAULT_TESTIMONIALS[i % DEFAULT_TESTIMONIALS.length]?.avatar ||
              DEFAULT_TESTIMONIALS[0]!.avatar,
          })),
          ...DEFAULT_TESTIMONIALS,
        ]
      : DEFAULT_TESTIMONIALS
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchDeltaX, setTouchDeltaX] = useState<number>(0);
  const total = allTestimonials.length;

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
  };

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  // Subtle auto-advance every 6 seconds, paused on hover
  useEffect(() => {
    if (isPaused || total <= 1) return;
    const interval = setInterval(handleNext, 6000);
    return () => clearInterval(interval);
  }, [isPaused, total, handleNext]);

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0]?.clientX ?? null);
    setTouchDeltaX(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const currentX = e.touches[0]?.clientX ?? touchStartX;
    setTouchDeltaX(currentX - touchStartX);
  };

  const handleTouchEnd = () => {
    if (touchDeltaX > 50) {
      handlePrev();
    } else if (touchDeltaX < -50) {
      handleNext();
    }
    setTouchStartX(null);
    setTouchDeltaX(0);
  };

  return (
    <section
      id="testimonials"
      aria-label="Customer Testimonials"
      className="py-20 md:py-28 bg-[#FAFAFA] relative overflow-hidden select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Soft Glow */}
      <div 
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-b from-white via-zinc-100/60 to-transparent blur-3xl pointer-events-none rounded-full" 
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 flex flex-col items-center">
        {/* Title Container */}
        <div className="text-center mb-12 sm:mb-16">
          <span className="text-[10px] md:text-xs tracking-[0.25em] uppercase text-[#FF5E36] font-bold block mb-2">
            CLIENT DIARIES
          </span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-[44px] font-bold text-zinc-950 tracking-tight leading-[1.18] max-w-xl mx-auto">
            Customer Testimonials
          </h2>
        </div>

        {/* 3D Perspective Animated Card Stage */}
        <div className="relative w-full max-w-5xl h-[440px] sm:h-[460px] md:h-[480px] flex items-center justify-center">
          {allTestimonials.map((item, idx) => {
            // Calculate relative offset distance from active currentIndex (-total/2 to total/2)
            let offset = (idx - currentIndex) % total;
            if (offset > total / 2) offset -= total;
            if (offset < -total / 2) offset += total;

            const isCenter = offset === 0;
            const isLeft = offset === -1;
            const isRight = offset === 1;
            const isVisible = Math.abs(offset) <= 1;

            // Compute dynamic 3D transform and visual styling
            let transformStyle = '';
            let opacityStyle = 0;
            let zIndexStyle = 0;
            let pointerEvents: 'auto' | 'none' = 'none';

            if (isCenter) {
              transformStyle = 'translate3d(-50%, -50%, 0px) rotate(0deg) scale(1)';
              opacityStyle = 1;
              zIndexStyle = 30;
              pointerEvents = 'auto';
            } else if (isLeft) {
              // Left card: shifted left, tilted clockwise (+4deg), shifted down (+20px), slightly scaled down
              transformStyle =
                'translate3d(calc(-50% - 105%), calc(-50% + 20px), 0px) rotate(4deg) scale(0.93)';
              opacityStyle = 0.92;
              zIndexStyle = 20;
              pointerEvents = 'auto';
            } else if (isRight) {
              // Right card: shifted right, tilted counter-clockwise (-4.5deg), shifted down (+20px), slightly scaled down
              transformStyle =
                'translate3d(calc(-50% + 105%), calc(-50% + 20px), 0px) rotate(-4.5deg) scale(0.93)';
              opacityStyle = 0.92;
              zIndexStyle = 20;
              pointerEvents = 'auto';
            } else if (offset < -1) {
              // Queuing on the far left
              transformStyle =
                'translate3d(calc(-50% - 210%), calc(-50% + 40px), 0px) rotate(8deg) scale(0.82)';
              opacityStyle = 0;
              zIndexStyle = 0;
              pointerEvents = 'none';
            } else {
              // Queuing on the far right
              transformStyle =
                'translate3d(calc(-50% + 210%), calc(-50% + 40px), 0px) rotate(-8deg) scale(0.82)';
              opacityStyle = 0;
              zIndexStyle = 0;
              pointerEvents = 'none';
            }

            return (
              <div
                key={item.id}
                role="group"
                aria-roledescription="slide"
                aria-label={`Testimonial from ${item.author}`}
                aria-hidden={!isCenter}
                onClick={() => {
                  if (isLeft) handlePrev();
                  if (isRight) handleNext();
                }}
                style={{
                  transform: transformStyle,
                  opacity: opacityStyle,
                  zIndex: zIndexStyle,
                  pointerEvents: pointerEvents,
                  transition:
                    'transform 650ms cubic-bezier(0.22, 1, 0.36, 1), opacity 500ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 500ms ease, filter 500ms ease',
                }}
                className={`absolute top-1/2 left-1/2 w-[310px] sm:w-[350px] md:w-[380px] lg:w-[400px] bg-white rounded-[32px] p-7 sm:p-9 flex flex-col items-center justify-between text-center select-none ${
                  isCenter
                    ? 'shadow-[0_25px_60px_-15px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.04)] cursor-default'
                    : 'shadow-[0_15px_35px_-10px_rgba(0,0,0,0.05),0_0_0_1px_rgba(0,0,0,0.03)] cursor-pointer hover:opacity-100'
                }`}
              >
                {/* Top Section: Avatar & Author Info */}
                <div className="w-full flex flex-col items-center">
                  {/* Round Avatar */}
                  <div className="relative w-13 h-13 sm:w-14 sm:h-14 rounded-full overflow-hidden mb-4 ring-2 ring-white shadow-sm shrink-0 bg-zinc-100">
                    <Image
                      src={item.avatar}
                      alt={item.author}
                      fill
                      sizes="(max-width: 640px) 52px, 56px"
                      className="object-cover"
                    />
                  </div>

                  {/* Name with em-dash and role */}
                  <h3 className="font-sans font-semibold text-zinc-900 text-sm sm:text-base tracking-tight leading-snug">
                    — {item.author}, {item.role}
                  </h3>

                  {/* Subtitle / Company / College */}
                  <p className="text-zinc-400 text-xs sm:text-[13px] font-normal mt-1 leading-normal">
                    {item.subtitle}
                  </p>
                </div>

                {/* Rating Section: 5 Orange Stars + Rating Number */}
                <div className="my-5 flex items-center justify-center gap-1.5">
                  <div className="flex items-center gap-1">
                    {[...Array(item.stars)].map((_, i) => (
                      <Star
                        key={i}
                        size={15}
                        className="fill-[#FF5E36] text-[#FF5E36]"
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                  <span className="font-bold text-zinc-900 text-xs sm:text-sm ml-1 tracking-tight">
                    {item.rating}
                  </span>
                </div>

                {/* Testimonial Quote */}
                <p className="text-zinc-700 text-xs sm:text-[13.5px] leading-relaxed text-center font-normal px-1 line-clamp-4">
                  &ldquo;{item.quote}&rdquo;
                </p>
              </div>
            );
          })}
        </div>

        {/* Controls Section: Pagination Indicator & Circular Navigation Buttons */}
        <div className="mt-8 sm:mt-10 flex flex-col items-center gap-5">
          {/* Pagination Indicators (Active Orange Pill & Inactive Grey Dots) */}
          <div className="flex items-center gap-2" role="tablist" aria-label="Slides">
            {allTestimonials.map((_, idx) => {
              const isActive = idx === currentIndex;
              return (
                <button
                  key={idx}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`Go to slide ${idx + 1}`}
                  onClick={() => handleDotClick(idx)}
                  className={`transition-all duration-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#FF5E36]/40 ${
                    isActive
                      ? 'w-6 h-1.5 bg-[#FF5E36]'
                      : 'w-1.5 h-1.5 bg-zinc-300 hover:bg-zinc-400'
                  }`}
                />
              );
            })}
          </div>

          {/* Navigation Buttons: Light Left Arrow & Dark Solid Right Arrow */}
          <div className="flex items-center justify-center gap-3">
            {/* Prev Button (Light White/Grey) */}
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous testimonial"
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white border border-zinc-200/90 text-zinc-900 shadow-sm hover:bg-zinc-100 hover:border-zinc-300 active:scale-95 transition-all duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-zinc-400"
            >
              <ArrowLeft className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </button>

            {/* Next Button (Solid Dark Black) */}
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next testimonial"
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-zinc-950 text-white shadow-md hover:bg-zinc-800 active:scale-95 transition-all duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-zinc-950/40"
            >
              <ArrowRight className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
