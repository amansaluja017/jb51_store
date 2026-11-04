'use client';

import React, { useState } from 'react';
import { 
  MessageCircle, 
  Phone, 
  Mail, 
  Instagram, 
  Clock, 
  RotateCw, 
  ShieldCheck 
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

  const rawTitle = config?.title?.trim() || 'We Are Refining Our Collection';
  const title = rawTitle.replace(/\batelier\b/gi, 'Boutique');

  const rawMessage = config?.message?.trim() || 
    'Our online boutique is currently undergoing scheduled enhancements to curate new haute couture silhouettes. We shall reopen shortly to welcome you.';
  const message = rawMessage.replace(/\batelier\b/gi, 'boutique');

  const expectedBack = config?.expectedBackTime?.trim() || 'Shortly';

  const rawWa = contactInfo?.whatsappNumber || WHATSAPP_NUMBER || '919306234357';
  const waNumber = rawWa.replace(/\D/g, '');
  const phone = contactInfo?.phoneNumber || '+91 93062 34357';
  const email = contactInfo?.email || COMPANY_EMAIL || 'support@jb51.shop';
  const rawInsta = contactInfo?.instagramUrl || `https://instagram.com/${INSTAGRAM_HANDLE}`;
  const instaUrl = rawInsta.startsWith('http') ? rawInsta : `https://instagram.com/${rawInsta}`;

  const handleCheckStatus = async () => {
    setChecking(true);
    setStatusMessage(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      window.location.reload();
    } catch {
      setStatusMessage('Storefront remains in scheduled maintenance. Please check back shortly.');
      setChecking(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-brand-cream text-brand-brown flex flex-col justify-between overflow-hidden font-sans selection:bg-brand-maroon selection:text-white">
      {/* Background Ambience & Traditional Textures */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {/* Subtle jaali / block-print motif */}
        <div className="absolute inset-0 pattern-jaali opacity-40" />
        
        {/* Soft royal warm auras */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[650px] h-[650px] rounded-full bg-gradient-to-b from-brand-gold/15 via-brand-terracotta/5 to-transparent blur-3xl" />
        <div className="absolute -bottom-32 right-1/4 w-[450px] h-[450px] rounded-full bg-gradient-to-t from-brand-brass/10 to-transparent blur-3xl" />
        <div className="absolute top-1/3 left-10 w-72 h-72 rounded-full bg-brand-cream/60 blur-2xl" />
      </div>

      {/* Top Header / Brand Crest */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-8 flex items-center justify-between border-b border-brand-brass/20">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-brand-maroon border border-brand-gold/40 flex items-center justify-center shadow-md">
            <span className="font-serif font-bold text-brand-cream text-sm tracking-wider">JB</span>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-serif tracking-[0.2em] text-brand-maroon font-bold uppercase leading-tight">
              JB51
            </span>
            <span className="text-[8px] uppercase tracking-[0.32em] text-brand-terracotta font-semibold">
              Clothing House • Kaithal
            </span>
          </div>
        </div>

        {/* Live Status Pill */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-brand-brass/30 shadow-xs backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-terracotta opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-terracotta" />
          </span>
          <span className="text-[9px] uppercase tracking-[0.2em] font-semibold text-brand-maroon">
            Store Maintenance
          </span>
        </div>
      </header>

      {/* Center Main Stage */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-4xl mx-auto text-center">
        {/* Script Accent / Flourish */}
        <span className="font-script text-3xl sm:text-4xl text-brand-saffron block mb-3">
          Refining Our Collection
        </span>

        {/* Status Chip (without sparkles) */}
        <div className="mb-6 inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-brand-sand/70 border border-brand-brass/30 text-brand-maroon text-[11px] font-semibold tracking-[0.22em] uppercase shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-terracotta" />
          <span>Curating Heritage Silhouettes</span>
          <span className="w-1.5 h-1.5 rounded-full bg-brand-terracotta" />
        </div>

        {/* Grand Headline */}
        <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-normal text-brand-maroon tracking-tight leading-[1.18] mb-5">
          {title}
        </h1>

        {/* Subtle Editorial Divider */}
        <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-brand-brass/60 to-transparent mx-auto mb-6 relative flex items-center justify-center">
          <span className="w-1.5 h-1.5 rotate-45 bg-brand-brass absolute" />
        </div>

        {/* Narrative Message */}
        <p className="text-brand-brown/80 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed font-light mb-8">
          {message}
        </p>

        {/* Expected Back Time Card */}
        {expectedBack && (
          <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/85 border border-brand-brass/30 backdrop-blur-md mb-8 shadow-sm">
            <Clock className="w-4 h-4 text-brand-terracotta" />
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <span className="text-brand-brown/70 font-light">Estimated Reopening:</span>
              <span className="font-serif font-semibold text-brand-maroon tracking-wide">{expectedBack}</span>
            </div>
          </div>
        )}

        {/* Action Button: Live Status Check */}
        <div className="flex flex-col items-center gap-3 w-full max-w-md justify-center mb-12">
          <button
            onClick={handleCheckStatus}
            disabled={checking}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-brand-maroon text-brand-cream hover:bg-brand-burgundy font-medium text-xs uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg active:scale-[0.98] disabled:opacity-75 border border-brand-maroon cursor-pointer"
          >
            <RotateCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
            <span>{checking ? 'Checking Status...' : 'Check If Store Is Open'}</span>
          </button>

          {statusMessage && (
            <p className="text-xs text-brand-terracotta font-medium mt-2 animate-fade-in">
              {statusMessage}
            </p>
          )}
        </div>

        {/* VIP Concierge Assistance Section */}
        <div className="w-full pt-8 border-t border-brand-brass/20">
          <p className="text-[11px] uppercase tracking-[0.25em] text-brand-maroon font-bold mb-6 font-serif">
            Require Bespoke Consultation or Urgent Inquiries?
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 w-full">
            {/* WhatsApp */}
            <a
              href={`https://wa.me/${waNumber}?text=${encodeURIComponent('Hello JB51 team, I would like to inquire about your collection.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-white/80 hover:bg-white border border-brand-brass/25 hover:border-brand-maroon/40 shadow-xs hover:shadow-md transition-all duration-300 group"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageCircle className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-brand-maroon">WhatsApp</span>
              <span className="text-[10px] text-brand-brown/65">Instant Chat</span>
            </a>

            {/* Direct Call */}
            <a
              href={`tel:${phone.replace(/\s+/g, '')}`}
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-white/80 hover:bg-white border border-brand-brass/25 hover:border-brand-maroon/40 shadow-xs hover:shadow-md transition-all duration-300 group"
            >
              <div className="w-10 h-10 rounded-full bg-amber-50 text-brand-saffron border border-amber-200/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Phone className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-brand-maroon">Call Stylist</span>
              <span className="text-[10px] text-brand-brown/65">Direct Line</span>
            </a>

            {/* Instagram */}
            <a
              href={instaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-white/80 hover:bg-white border border-brand-brass/25 hover:border-brand-maroon/40 shadow-xs hover:shadow-md transition-all duration-300 group"
            >
              <div className="w-10 h-10 rounded-full bg-rose-50 text-brand-terracotta border border-rose-200/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Instagram className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-brand-maroon">Instagram</span>
              <span className="text-[10px] text-brand-brown/65">@{INSTAGRAM_HANDLE}</span>
            </a>

            {/* Email */}
            <a
              href={`mailto:${email}?subject=Concierge%20Inquiry%20-%20JB51`}
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-white/80 hover:bg-white border border-brand-brass/25 hover:border-brand-maroon/40 shadow-xs hover:shadow-md transition-all duration-300 group"
            >
              <div className="w-10 h-10 rounded-full bg-stone-50 text-brand-brown border border-brand-brass/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Mail className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-brand-maroon">Email Us</span>
              <span className="text-[10px] text-brand-brown/65">Customer Care</span>
            </a>
          </div>
        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-brand-brass/20 text-[10px] text-brand-brown/70 uppercase tracking-[0.2em]">
        <span>© {new Date().getFullYear()} JB51 Clothing House. All rights reserved.</span>
        <div className="flex items-center gap-2 text-brand-brown/80">
          <ShieldCheck className="w-3.5 h-3.5 text-brand-maroon" />
          <span>Authentic Handcrafted Punjabi Suits • Kaithal, Haryana</span>
        </div>
      </footer>
    </div>
  );
}
