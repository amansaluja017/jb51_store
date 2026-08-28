'use client';

import { Star } from 'lucide-react';

const testimonialsRow1 = [
  {
    quote: "The Banarasi silk drape is pure poetry. The tailoring is absolutely perfect, fits like a dream.",
    author: "Aaradhya M.",
    location: "Mumbai",
    role: "Bespoke Client",
    stars: 5,
  },
  {
    quote: "Outstanding customer service on WhatsApp. They adjusted the neckline exactly as I requested.",
    author: "Priya S.",
    location: "London",
    role: "Atelier Regular",
    stars: 5,
  },
  {
    quote: "Generational craftsmanship is evident in the zardozi detail. I received endless compliments!",
    author: "Meera R.",
    location: "New York",
    role: "Festive Collection",
    stars: 5,
  },
  {
    quote: "My bespoke order arrived ahead of schedule. The velvet is incredibly rich and soft.",
    author: "Kiran J.",
    location: "New Delhi",
    role: "Bespoke Patron",
    stars: 5,
  }
];

const testimonialsRow2 = [
  {
    quote: "Excellent tailoring, fluid silhouettes, and such breathable fabrics. Highly recommend.",
    author: "Deepika P.",
    location: "Singapore",
    role: "Occasion Wear",
    stars: 5,
  },
  {
    quote: "A beautiful fusion of heritage craft and modern wearability. Simply stunning!",
    author: "Ananya K.",
    location: "Sydney",
    role: "Silk Co-ords",
    stars: 5,
  },
  {
    quote: "The fabric quality is outstanding. Feels incredibly premium and comfortable.",
    author: "Rohan D.",
    location: "San Francisco",
    role: "Menswear Elite",
    stars: 5,
  },
  {
    quote: "The craftsmanship is top-tier. Every stitch tells a story of dedicated artistry.",
    author: "Shreya V.",
    location: "Dubai",
    role: "Signature Edit",
    stars: 5,
  }
];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-zinc-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <div className="text-center mb-10 fade-up">
          <span className="text-[10px] tracking-[0.25em] uppercase text-[#FF5E36] font-bold block mb-2">ATELIER DIARIES</span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-zinc-950 tracking-tight">Customer Testimonials</h2>
        </div>
      </div>

      {/* Infinite Loop Slider Tracks */}
      <div className="hover-pause flex flex-col gap-6 w-full overflow-hidden relative z-10 select-none">

        {/* Row 1: Sliding Left */}
        <div className="flex whitespace-nowrap w-full overflow-hidden">
          <div className="flex gap-6 animate-marquee-left shrink-0">
            {[...testimonialsRow1, ...testimonialsRow1].map((item, idx) => (
              <div
                key={idx}
                className="w-[300px] md:w-[380px] shrink-0 bg-white border border-zinc-100 p-6 rounded-2xl flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 relative group"
              >
                <span className="absolute top-2 right-5 font-serif text-7xl text-zinc-100 select-none pointer-events-none group-hover:text-zinc-200 transition-colors">“</span>
                <div>
                  {/* Star icons */}
                  <div className="flex gap-1 mb-3 text-amber-400">
                    {[...Array(item.stars)].map((_, i) => (
                      <Star key={i} size={11} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-zinc-600 text-[11px] md:text-xs font-light italic leading-relaxed whitespace-normal mb-5">
                    "{item.quote}"
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-zinc-100 pt-3 text-[10px]">
                  <div>
                    <span className="block font-bold text-zinc-950">{item.author}</span>
                    <p className="text-[8px] tracking-wider uppercase text-zinc-400 mt-0.5">{item.role}</p>
                  </div>
                  <span className="text-[8px] tracking-widest uppercase font-bold text-[#FF5E36] bg-[#FF5E36]/5 px-2 py-0.5 rounded-full">{item.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Row 2: Sliding Right */}
        <div className="flex whitespace-nowrap w-full overflow-hidden">
          <div className="flex gap-6 animate-marquee-right shrink-0">
            {[...testimonialsRow2, ...testimonialsRow2].map((item, idx) => (
              <div
                key={idx}
                className="w-[300px] md:w-[380px] shrink-0 bg-white border border-zinc-100 p-6 rounded-2xl flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 relative group"
              >
                <span className="absolute top-2 right-5 font-serif text-7xl text-zinc-100 select-none pointer-events-none group-hover:text-zinc-200 transition-colors">“</span>
                <div>
                  {/* Star icons */}
                  <div className="flex gap-1 mb-3 text-amber-400">
                    {[...Array(item.stars)].map((_, i) => (
                      <Star key={i} size={11} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-zinc-600 text-[11px] md:text-xs font-light italic leading-relaxed whitespace-normal mb-5">
                    "{item.quote}"
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-zinc-100 pt-3 text-[10px]">
                  <div>
                    <span className="block font-bold text-zinc-950">{item.author}</span>
                    <p className="text-[8px] tracking-wider uppercase text-zinc-400 mt-0.5">{item.role}</p>
                  </div>
                  <span className="text-[8px] tracking-widest uppercase font-bold text-[#FF5E36] bg-[#FF5E36]/5 px-2 py-0.5 rounded-full">{item.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
