import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  FileText, 
  CheckCircle2, 
  ArrowLeft, 
  Mail, 
  MessageCircle, 
  Clock, 
  MapPin, 
  Sparkles, 
  Scale,
  Cookie,
  UserCheck,
  RefreshCw,
  HelpCircle
} from 'lucide-react';
import { WHATSAPP_NUMBER } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Privacy Policy | JB51 Atelier',
  description: 'Learn how JB51 Atelier collects, protects, and uses your personal data, custom sizing measurements, and order information with utmost security and care.',
  keywords: ['privacy policy', 'JB51 data protection', 'bespoke atelier privacy', 'customer data security'],
  openGraph: {
    title: 'Privacy Policy | JB51 Atelier',
    description: 'Our commitment to protecting your personal information and bespoke sizing records.',
    type: 'website',
  },
};

// Lotus motif branding icon
const LotusIcon = ({ className = "w-5 h-5 text-[#FF5E36]" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
    <path d="M12 4C12 4 9 10 12 20C15 10 12 4 12 4Z" fill="currentColor" fillOpacity="0.08" />
    <path d="M12 12C9 9 4 11 6 18C10 18 11 14 12 12Z" fill="currentColor" fillOpacity="0.04" />
    <path d="M12 12C15 9 20 11 18 18C14 18 13 14 12 12Z" fill="currentColor" fillOpacity="0.04" />
    <path d="M10 21C11 21.5 13 21.5 14 21" strokeLinecap="round" />
  </svg>
);

export default function PrivacyPolicyPage() {
  const lastUpdated = "October 22, 2026";
  const effectiveDate = "January 1, 2026";

  const keyPrinciples = [
    {
      icon: Lock,
      title: "Bank-Grade Encryption",
      desc: "All transactions and personal records are encrypted with 256-bit SSL protocols."
    },
    {
      icon: Eye,
      title: "Zero Third-Party Selling",
      desc: "We never monetize, rent, or sell your personal details or bespoke measurements."
    },
    {
      icon: UserCheck,
      title: "Customer Control",
      desc: "Easily access, modify, or permanently request deletion of your atelier profile at any time."
    },
    {
      icon: Scale,
      title: "Statutory Compliance",
      desc: "Strict adherence to the Indian Digital Personal Data Protection Act (DPDPA 2023) and IT Act 2000."
    }
  ];

  const sections = [
    { id: "overview", label: "1. Overview & Commitment" },
    { id: "information-collected", label: "2. Information We Collect" },
    { id: "bespoke-measurements", label: "3. Bespoke Sizing & Fitting Data" },
    { id: "how-we-use", label: "4. How We Use Information" },
    { id: "concierge-channels", label: "5. WhatsApp & Concierge Communications" },
    { id: "sharing-disclosure", label: "6. Data Sharing & Third Parties" },
    { id: "security-retention", label: "7. Security, Retention & Rate Limits" },
    { id: "cookies", label: "8. Cookies & Local Storage" },
    { id: "your-rights", label: "9. Your Statutory Rights" },
    { id: "grievance-contact", label: "10. Grievance Officer & Contact" },
  ];

  return (
    <div className="w-full bg-[#FAF9F5] text-zinc-800 min-h-screen font-sans selection:bg-[#FF5E36]/20 selection:text-[#FF5E36]">
      {/* Decorative Atelier Backdrop */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000004_1px,transparent_1px),linear-gradient(to_bottom,#00000004_1px,transparent_1px)] bg-[size:36px_36px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[550px] h-[550px] rounded-full bg-[#FF5E36]/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-96 left-0 w-96 h-96 rounded-full bg-amber-500/5 blur-[100px] pointer-events-none" />

      {/* Header Banner */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-20 border-b border-zinc-200/70 bg-gradient-to-b from-white to-[#FAF9F5]">
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          
          {/* Breadcrumb Back Link */}
          <div className="flex items-center justify-between mb-8">
            <Link 
              href="/"
              className="group inline-flex items-center gap-2 text-[10px] tracking-widest uppercase font-bold text-[#FF5E36] hover:text-[#E04D27] transition-colors"
            >
              <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
              <span>Back to Atelier</span>
            </Link>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-400 font-semibold">
              <span>Legal</span>
              <span>✦</span>
              <span className="text-zinc-700">Privacy Policy</span>
            </div>
          </div>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FF5E36]/10 border border-[#FF5E36]/20 mb-4">
              <LotusIcon className="w-4 h-4 text-[#FF5E36]" />
              <span className="text-[10px] tracking-[0.25em] uppercase font-bold text-[#FF5E36]">
                Trust & Transparency
              </span>
            </div>
            
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-zinc-950 tracking-tight leading-[1.1] mb-5">
              Privacy Policy
            </h1>

            <p className="text-zinc-600 text-sm md:text-base font-light leading-relaxed mb-6">
              At JB51 Atelier, we treat your privacy with the same meticulous precision and devotion that we bring to our bespoke handloom creations. This document details how we collect, safeguard, and handle your personal data and couture fitting preferences.
            </p>

            <div className="flex flex-wrap items-center gap-4 text-[10px] tracking-wider uppercase text-zinc-500 font-bold pt-2 border-t border-zinc-200">
              <span className="inline-flex items-center gap-1.5">
                <Clock size={12} className="text-[#FF5E36]" />
                Last Revised: <strong className="text-zinc-800">{lastUpdated}</strong>
              </span>
              <span>·</span>
              <span>Effective Date: <strong className="text-zinc-800">{effectiveDate}</strong></span>
              <span>·</span>
              <span>Applicable: Storefront, WhatsApp Concierge & Atelier Services</span>
            </div>
          </div>

        </div>
      </section>

      {/* Main Content Layout */}
      <main className="max-w-6xl mx-auto px-6 py-16 relative z-10">
        
        {/* Core Principles Grid */}
        <section className="mb-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {keyPrinciples.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div 
                  key={idx}
                  className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-xs hover:border-[#FF5E36]/40 hover:shadow-md transition-all duration-300"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#FF5E36]/10 text-[#FF5E36] flex items-center justify-center mb-3">
                    <Icon size={18} />
                  </div>
                  <h3 className="font-serif text-sm font-bold text-zinc-900 mb-1">{item.title}</h3>
                  <p className="text-zinc-500 text-xs font-light leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Sticky Table of Contents */}
          <aside className="lg:col-span-4 sticky top-28 hidden lg:block">
            <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-zinc-100">
                <FileText size={16} className="text-[#FF5E36]" />
                <h2 className="text-xs uppercase tracking-widest font-bold text-zinc-900">
                  Contents Navigator
                </h2>
              </div>
              <nav className="flex flex-col space-y-1.5">
                {sections.map((sec) => (
                  <a
                    key={sec.id}
                    href={`#${sec.id}`}
                    className="text-xs text-zinc-600 hover:text-[#FF5E36] hover:bg-[#FF5E36]/5 px-3 py-2 rounded-xl transition-all font-medium flex items-center justify-between group"
                  >
                    <span>{sec.label}</span>
                    <span className="text-[10px] text-zinc-300 group-hover:text-[#FF5E36] transition-colors">✦</span>
                  </a>
                ))}
              </nav>

              {/* Quick Concierge Support Box */}
              <div className="mt-8 pt-6 border-t border-zinc-100">
                <div className="text-[10px] tracking-wider uppercase font-bold text-zinc-400 mb-2">
                  Need Immediate Clarification?
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed font-light mb-4">
                  Our privacy team and customer concierge are available on WhatsApp for any inquiries regarding your data.
                </p>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hello JB51 Atelier, I have a question regarding your Privacy Policy and my personal data.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-3 px-4 rounded-xl transition-all shadow-sm"
                >
                  <MessageCircle size={14} />
                  <span>Chat with Concierge</span>
                </a>
              </div>
            </div>
          </aside>

          {/* Right Column: Policy Document Body */}
          <article className="lg:col-span-8 bg-white border border-zinc-200/80 rounded-3xl p-8 sm:p-12 shadow-sm space-y-12 leading-relaxed text-zinc-700">

            {/* Section 1 */}
            <section id="overview" className="scroll-mt-32">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-7 h-7 rounded-lg bg-[#FF5E36]/10 text-[#FF5E36] font-bold text-xs flex items-center justify-center">1</span>
                <h2 className="font-serif text-2xl font-bold text-zinc-950">Overview & Our Commitment</h2>
              </div>
              <p className="text-sm font-light text-zinc-600 leading-relaxed mb-4">
                JB51 Clothing House (&ldquo;JB51 Atelier&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) operates the website <strong className="text-zinc-800">jb51.in</strong> and associated storefronts, mobile digital experiences, and concierge ordering channels. We specialize in luxury women&apos;s ethnic wear, handcrafted Banarasi and Chanderi suits, velvet ensembles, and custom-tailored silhouettes.
              </p>
              <p className="text-sm font-light text-zinc-600 leading-relaxed">
                We believe that bespoke craftsmanship requires unconditional mutual trust. This Privacy Policy informs you of our policies regarding the collection, use, disclosure, and protection of Personal Data when you browse our boutique, interact with our artisans, place bespoke orders, or communicate through WhatsApp or Instagram concierge lines.
              </p>
            </section>

            <div className="w-full h-px bg-zinc-100" />

            {/* Section 2 */}
            <section id="information-collected" className="scroll-mt-32">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-7 h-7 rounded-lg bg-[#FF5E36]/10 text-[#FF5E36] font-bold text-xs flex items-center justify-center">2</span>
                <h2 className="font-serif text-2xl font-bold text-zinc-950">Information We Collect</h2>
              </div>
              <p className="text-sm font-light text-zinc-600 leading-relaxed mb-4">
                Depending on how you interact with our atelier, we collect information in the following categories:
              </p>
              
              <div className="space-y-4 text-sm font-light">
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                  <h4 className="font-bold text-zinc-900 mb-1 text-xs uppercase tracking-wider">A. Identity & Contact Details</h4>
                  <p className="text-zinc-600 text-xs">
                    Your full name, mobile telephone number, email address, physical delivery address, billing address, and alternate contact numbers provided during consultation or checkout.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                  <h4 className="font-bold text-zinc-900 mb-1 text-xs uppercase tracking-wider">B. Order & Transaction Records</h4>
                  <p className="text-zinc-600 text-xs">
                    Details of pieces purchased, fabric customizations, invoices generated, payment method confirmation (cash, UPI, or online gateway reference IDs), and shipping fulfillment trackings. Note: We never directly store credit/debit card PINs or CVV numbers.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                  <h4 className="font-bold text-zinc-900 mb-1 text-xs uppercase tracking-wider">C. Customer Reviews & User-Submitted Media</h4>
                  <p className="text-zinc-600 text-xs leading-relaxed">
                    When you share your atelier experience, we collect your name, email, telephone number, numerical rating, written testimonial, geographic location, and Instagram handle. Any styling photographs or video clips you upload are processed through our secure media pipeline and held in an administrative moderation queue prior to public presentation.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                  <h4 className="font-bold text-zinc-900 mb-1 text-xs uppercase tracking-wider">D. Account Credentials & Session Tokens</h4>
                  <p className="text-zinc-600 text-xs leading-relaxed">
                    When you register an atelier profile, passwords are cryptographic one-way hashes (never stored in plain text). Authentication relies on cryptographically signed JSON Web Tokens (JWT access and refresh tokens) to maintain secure sessions across web and mobile storefronts.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                  <h4 className="font-bold text-zinc-900 mb-1 text-xs uppercase tracking-wider">E. Technical, Network & Security Telemetry</h4>
                  <p className="text-zinc-600 text-xs leading-relaxed">
                    IP address, reverse proxy headers, browser user-agent, operating system, endpoint interaction timestamps, and API diagnostic telemetry utilized to enforce multi-layered rate-limiting security barriers and protect platform availability.
                  </p>
                </div>
              </div>
            </section>

            <div className="w-full h-px bg-zinc-100" />

            {/* Section 3 */}
            <section id="bespoke-measurements" className="scroll-mt-32">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-7 h-7 rounded-lg bg-[#FF5E36]/10 text-[#FF5E36] font-bold text-xs flex items-center justify-center">3</span>
                <h2 className="font-serif text-2xl font-bold text-zinc-950">Bespoke Sizing & Fitting Data</h2>
              </div>
              <div className="p-5 rounded-2xl bg-[#FF5E36]/5 border border-[#FF5E36]/20 mb-4">
                <div className="flex items-center gap-2 mb-2 text-[#FF5E36] font-bold text-xs uppercase tracking-wider">
                  <Sparkles size={14} />
                  <span>The Karigar Custom Fitting Guarantee</span>
                </div>
                <p className="text-xs text-zinc-700 leading-relaxed font-light">
                  Because each suit is individually cut and finished by hand, our master tailors require specific anatomical dimensions to guarantee an exquisite fit.
                </p>
              </div>
              <p className="text-sm font-light text-zinc-600 leading-relaxed mb-3">
                When you request custom alterations, we record sizing parameters including but not limited to bust, waist, hip, shoulder width, sleeve length, kurta length, and neckline depth preferences.
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-zinc-600 font-light">
                <li>Measurement records are securely associated with your client account for complimentary adjustments and future bespoke orders.</li>
                <li>You may request complete purging of your sizing records by contacting our concierge at any time.</li>
                <li>Your anatomical measurements are strictly confidential and accessible solely by our cutting master and direct consultation personnel.</li>
              </ul>
            </section>

            <div className="w-full h-px bg-zinc-100" />

            {/* Section 4 */}
            <section id="how-we-use" className="scroll-mt-32">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-7 h-7 rounded-lg bg-[#FF5E36]/10 text-[#FF5E36] font-bold text-xs flex items-center justify-center">4</span>
                <h2 className="font-serif text-2xl font-bold text-zinc-950">How We Use Your Information</h2>
              </div>
              <p className="text-sm font-light text-zinc-600 leading-relaxed mb-4">
                We utilize your personal information strictly for legitimate commercial and artisanal objectives:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-light">
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>Fulfilling garment production, custom embroidery, and courier delivery.</span>
                </div>
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>Facilitating real-time status updates via WhatsApp and SMS notifications.</span>
                </div>
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>Managing customer reviews through an editorial moderation queue prior to public display.</span>
                </div>
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>Generating statutory GST tax invoices and maintaining customer ledgers in compliance with Indian commercial law.</span>
                </div>
              </div>
            </section>

            <div className="w-full h-px bg-zinc-100" />

            {/* Section 5 */}
            <section id="concierge-channels" className="scroll-mt-32">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-7 h-7 rounded-lg bg-[#FF5E36]/10 text-[#FF5E36] font-bold text-xs flex items-center justify-center">5</span>
                <h2 className="font-serif text-2xl font-bold text-zinc-950">WhatsApp & Concierge Communications</h2>
              </div>
              <p className="text-sm font-light text-zinc-600 leading-relaxed mb-3">
                A substantial portion of our customer service occurs via WhatsApp and Instagram Direct. When you reach out to our concierge numbers:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-xs text-zinc-600 font-light">
                <li>Conversations are protected by end-to-end encryption in transit by Meta/WhatsApp.</li>
                <li>Product images, fabric swatch photographs, and styling notes shared during consultations are stored exclusively in our secure customer relationship ledger.</li>
                <li>We do not enroll you in spam broadcast lists. Broadcast notifications for seasonal privileges are strictly opt-in and can be deactivated by texting &ldquo;STOP&rdquo; at any time.</li>
              </ul>
            </section>

            <div className="w-full h-px bg-zinc-100" />

            {/* Section 6 */}
            <section id="sharing-disclosure" className="scroll-mt-32">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-7 h-7 rounded-lg bg-[#FF5E36]/10 text-[#FF5E36] font-bold text-xs flex items-center justify-center">6</span>
                <h2 className="font-serif text-2xl font-bold text-zinc-950">Data Sharing & Third Parties</h2>
              </div>
              <p className="text-sm font-light text-zinc-600 leading-relaxed mb-4">
                We do not sell, rent, or trade your personal information. Data is shared exclusively with vetted service partners essential to executing our services:
              </p>
              <div className="space-y-3 text-xs font-light">
                <div className="p-3.5 rounded-xl border border-zinc-200">
                  <strong className="text-zinc-900 block mb-1">Logistics & Courier Partners:</strong>
                  We share your shipping address, contact name, and phone number with insured domestic and international courier partners (e.g., Blue Dart, Delhivery, DHL) solely to deliver your orders.
                </div>
                <div className="p-3.5 rounded-xl border border-zinc-200">
                  <strong className="text-zinc-900 block mb-1">Cloud Media & Visual Hosting (Cloudinary):</strong>
                  High-resolution product photography and approved customer review visuals (photos and styling clips) are hosted on Cloudinary with strict bandwidth, file size (max 15MB), and encryption controls.
                </div>
                <div className="p-3.5 rounded-xl border border-zinc-200">
                  <strong className="text-zinc-900 block mb-1">Payment Processors:</strong>
                  Online payments are processed by PCI-DSS certified gateway providers. Your financial account credentials do not pass through or reside on our servers.
                </div>
                <div className="p-3.5 rounded-xl border border-zinc-200">
                  <strong className="text-zinc-900 block mb-1">Statutory & Law Enforcement:</strong>
                  We may disclose information if required under Indian law or in response to lawful summons or court orders from authorized governmental authorities.
                </div>
              </div>
            </section>

            <div className="w-full h-px bg-zinc-100" />

            {/* Section 7 */}
            <section id="security-retention" className="scroll-mt-32">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-7 h-7 rounded-lg bg-[#FF5E36]/10 text-[#FF5E36] font-bold text-xs flex items-center justify-center">7</span>
                <h2 className="font-serif text-2xl font-bold text-zinc-950">Storage, Security & Rate Limiting</h2>
              </div>
              <p className="text-sm font-light text-zinc-600 leading-relaxed mb-3">
                All data collected is stored on secure cloud database clusters in high-availability data centers equipped with strict firewall barriers, automated threat detection, and encrypted backups.
              </p>
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 mb-4 text-xs font-light leading-relaxed">
                <strong className="text-zinc-900 block mb-1">Multi-Tiered Rate Limiting Protection:</strong>
                Our digital infrastructure employs automated global rate limiters, specialized tRPC procedure limiters, and upload throttling. These measures prevent unauthorized credential-stuffing, automated web scraping of bespoke patterns, and denial-of-service disruptions, ensuring reliable availability for our clients.
              </div>
              <p className="text-sm font-light text-zinc-600 leading-relaxed">
                We retain order, customer ledger, and invoice history for a statutory period of seven (7) years to comply with Indian commercial taxation and accounting laws. Browsing logs are purged after 90 days.
              </p>
            </section>

            <div className="w-full h-px bg-zinc-100" />

            {/* Section 8 */}
            <section id="cookies" className="scroll-mt-32">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-7 h-7 rounded-lg bg-[#FF5E36]/10 text-[#FF5E36] font-bold text-xs flex items-center justify-center">8</span>
                <h2 className="font-serif text-2xl font-bold text-zinc-950">Cookies & Local Storage</h2>
              </div>
              <p className="text-sm font-light text-zinc-600 leading-relaxed mb-3">
                We use cookies and browser local storage mechanisms (such as <code className="text-[#FF5E36] bg-zinc-100 px-1.5 py-0.5 rounded text-xs">jb51_wishlist</code>) to remember your preferences and provide a seamless browsing experience.
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-zinc-600 font-light">
                <li><strong>Essential Cookies:</strong> Required for site navigation, catalog filtering, and wishlisting.</li>
                <li><strong>Performance Cookies:</strong> Enable anonymous metrics to optimize page load speeds and visual asset rendering.</li>
                <li>You can manage or disable cookies in your browser settings, though certain custom atelier features may operate with reduced functionality.</li>
              </ul>
            </section>

            <div className="w-full h-px bg-zinc-100" />

            {/* Section 9 */}
            <section id="your-rights" className="scroll-mt-32">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-7 h-7 rounded-lg bg-[#FF5E36]/10 text-[#FF5E36] font-bold text-xs flex items-center justify-center">9</span>
                <h2 className="font-serif text-2xl font-bold text-zinc-950">Your Statutory Rights</h2>
              </div>
              <p className="text-sm font-light text-zinc-600 leading-relaxed mb-4">
                Under the Digital Personal Data Protection Act (DPDPA) and applicable privacy regulations, you possess the following rights regarding your personal information:
              </p>
              <div className="space-y-2 text-xs text-zinc-700 font-light">
                <p>✦ <strong>Right of Access:</strong> You may request a copy of all personal records and fitting notes stored with us.</p>
                <p>✦ <strong>Right of Rectification:</strong> You may correct inaccurate or obsolete contact or shipping details at any time.</p>
                <p>✦ <strong>Right of Erasure:</strong> You may instruct us to delete your client profile, subject to statutory tax retention guidelines.</p>
                <p>✦ <strong>Right to Withdraw Consent:</strong> You may revoke permission for promotional outreach at any time.</p>
              </div>
            </section>

            <div className="w-full h-px bg-zinc-100" />

            {/* Section 10 */}
            <section id="grievance-contact" className="scroll-mt-32">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-7 h-7 rounded-lg bg-[#FF5E36]/10 text-[#FF5E36] font-bold text-xs flex items-center justify-center">10</span>
                <h2 className="font-serif text-2xl font-bold text-zinc-950">Grievance Officer & Contact Details</h2>
              </div>
              <p className="text-sm font-light text-zinc-600 leading-relaxed mb-6">
                In accordance with the Information Technology Act 2000 and the Digital Personal Data Protection Act 2023, the details of our designated Grievance Officer are published below:
              </p>

              <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-4 text-xs font-light">
                <div>
                  <span className="text-[10px] tracking-widest uppercase font-bold text-[#FF5E36] block mb-0.5">Designated Officer</span>
                  <strong className="text-sm font-serif font-bold text-zinc-900 block">Nodal Officer & Data Protection Lead</strong>
                  <span className="text-zinc-500">JB51 Clothing House Private Limited</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-zinc-200/60">
                  <div className="flex items-start gap-2.5">
                    <MapPin size={16} className="text-[#FF5E36] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-zinc-900 block mb-0.5">Flagship Studio Address</strong>
                      <p className="text-zinc-600 leading-relaxed">
                        12, Heritage Villa, Banjara Hills<br />
                        Hyderabad, Telangana 500034, India
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Mail size={16} className="text-[#FF5E36] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-zinc-900 block mb-0.5">Electronic Communication</strong>
                      <p className="text-zinc-600">Email: concierge@jb51.in</p>
                      <p className="text-zinc-600">WhatsApp: +{WHATSAPP_NUMBER}</p>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-zinc-400 italic pt-2">
                  All formal data protection inquiries and grievance communications are acknowledged within 24 hours and resolved within 15 business days.
                </p>
              </div>
            </section>

          </article>
        </div>

      </main>

    </div>
  );
}
