'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { 
  Sparkles, 
  MessageCircle, 
  Phone, 
  Mail, 
  Instagram, 
  Clock, 
  RotateCw, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import type { MaintenanceModeConfig, ContactInfoConfig } from '@/lib/site-config';
import { WHATSAPP_NUMBER, COMPANY_EMAIL, INSTAGRAM_HANDLE } from '@/lib/utils';

interface MaintenanceScreenProps {
  config?: MaintenanceModeConfig;
  contactInfo?: ContactInfoConfig;
}

export function MaintenanceScreen({ config, contactInfo }: MaintenanceScreenProps) {
  const [checking, setChecking] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const title = config?.title?.trim() || 'We Are Refining Our Collection';
  const message = config?.message?.trim() || 
    'Our digital atelier is currently undergoing scheduled enhancements to curate new haute couture silhouettes. We shall reopen shortly to welcome you.';
  const expectedBack = config?.expectedBackTime?.trim() || 'Shortly';

  const waNumber = contactInfo?.whatsappNumber || WHATSAPP_NUMBER || '919306234357';
  const phone = contactInfo?.phoneNumber || '+91 93062 34357';
  const email = contactInfo?.email || COMPANY_EMAIL || 'support@jb51.shop';
  const insta = contactInfo?.instagramUrl || `https://instagram.com/${INSTAGRAM_HANDLE}`;

  const handleCheckStatus = async () => {
    setChecking(true);
    setStatusMessage(null);
    try {
      // Re-fetch current window location to check if maintenance is disabled
      await new Promise((resolve) => setTimeout(resolve, 1000));
      window.location.reload();
    } catch {
      setStatusMessage('Storefront remains in scheduled maintenance. Please check back shortly.');
      setChecking(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-zinc-950 text-white flex flex-col justify-between overflow-hidden font-sans selection:bg-[#FF5E36] selection:text-white">
      {/* Background Ambience & Radial Glows */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-gradient-to-b from-[#FF5E36]/15 via-amber-700/5 to-transparent blur-3xl" />
        <div className="absolute -bottom-40 right-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-t from-amber-600/10 to-transparent blur-3xl" />
        <div 
          className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" 
        />
      </div>

      {/* Top Header / Brand Crest */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-8 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-200/20 to-amber-900/40 border border-amber-400/30 flex items-center justify-center shadow-lg shadow-amber-950/40">
            <span className="font-serif font-bold text-amber-200 text-sm tracking-wider">JB</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-serif tracking-[0.25em] text-white font-medium uppercase">
              JB51
            </span>
            <span className="text-[8px] uppercase tracking-[0.3em] text-zinc-400 font-medium">
              Clothing House • Kaithal
            </span>
          </div>
        </div>

        {/* Live Status Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF5E36] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF5E36]" />
          </span>
          <span className="text-[9px] uppercase tracking-[0.2em] font-semibold text-zinc-300">
            Atelier Maintenance
          </span>
        </div>
      </header>

      {/* Center Main Stage */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-4xl mx-auto text-center">
        {/* Subtle royal sparkle motif */}
        <div className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-medium tracking-[0.2em] uppercase">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>Curating Heritage Silhouettes</span>
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
        </div>

        {/* Grand Headline */}
        <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-light text-white tracking-tight leading-[1.15] mb-5">
          {title}
        </h1>

        {/* Narrative Message */}
        <p className="text-zinc-400 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed font-light mb-8">
          {message}
        </p>

        {/* Expected Back Time Pill Card */}
        {expectedBack && (
          <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-lg mb-10 shadow-2xl">
            <Clock className="w-4 h-4 text-[#FF5E36]" />
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <span className="text-zinc-400">Estimated Reopening:</span>
              <span className="font-medium text-white tracking-wide">{expectedBack}</span>
            </div>
          </div>
        )}

        {/* Action Button: Live Status Check */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md justify-center mb-12">
          <button
            onClick={handleCheckStatus}
            disabled={checking}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white text-zinc-950 font-semibold text-xs uppercase tracking-[0.2em] hover:bg-zinc-200 transition-all duration-300 flex items-center justify-center gap-2 shadow-xl shadow-white/10 active:scale-[0.98] disabled:opacity-75"
          >
            <RotateCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
            <span>{checking ? 'Checking Status...' : 'Check If Store Is Open'}</span>
          </button>
        </div>

        {statusMessage && (
          <p className="text-xs text-amber-300/90 font-medium mb-8 animate-fade-in">
            {statusMessage}
          </p>
        )}

        {/* VIP Concierge Assistance Grid */}
        <div className="w-full pt-8 border-t border-white/10">
          <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 font-bold mb-5">
            Require Urgent Assistance or Bespoke Inquiries?
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
            {/* WhatsApp */}
            <a
              href={`https://wa.me/${waNumber}?text=${encodeURIComponent('Hello JB51 team, I would like to inquire about your collection.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-emerald-500/40 transition-all duration-300 group"
            >
              <div className="w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageCircle className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium text-white">WhatsApp</span>
              <span className="text-[10px] text-zinc-400">Instant Chat</span>
            </a>

            {/* Direct Call */}
            <a
              href={`tel:${phone.replace(/\s+/g, '')}`}
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-amber-500/40 transition-all duration-300 group"
            >
              <div className="w-9 h-9 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Phone className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium text-white">Call Stylist</span>
              <span className="text-[10px] text-zinc-400">Direct Line</span>
            </a>

            {/* Instagram */}
            <a
              href={insta.startsWith('http') ? insta : `https://instagram.com/${insta}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-pink-500/40 transition-all duration-300 group"
            >
              <div className="w-9 h-9 rounded-full bg-pink-500/10 text-pink-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Instagram className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium text-white">Instagram</span>
              <span className="text-[10px] text-zinc-400">@jb51_clothing_house</span>
            </a>

            {/* Email */}
            <a
              href={`mailto:${email}?subject=Concierge%20Inquiry%20-%20JB51`}
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-sky-500/40 transition-all duration-300 group"
            >
              <div className="w-9 h-9 rounded-full bg-sky-500/10 text-sky-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Mail className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium text-white">Email Us</span>
              <span className="text-[10px] text-zinc-400">support@jb51.shop</span>
            </a>
          </div>
        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5 text-[10px] text-zinc-400 uppercase tracking-[0.2em]">
        <span>© {new Date().getFullYear()} JB51 Clothing House. All rights reserved.</span>
        <div className="flex items-center gap-2 text-zinc-400">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-500/80" />
          <span>Authentic Handcrafted Punjabi Suits • Kaithal, Haryana</span>
        </div>
      </footer>
    </div>
  );
}
