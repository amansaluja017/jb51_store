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
  Award, 
  Scale,
  Cookie,
  UserCheck,
  RefreshCw,
  Globe,
  Server,
  Database
} from 'lucide-react';
import { WHATSAPP_NUMBER, SITE_URL, COMPANY_EMAIL } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Website Privacy Policy | JB51',
  description: 'Understand how JB51 collects, safeguards, and manages your personal information, bespoke sizing records, and web orders exclusively through our official website.',
  keywords: [
    'website privacy policy',
    'JB51 data protection',
    'luxury bespoke privacy',
    'e-commerce data security',
    'web cookie policy',
    'DPDPA 2023 compliance'
  ],
  alternates: {
    canonical: `${SITE_URL}/privacy-policy`,
  },
  openGraph: {
    title: 'Website Privacy Policy | JB51',
    description: 'Our commitment to protecting your personal information, sizing records, and web browsing privacy.',
    url: `${SITE_URL}/privacy-policy`,
    siteName: 'JB51',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Website Privacy Policy | JB51',
    description: 'Our commitment to protecting your personal information, sizing records, and web browsing privacy.',
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
  const lastUpdated = "October 29, 2026";
  const effectiveDate = "January 1, 2026";

  const keyPrinciples = [
    {
      icon: Lock,
      title: "Bank-Grade Web Encryption",
      desc: "All web browsing, customer accounts, and online checkouts are secured via TLS 1.3 and 256-bit SSL protocols."
    },
    {
      icon: Eye,
      title: "Zero Third-Party Selling",
      desc: "We never monetize, rent, or sell your personal details, browsing behavior, or bespoke fitting measurements."
    },
    {
      icon: UserCheck,
      title: "Client Data Sovereignty",
      desc: "Inspect, update, or permanently delete your web customer profile, wishlists, and custom sizing records upon request."
    },
    {
      icon: Scale,
      title: "Statutory Web Compliance",
      desc: "Full compliance with the Digital Personal Data Protection Act (DPDPA 2023) and Information Technology Act 2000."
    }
  ];

  const sections = [
    { id: "overview", label: "1. Website Scope & Commitment" },
    { id: "information-collected", label: "2. Information Collected via Website" },
    { id: "bespoke-measurements", label: "3. Bespoke Sizing & Custom Fitting" },
    { id: "how-we-use", label: "4. How We Utilize Your Data" },
    { id: "web-cookies", label: "5. Cookies & Browser Local Storage" },
    { id: "payment-security", label: "6. Online Payments & Checkout Security" },
    { id: "sharing-disclosure", label: "7. Third-Party Web Services & Logistics" },
    { id: "security-rate-limiting", label: "8. Web Infrastructure & Rate Limiting" },
    { id: "your-rights", label: "9. Your Statutory Rights (DPDPA)" },
    { id: "grievance-officer", label: "10. Nodal Grievance Officer & Contact" },
  ];

  return (
    <div className="w-full bg-[#FAF9F5] text-zinc-800 min-h-screen font-sans selection:bg-[#FF5E36]/20 selection:text-[#FF5E36]">
      {/* Decorative Backdrop */}
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
              <span>Back to Store</span>
            </Link>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-400 font-semibold">
              <span>Legal</span>
              <span>•</span>
              <span className="text-zinc-700">Website Privacy Policy</span>
            </div>
          </div>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FF5E36]/10 border border-[#FF5E36]/20 mb-4">
              <LotusIcon className="w-4 h-4 text-[#FF5E36]" />
              <span className="text-[10px] tracking-[0.25em] uppercase font-bold text-[#FF5E36]">
                E-Commerce Privacy Standard
              </span>
            </div>
            
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-zinc-950 tracking-tight leading-[1.1] mb-5">
              Website Privacy Policy
            </h1>

            <p className="text-zinc-600 text-sm md:text-base font-light leading-relaxed mb-6">
              Welcome to JB51. This policy explains how we collect, safeguard, and process your personal information, bespoke fitting parameters, and order details exclusively when you browse and purchase from our website storefront.
            </p>

            <div className="flex flex-wrap items-center gap-4 text-[10px] tracking-wider uppercase text-zinc-500 font-bold pt-2 border-t border-zinc-200">
              <span className="inline-flex items-center gap-1.5">
                <Clock size={12} className="text-[#FF5E36]" />
                Last Revised: <strong className="text-zinc-800">{lastUpdated}</strong>
              </span>
              <span>·</span>
              <span>Effective Date: <strong className="text-zinc-800">{effectiveDate}</strong></span>
              <span>·</span>
              <span>Web Storefront Governance</span>
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
                  Document Navigator
                </h2>
              </div>
              <nav className="flex flex-col space-y-1.5 max-h-[55vh] overflow-y-auto pr-1">
                {sections.map((sec) => (
                  <a
                    key={sec.id}
                    href={`#${sec.id}`}
                    className="text-xs text-zinc-600 hover:text-[#FF5E36] hover:bg-[#FF5E36]/5 px-3 py-2 rounded-xl transition-all font-medium flex items-center justify-between group"
                  >
                    <span>{sec.label}</span>
                    <span className="text-[10px] text-zinc-300 group-hover:text-[#FF5E36] transition-colors">•</span>
                  </a>
                ))}
              </nav>

              {/* Quick Concierge Support Box */}
              <div className="mt-8 pt-6 border-t border-zinc-100">
                <div className="text-[10px] tracking-wider uppercase font-bold text-zinc-400 mb-2">
                  Have a Data Privacy Question?
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed font-light mb-4">
                  Our privacy and concierge team is available to assist you with any questions regarding your personal records or fitting archives.
                </p>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hello JB51, I have a question regarding your Website Privacy Policy and my personal data.")}`}
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
                <h2 className="font-serif text-2xl font-bold text-zinc-950">Website Scope & Operational Commitment</h2>
              </div>
              <p className="text-sm font-light text-zinc-600 leading-relaxed mb-4">
                JB51 Clothing House (&ldquo;JB51&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) operates the e-commerce website <strong className="text-zinc-800">jb51.shop</strong>. Established with an artisanal heritage dating back to 1951, we specialize in luxury women&apos;s ethnic wear, handcrafted Punjabi suits, pure Chanderi silk co-ords, royal velvet edits, and custom-tailored occasion ensembles.
              </p>
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs font-light leading-relaxed mb-4">
                <strong className="text-zinc-900 block mb-1">Web-Exclusive Governance:</strong>
                This Privacy Policy applies solely to data collected through our public website storefront (<strong className="text-zinc-800">https://jb51.shop</strong>), our online catalog pages, web consultation forms, and web-directed email or WhatsApp inquiries. All customer transactions, account management, and digital browsing occur strictly through standard web browsers.
              </div>
              <p className="text-sm font-light text-zinc-600 leading-relaxed">
                We believe that artisanal luxury requires complete, uncompromised trust. This policy describes how we collect, handle, protect, and delete your personal information in accordance with applicable Indian laws, including the Digital Personal Data Protection Act, 2023 (DPDPA) and the Information Technology Act, 2000.
              </p>
            </section>

            <div className="w-full h-px bg-zinc-100" />

            {/* Section 2 */}
            <section id="information-collected" className="scroll-mt-32">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-7 h-7 rounded-lg bg-[#FF5E36]/10 text-[#FF5E36] font-bold text-xs flex items-center justify-center">2</span>
                <h2 className="font-serif text-2xl font-bold text-zinc-950">Information Collected via the Website</h2>
              </div>
              <p className="text-sm font-light text-zinc-600 leading-relaxed mb-4">
                When you navigate, register, or place an order on our website, we collect information within the following distinct categories:
              </p>
              
              <div className="space-y-4 text-sm font-light">
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                  <h4 className="font-bold text-zinc-900 mb-1 text-xs uppercase tracking-wider">A. Identity & Contact Details</h4>
                  <p className="text-zinc-600 text-xs leading-relaxed">
                    When you place an online order or contact our concierge via web forms, we collect your full legal name, telephone number, email address, shipping delivery address, billing address, and state/pin code.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                  <h4 className="font-bold text-zinc-900 mb-1 text-xs uppercase tracking-wider">B. Web Orders & Tax Invoicing</h4>
                  <p className="text-zinc-600 text-xs leading-relaxed">
                    Details of ensembles purchased, fabric variations, chosen sizes, statutory GST tax invoices generated, transaction reference IDs, and courier delivery tracking numbers. We never store credit or debit card numbers, CVVs, or bank account PINs on our website servers.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                  <h4 className="font-bold text-zinc-900 mb-1 text-xs uppercase tracking-wider">C. Customer Reviews & Visual Uploads</h4>
                  <p className="text-zinc-600 text-xs leading-relaxed">
                    If you submit a customer review on our website, we collect your name, rating, written feedback, optional city, and any styling photographs or video clips you choose to upload through our secure web browser upload pipeline. All customer reviews and media pass through an internal moderation queue before public display.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                  <h4 className="font-bold text-zinc-900 mb-1 text-xs uppercase tracking-wider">D. Web Account Credentials & Sessions</h4>
                  <p className="text-zinc-600 text-xs leading-relaxed">
                    For registered website customers, authentication relies on cryptographically hashed passwords (using one-way salted algorithms; never stored in plaintext) and securely signed JSON Web Tokens (JWT) transmitted over HTTPS to maintain authenticated web browser sessions.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                  <h4 className="font-bold text-zinc-900 mb-1 text-xs uppercase tracking-wider">E. Technical Web Telemetry & Server Logs</h4>
                  <p className="text-zinc-600 text-xs leading-relaxed">
                    To maintain website stability, performance, and cyber safety, our web servers automatically log incoming IP addresses, browser user-agents, operating systems, referring URLs, access timestamps, and HTTP response codes. This telemetry is strictly utilized for anti-fraud detection, automated rate-limiting, and DDoS mitigation.
                  </p>
                </div>
              </div>
            </section>

            <div className="w-full h-px bg-zinc-100" />

            {/* Section 3 */}
            <section id="bespoke-measurements" className="scroll-mt-32">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-7 h-7 rounded-lg bg-[#FF5E36]/10 text-[#FF5E36] font-bold text-xs flex items-center justify-center">3</span>
                <h2 className="font-serif text-2xl font-bold text-zinc-950">Bespoke Sizing & Custom Fitting</h2>
              </div>
              <div className="p-5 rounded-2xl bg-[#FF5E36]/5 border border-[#FF5E36]/20 mb-4">
                <div className="flex items-center gap-2 mb-2 text-[#FF5E36] font-bold text-xs uppercase tracking-wider">
                  <Award size={14} />
                  <span>The Master Karigar Guarantee</span>
                </div>
                <p className="text-xs text-zinc-700 leading-relaxed font-light">
                  Each bespoke ensemble is individually measured, hand-cut, and tailored by our master craftsmen. To guarantee an impeccable silhouette, we record custom measurement specifications.
                </p>
              </div>
              <p className="text-sm font-light text-zinc-600 leading-relaxed mb-3">
                When you request custom alterations on the website, we record anatomical dimensions including bust, waist, hip, shoulder width, sleeve length, kurta length, and neckline depth preferences.
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-zinc-600 font-light">
                <li>Measurement records are securely linked with your customer account for future bespoke orders and complimentary alterations.</li>
                <li>You may request complete removal of your sizing records by emailing our concierge at any time.</li>
                <li>Your anatomical measurements are strictly confidential and accessible solely by our cutting master and authorized atelier staff.</li>
              </ul>
            </section>

            <div className="w-full h-px bg-zinc-100" />

            {/* Section 4 */}
            <section id="how-we-use" className="scroll-mt-32">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-7 h-7 rounded-lg bg-[#FF5E36]/10 text-[#FF5E36] font-bold text-xs flex items-center justify-center">4</span>
                <h2 className="font-serif text-2xl font-bold text-zinc-950">How We Utilize Your Data</h2>
              </div>
              <p className="text-sm font-light text-zinc-600 leading-relaxed mb-4">
                We process your personal information strictly for legitimate commercial and artisanal objectives:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-light">
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>Fulfilling your online garment order, custom hand-embroidery, and insured parcel delivery.</span>
                </div>
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>Sending transactional order confirmations, dispatch notices, and tracking links via email or WhatsApp.</span>
                </div>
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>Generating statutory GST tax invoices and maintaining financial ledgers in compliance with Indian commercial law.</span>
                </div>
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>Moderating customer product reviews and styling photographs submitted via web forms prior to publication.</span>
                </div>
              </div>
            </section>

            <div className="w-full h-px bg-zinc-100" />

            {/* Section 5 */}
            <section id="web-cookies" className="scroll-mt-32">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-7 h-7 rounded-lg bg-[#FF5E36]/10 text-[#FF5E36] font-bold text-xs flex items-center justify-center">5</span>
                <h2 className="font-serif text-2xl font-bold text-zinc-950">Cookies & Browser Local Storage</h2>
              </div>
              <p className="text-sm font-light text-zinc-600 leading-relaxed mb-3">
                Our website utilizes standard browser cookies and Web Storage APIs (such as <code className="text-[#FF5E36] bg-zinc-100 px-1.5 py-0.5 rounded text-xs font-mono">localStorage</code>) to provide an effortless, high-performance shopping experience.
              </p>
              
              <div className="space-y-3 text-xs font-light mb-4">
                <div className="p-3.5 rounded-xl border border-zinc-200">
                  <strong className="text-zinc-900 block mb-1">Essential Web Cookies:</strong>
                  Necessary for website navigation, user authentication sessions, CSRF security verification, and checkout routing.
                </div>
                <div className="p-3.5 rounded-xl border border-zinc-200">
                  <strong className="text-zinc-900 block mb-1">Local Browser Storage (<code className="font-mono text-zinc-700">jb51_wishlist</code>):</strong>
                  Used to save your favorited suits and curated ensembles directly on your device&apos;s web browser without requiring mandatory login until you proceed to checkout.
                </div>
                <div className="p-3.5 rounded-xl border border-zinc-200">
                  <strong className="text-zinc-900 block mb-1">Performance & Analytics Telemetry:</strong>
                  Aggregated, non-personally identifiable metrics (such as page rendering latency and core web vitals) that help our engineering team optimize browsing speeds across desktop and mobile browsers.
                </div>
              </div>
              <p className="text-xs text-zinc-500 font-light leading-relaxed">
                You can configure your browser (Google Chrome, Apple Safari, Mozilla Firefox, Microsoft Edge) to refuse cookies or notify you when a cookie is placed. Note that disabling essential cookies may impact certain interactive features, such as preserving your shopping bag.
              </p>
            </section>

            <div className="w-full h-px bg-zinc-100" />

            {/* Section 6 */}
            <section id="payment-security" className="scroll-mt-32">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-7 h-7 rounded-lg bg-[#FF5E36]/10 text-[#FF5E36] font-bold text-xs flex items-center justify-center">6</span>
                <h2 className="font-serif text-2xl font-bold text-zinc-950">Online Payments & Checkout Security</h2>
              </div>
              <p className="text-sm font-light text-zinc-600 leading-relaxed mb-4">
                All financial transactions completed through our website are routed through certified, PCI-DSS Level 1 compliant payment gateway partners. 
              </p>
              <div className="space-y-3 text-xs font-light">
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 leading-relaxed">
                  <strong className="text-zinc-900 block mb-1">End-to-End Payment Tokenization:</strong>
                  Your sensitive payment information—including credit/debit card numbers, CVVs, and banking passwords—is encrypted directly by the payment processor and never touches, transits, or resides on JB51 servers.
                </div>
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 leading-relaxed">
                  <strong className="text-zinc-900 block mb-1">Supported Web Payment Methods:</strong>
                  We support Unified Payments Interface (UPI via Google Pay, PhonePe, Paytm, BHIM), major credit and debit cards (Visa, MasterCard, RuPay, American Express), Net Banking across all scheduled Indian commercial banks, and direct NEFT/RTGS bank transfers for bespoke commissions.
                </div>
              </div>
            </section>

            <div className="w-full h-px bg-zinc-100" />

            {/* Section 7 */}
            <section id="sharing-disclosure" className="scroll-mt-32">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-7 h-7 rounded-lg bg-[#FF5E36]/10 text-[#FF5E36] font-bold text-xs flex items-center justify-center">7</span>
                <h2 className="font-serif text-2xl font-bold text-zinc-950">Third-Party Web Services & Logistics</h2>
              </div>
              <p className="text-sm font-light text-zinc-600 leading-relaxed mb-4">
                We never monetize or trade your information. Data is shared exclusively with vetted technical and operational partners strictly required to fulfill your web orders:
              </p>
              <div className="space-y-3 text-xs font-light">
                <div className="p-3.5 rounded-xl border border-zinc-200">
                  <strong className="text-zinc-900 block mb-1">Courier & Logistics Providers:</strong>
                  Your recipient name, shipping address, and contact number are transmitted to our insured logistics partners (such as Blue Dart, Delhivery, and DHL Express) solely to transport and deliver your physical parcels.
                </div>
                <div className="p-3.5 rounded-xl border border-zinc-200">
                  <strong className="text-zinc-900 block mb-1">Cloud Media & Visual Storage (Cloudinary):</strong>
                  High-definition product photography and approved user-submitted styling images are hosted through Cloudinary using secure, encrypted Content Delivery Networks (CDNs) with strict file size limits (max 15MB) and mime-type verification.
                </div>
                <div className="p-3.5 rounded-xl border border-zinc-200">
                  <strong className="text-zinc-900 block mb-1">Statutory & Law Enforcement Compliance:</strong>
                  We may disclose personal records if required under applicable Indian laws, judicial orders, or lawful requests by statutory regulatory bodies.
                </div>
              </div>
            </section>

            <div className="w-full h-px bg-zinc-100" />

            {/* Section 8 */}
            <section id="security-rate-limiting" className="scroll-mt-32">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-7 h-7 rounded-lg bg-[#FF5E36]/10 text-[#FF5E36] font-bold text-xs flex items-center justify-center">8</span>
                <h2 className="font-serif text-2xl font-bold text-zinc-950">Web Infrastructure & Rate Limiting</h2>
              </div>
              <p className="text-sm font-light text-zinc-600 leading-relaxed mb-3">
                Our web storefront is deployed on enterprise cloud server clusters with strict firewall isolation, automated security auditing, and daily encrypted database backups.
              </p>
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 mb-4 text-xs font-light leading-relaxed">
                <strong className="text-zinc-900 block mb-1">Automated Rate Limiting Protection:</strong>
                To protect our clients and uphold server availability, our web infrastructure enforces multi-layered rate-limiting on search queries, authentication routes, and upload endpoints. This prevents automated web scraping of our proprietary suit designs, denial-of-service (DDoS) attempts, and brute-force credential attacks.
              </div>
              <p className="text-sm font-light text-zinc-600 leading-relaxed">
                Customer ledgers, completed orders, and GST invoices are retained for seven (7) years in accordance with Indian commercial taxation standards. Routine web access logs are purged after 90 days.
              </p>
            </section>

            <div className="w-full h-px bg-zinc-100" />

            {/* Section 9 */}
            <section id="your-rights" className="scroll-mt-32">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-7 h-7 rounded-lg bg-[#FF5E36]/10 text-[#FF5E36] font-bold text-xs flex items-center justify-center">9</span>
                <h2 className="font-serif text-2xl font-bold text-zinc-950">Your Statutory Rights (DPDPA 2023)</h2>
              </div>
              <p className="text-sm font-light text-zinc-600 leading-relaxed mb-4">
                Under the Indian Digital Personal Data Protection Act, 2023, you hold the following explicit rights regarding your digital information on our website:
              </p>
              <div className="space-y-2.5 text-xs text-zinc-700 font-light">
                <div className="flex items-start gap-2">
                  <span className="text-[#FF5E36] font-bold">•</span>
                  <p><strong>Right to Access:</strong> Request a digital summary of your personal details, order records, and stored sizing dimensions.</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#FF5E36] font-bold">•</span>
                  <p><strong>Right to Rectification:</strong> Update or correct outdated delivery addresses, phone numbers, or account information.</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#FF5E36] font-bold">•</span>
                  <p><strong>Right to Erasure:</strong> Instruct us to permanently delete your web customer profile, subject only to statutory GST invoice retention laws.</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#FF5E36] font-bold">•</span>
                  <p><strong>Right to Withdraw Consent:</strong> Unsubscribe from seasonal announcements or promotional emails at any time via one-click unsubscribe links.</p>
                </div>
              </div>
            </section>

            <div className="w-full h-px bg-zinc-100" />

            {/* Section 10 */}
            <section id="grievance-officer" className="scroll-mt-32">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-7 h-7 rounded-lg bg-[#FF5E36]/10 text-[#FF5E36] font-bold text-xs flex items-center justify-center">10</span>
                <h2 className="font-serif text-2xl font-bold text-zinc-950">Nodal Grievance Officer & Contact</h2>
              </div>
              <p className="text-sm font-light text-zinc-600 leading-relaxed mb-6">
                In compliance with the Information Technology Act 2000 and the Digital Personal Data Protection Act 2023, the contact details of our designated Nodal Grievance Officer for website privacy matters are published below:
              </p>

              <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-4 text-xs font-light">
                <div>
                  <span className="text-[10px] tracking-widest uppercase font-bold text-[#FF5E36] block mb-0.5">Designated Officer</span>
                  <strong className="text-sm font-serif font-bold text-zinc-900 block">Nodal Privacy & Data Protection Officer</strong>
                  <span className="text-zinc-500">JB51 Clothing House Private Limited</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-zinc-200/60">
                  <div className="flex items-start gap-2.5">
                    <MapPin size={16} className="text-[#FF5E36] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-zinc-900 block mb-0.5">Flagship Studio & Atelier</strong>
                      <p className="text-zinc-600 leading-relaxed">
                        JB51 Clothing House<br />
                        Model Town, Kaithal<br />
                        Haryana 136027, India
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Mail size={16} className="text-[#FF5E36] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-zinc-900 block mb-0.5">Direct Electronic Communications</strong>
                      <p className="text-zinc-600">Email: {COMPANY_EMAIL}</p>
                      <p className="text-zinc-600">Concierge Desk: +{WHATSAPP_NUMBER}</p>
                      <p className="text-zinc-600">Hours: Mon – Sat, 10:00 AM – 7:00 PM IST</p>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-zinc-400 italic pt-2">
                  All formal data protection inquiries, access requests, or grievance communications received via our website are officially acknowledged within 24 hours and addressed within 15 working days.
                </p>
              </div>
            </section>

          </article>
        </div>

      </main>

    </div>
  );
}
