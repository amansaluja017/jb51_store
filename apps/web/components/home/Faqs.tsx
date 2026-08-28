'use client';

import { useState } from 'react';

export function Faqs() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: "How do I order a custom-fit suit?",
      a: "Select your desired garment and size. During standard checkout, you can input custom measurements. Additionally, our concierge team actively contacts all bespoke orders via email or WhatsApp to confirm your proportions."
    },
    {
      q: "What is the typical timeline for bespoke tailoring?",
      a: "Each custom suit is handcrafted by our master designers. Tailoring requires 2 to 3 weeks from measurement confirmation to shipment. Ready-to-wear lines are dispatched within 2–3 business days."
    },
    {
      q: "Do you offer international shipping?",
      a: "Yes, we ship globally. Express transit usually takes 5–7 business days depending on location. Full tracking credentials will be provided upon dispatch."
    },
    {
      q: "Can I request custom modifications to designs?",
      a: "Absolutely. Since each outfit is individually finalized, you can request custom sleeve lengths, necklines, colors, or fabrics. Simply reach out immediately after booking."
    },
    {
      q: "What is your return and exchange policy?",
      a: "Ready-to-wear items can be exchanged within 7 days of delivery. Because customized garments are created strictly to your specifications, they are non-refundable, but we offer free tailoring adjustments if needed."
    }
  ];

  return (
    <section className="py-24 px-6 max-w-3xl mx-auto w-full">
      <div className="text-center mb-12 fade-up">
        <span className="text-[10px] tracking-[0.25em] uppercase text-[#FF5E36] font-bold block mb-2">CUSTOMER CONCIERGE</span>
        <h2 className="font-serif text-3xl font-bold text-zinc-950">Frequently Asked Questions</h2>
      </div>

      <div className="space-y-3.5 fade-up">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div key={idx} className="border border-zinc-100 rounded-2xl overflow-hidden bg-zinc-50/50">
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full flex items-center justify-between p-5 text-left font-serif font-bold text-base text-zinc-900 hover:text-[#FF5E36] transition-colors focus:outline-none cursor-pointer"
                aria-expanded={isOpen ? "true" : "false"}
                aria-label={`Toggle FAQ: ${faq.q}`}
              >
                <span className="pr-4">{faq.q}</span>
                <span className={`text-[#FF5E36] transition-transform duration-300 text-lg font-light shrink-0 ${isOpen ? 'rotate-45' : ''}`}>
                  +
                </span>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  isOpen ? 'max-h-40 opacity-100 p-5 pt-0 border-t border-zinc-100 bg-white' : 'max-h-0 opacity-0 pointer-events-none'
                }`}
              >
                <p className="text-zinc-500 text-xs md:text-sm font-light leading-relaxed mt-4">
                  {faq.a}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
