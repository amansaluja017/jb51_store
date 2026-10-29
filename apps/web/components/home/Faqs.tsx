'use client';

import { useState } from 'react';
import { FormattedRichText } from '@/components/ui/FormattedRichText';

import type { FaqItem } from '@/lib/site-config';

const DEFAULT_FAQS: FaqItem[] = [
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

interface FaqsProps {
  items?: FaqItem[];
}

export function Faqs({ items }: FaqsProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const faqs = (items && items.length > 0) ? items : DEFAULT_FAQS;

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
            <div 
              key={idx} 
              className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                isOpen 
                  ? 'border-[#FF5E36]/30 bg-white shadow-sm' 
                  : 'border-zinc-200/70 bg-zinc-50/60 hover:border-zinc-300'
              }`}
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full flex items-center justify-between p-5 text-left font-serif font-bold text-base text-zinc-900 hover:text-[#FF5E36] transition-colors focus:outline-none cursor-pointer"
                aria-expanded={isOpen ? "true" : "false"}
                aria-label={`Toggle FAQ: ${faq.q}`}
              >
                <span className="pr-4">{faq.q}</span>
                <span 
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium shrink-0 transition-all duration-300 ${
                    isOpen 
                      ? 'bg-[#FF5E36] text-white rotate-45' 
                      : 'bg-zinc-200/70 text-zinc-600 hover:bg-[#FF5E36]/10 hover:text-[#FF5E36]'
                  }`}
                >
                  +
                </span>
              </button>
              
              {/* Smooth Grid-based Accordion Height Transition */}
              <div
                className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                  isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                }`}
              >
                <div className="overflow-hidden">
                  <div className="px-5 pb-5 pt-1 border-t border-zinc-100 bg-white">
                    <div className="pt-2">
                      <FormattedRichText
                        text={faq.a}
                        paragraphClassName="text-zinc-600 text-xs md:text-sm font-light leading-relaxed"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
