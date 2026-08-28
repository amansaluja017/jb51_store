'use client';

import { Truck, ShieldCheck, RotateCcw, Sparkles } from 'lucide-react';

export function FeatureBadges() {
  return (
    <section className="bg-white py-6 border-b border-zinc-100 z-20 relative select-none">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4 divide-y md:divide-y-0 md:divide-x divide-zinc-100">
        <div className="flex items-center gap-3.5 pl-2 py-2 md:py-0">
          <div className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center text-[#FF5E36] shrink-0">
            <Truck size={18} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-zinc-950 uppercase tracking-wider">Free Shipping</h4>
            <p className="text-[10px] text-zinc-400 mt-0.5">On orders over 30,000 INR</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 pl-2 md:pl-6 py-2 md:py-0">
          <div className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center text-[#FF5E36] shrink-0">
            <ShieldCheck size={18} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-zinc-950 uppercase tracking-wider">Secure Payments</h4>
            <p className="text-[10px] text-zinc-400 mt-0.5">100% encrypted checkout</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 pl-2 md:pl-6 py-2 md:py-0">
          <div className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center text-[#FF5E36] shrink-0">
            <RotateCcw size={18} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-zinc-950 uppercase tracking-wider">Easy Exchange</h4>
            <p className="text-[10px] text-zinc-400 mt-0.5">No questions asked 7-day policy</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 pl-2 md:pl-6 py-2 md:py-0">
          <div className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center text-[#FF5E36] shrink-0">
            <Sparkles size={18} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-zinc-950 uppercase tracking-wider">24/7 Support</h4>
            <p className="text-[10px] text-zinc-400 mt-0.5">Premium concierge assistance</p>
          </div>
        </div>
      </div>
    </section>
  );
}
