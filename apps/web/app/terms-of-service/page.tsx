import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  FileText, 
  ShieldCheck, 
  Sparkles, 
  Award, 
  Truck, 
  RefreshCw, 
  Scale, 
  AlertCircle, 
  Clock, 
  ArrowLeft,
  Mail,
  MessageCircle,
  MapPin,
  CheckCircle2,
  Globe,
  Lock,
  Scissors
} from 'lucide-react';
import { WHATSAPP_NUMBER, SITE_URL, COMPANY_EMAIL } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Website Terms of Service & Conditions | JB51',
  description: 'Read the official terms of service, bespoke tailoring standards, payment rules, shipping policies, and website terms of conditions governing your use of jb51.shop.',
  keywords: [
    'terms of service',
    'terms of conditions',
    'website terms and conditions',
    'JB51 boutique terms',
    'bespoke tailoring policy',
    'e-commerce shipping returns'
  ],
  alternates: {
    canonical: `${SITE_URL}/terms-of-service`,
  },
  openGraph: {
    title: 'Website Terms of Service & Conditions | JB51',
    description: 'Terms of conditions governing your engagement with our web storefront, bespoke orders, and concierge services.',
    url: `${SITE_URL}/terms-of-service`,
    siteName: 'JB51',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Website Terms of Service & Conditions | JB51',
    description: 'Terms of conditions governing your engagement with our web storefront, bespoke orders, and concierge services.',
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

export default function TermsOfServicePage() {
  const lastUpdated = "October 29, 2026";
  const effectiveDate = "January 1, 2026";

  const keyHighlights = [
    {
      icon: Award,
      title: "Artisanal Integrity",
      desc: "Authentic handloom silks, raw Chanderi, and master zardozi embroidery with heritage Punjabi tailoring."
    },
    {
      icon: Scale,
      title: "Transparent Web Pricing",
      desc: "All catalog prices in INR inclusive of statutory GST with official itemized tax invoices on every order."
    },
    {
      icon: Scissors,
      title: "Custom Fitting Guarantee",
      desc: "Generous 1.5-inch inner seam margins and complimentary tailoring alteration on bespoke commissions."
    },
    {
      icon: Lock,
      title: "Protected Web Checkout",
      desc: "Secure SSL encrypted web checkout, authenticated sessions, and zero storage of payment card credentials."
    }
  ];

  const sections = [
    { id: "acceptance", label: "1. Acceptance of Website Terms" },
    { id: "artisanal-nature", label: "2. Handcrafted Fabric & Display Fidelity" },
    { id: "bespoke-tailoring", label: "3. Bespoke Sizing & Alterations" },
    { id: "pricing-payment", label: "4. Web Orders, Pricing & Taxes (GST)" },
    { id: "web-payments", label: "5. Online Payment Processing" },
    { id: "shipping-delivery", label: "6. Shipping & Delivery Timelines" },
    { id: "returns-exchanges", label: "7. Exchanges, Returns & Cancellations" },
    { id: "garment-care", label: "8. Garment Care & Fabric Longevity" },
    { id: "intellectual-property", label: "9. Website Intellectual Property & Copying" },
    { id: "cyber-security", label: "10. Fair Use, Anti-Scraping & Rate Limits" },
    { id: "customer-reviews", label: "11. Customer Reviews & User Media" },
    { id: "limitation-liability", label: "12. Limitation of Liability & Disclaimers" },
    { id: "governing-law", label: "13. Governing Law & Jurisdiction" },
    { id: "concierge-contact", label: "14. Studio & Concierge Contact" },
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
              <span className="text-zinc-700">Terms of Service & Conditions</span>
            </div>
          </div>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FF5E36]/10 border border-[#FF5E36]/20 mb-4">
              <LotusIcon className="w-4 h-4 text-[#FF5E36]" />
              <span className="text-[10px] tracking-[0.25em] uppercase font-bold text-[#FF5E36]">
                Website Terms of Service & Conditions
              </span>
            </div>
            
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-zinc-950 tracking-tight leading-[1.1] mb-5">
              Terms & Conditions
            </h1>

            <p className="text-zinc-600 text-sm md:text-base font-light leading-relaxed mb-6">
              Welcome to JB51. These Terms of Service and Conditions govern your access to, browsing of, and online purchases made exclusively through our website storefront, digital lookbooks, and web concierge channels.
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
        
        {/* Core Highlights Grid */}
        <section className="mb-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {keyHighlights.map((item, idx) => {
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
                  Terms Navigator
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
                  Have an Order Question?
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed font-light mb-4">
                  Our bespoke tailoring concierge is available to guide you on sizing, delivery dates, and custom specifications.
                </p>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hello JB51, I have a question regarding your Website Terms of Service and an upcoming order.")}`}
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

          {/* Right Column: Terms Document Body */}
          <article className="lg:col-span-8 bg-white border border-zinc-200/80 rounded-3xl p-8 sm:p-12 shadow-sm space-y-12 leading-relaxed text-zinc-700">

            {/* Section 1 */}
            <section id="acceptance" className="scroll-mt-32">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-7 h-7 rounded-lg bg-[#FF5E36]/10 text-[#FF5E36] font-bold text-xs flex items-center justify-center">1</span>
                <h2 className="font-serif text-2xl font-bold text-zinc-950">Acceptance of Website Terms</h2>
              </div>
              <p className="text-sm font-light text-zinc-600 leading-relaxed mb-4">
                By accessing, browsing, registering an account on, or purchasing through the website <strong className="text-zinc-800">jb51.shop</strong> (&ldquo;Website&rdquo;), you acknowledge that you have read, understood, and agreed to be legally bound by these Terms of Service and Conditions (&ldquo;Terms&rdquo;).
              </p>
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs font-light leading-relaxed mb-4">
                <strong className="text-zinc-900 block mb-1">Web-Exclusive Agreement:</strong>
                These Terms govern exclusively your interaction with our online e-commerce website storefront, web checkouts, and web-directed concierge communications. If you do not agree with any provision of these Terms, you must immediately discontinue use of the Website.
              </div>
              <p className="text-sm font-light text-zinc-600 leading-relaxed">
                These Terms constitute a legally enforceable electronic contract under the provisions of the Information Technology Act, 2000 and the Indian Contract Act, 1872 between you (&ldquo;User&rdquo;, &ldquo;Client&rdquo;, or &ldquo;Patron&rdquo;) and JB51 Clothing House Private Limited (&ldquo;JB51&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;).
              </p>
            </section>

            <div className="w-full h-px bg-zinc-100" />

            {/* Section 2 */}
            <section id="artisanal-nature" className="scroll-mt-32">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-7 h-7 rounded-lg bg-[#FF5E36]/10 text-[#FF5E36] font-bold text-xs flex items-center justify-center">2</span>
                <h2 className="font-serif text-2xl font-bold text-zinc-950">Handcrafted Fabric & Display Fidelity</h2>
              </div>
              <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 mb-4">
                <div className="flex items-center gap-2 mb-2 text-amber-700 font-bold text-xs uppercase tracking-wider">
                  <Award size={14} />
                  <span>The Hallmark of Authentic Craftsmanship</span>
                </div>
                <p className="text-xs text-zinc-700 leading-relaxed font-light">
                  Our luxury suits are cut from pure handloom silks, raw Chanderi, bespoke micro-velvet, and embellished with authentic zardozi, gotta-patti, and tilla handwork.
                </p>
              </div>
              <p className="text-sm font-light text-zinc-600 leading-relaxed mb-3">
                Clients shopping on our website should note the intrinsic characteristics of handcrafted luxury textiles:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-xs text-zinc-600 font-light">
                <li><strong>Weave Nuances:</strong> Hand-woven fabrics naturally feature subtle thread variations (slubs), micro-knotting, and slight weave alignment nuances. These are signatures of authentic artisan weaving, not manufacturing defects.</li>
                <li><strong>Monitor & Color Calibration:</strong> While we photograph our garments under calibrated natural daylight conditions in our studio, exact color tones may exhibit slight variations based on your individual computer monitor, browser profile, or mobile device screen calibration.</li>
                <li><strong>Artisanal Dyes:</strong> Natural vegetable tints and organic dyes may release slight excess pigment during initial professional dry cleans, which is normal for unadulterated heritage fabrics.</li>
              </ul>
            </section>

            <div className="w-full h-px bg-zinc-100" />

            {/* Section 3 */}
            <section id="bespoke-tailoring" className="scroll-mt-32">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-7 h-7 rounded-lg bg-[#FF5E36]/10 text-[#FF5E36] font-bold text-xs flex items-center justify-center">3</span>
                <h2 className="font-serif text-2xl font-bold text-zinc-950">Bespoke Sizing & Alterations</h2>
              </div>
              <p className="text-sm font-light text-zinc-600 leading-relaxed mb-4">
                JB51 provides complimentary custom sizing options on our website for select bespoke designs:
              </p>
              <div className="space-y-3 text-xs font-light">
                <div className="p-3.5 rounded-xl border border-zinc-200">
                  <strong className="text-zinc-900 block mb-1">Measurement Accuracy:</strong>
                  Clients are responsible for the accuracy of custom sizing parameters submitted through our web forms. Our tailoring concierge is available via WhatsApp to guide you on standard measuring protocols prior to fabric cutting.
                </div>
                <div className="p-3.5 rounded-xl border border-zinc-200">
                  <strong className="text-zinc-900 block mb-1">Inner Tailoring Seam Margins:</strong>
                  All bespoke kurtas, bottoms, and lehengas are crafted with a generous 1.5-inch inner seam margin to allow effortless future adjustments should your fit preferences change.
                </div>
                <div className="p-3.5 rounded-xl border border-zinc-200">
                  <strong className="text-zinc-900 block mb-1">Complimentary Alteration Guarantee:</strong>
                  If a custom-made suit does not achieve your desired fit upon delivery, we provide one complimentary round of alteration at our atelier. Courier pick-up and return for alterations is coordinated directly by our concierge.
                </div>
              </div>
            </section>

            <div className="w-full h-px bg-zinc-100" />

            {/* Section 4 */}
            <section id="pricing-payment" className="scroll-mt-32">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-7 h-7 rounded-lg bg-[#FF5E36]/10 text-[#FF5E36] font-bold text-xs flex items-center justify-center">4</span>
                <h2 className="font-serif text-2xl font-bold text-zinc-950">Web Orders, Pricing & Taxes (GST)</h2>
              </div>
              <ul className="list-disc pl-5 space-y-2 text-xs text-zinc-600 font-light">
                <li><strong>All-Inclusive Transparent Pricing:</strong> All prices displayed on <strong className="text-zinc-800">jb51.shop</strong> are quoted in Indian National Rupees (INR ₹) and are inclusive of Goods and Services Tax (GST). Official itemized GST invoices detailing CGST, SGST, or IGST based on destination state codes are issued with each parcel.</li>
                <li><strong>Web Stock Hold & Inventory Reservations:</strong> When an online checkout is initiated, our inventory system holds the garment units as reserved stock for the duration of the active web checkout session. Unfinished sessions automatically release the units back to general stock.</li>
                <li><strong>Made-to-Measure Commissions:</strong> Bespoke commissions begin artisanal cutting and hand-embroidery only after successful receipt of full online payment or an agreed bespoke advance booking deposit.</li>
                <li><strong>Typographical or Pricing Errors:</strong> In the rare event an ensemble is inadvertently listed at an incorrect price due to a system glitch or typographical error, JB51 reserves the right to decline or cancel the affected order and issue an immediate full refund.</li>
              </ul>
            </section>

            <div className="w-full h-px bg-zinc-100" />

            {/* Section 5 */}
            <section id="web-payments" className="scroll-mt-32">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-7 h-7 rounded-lg bg-[#FF5E36]/10 text-[#FF5E36] font-bold text-xs flex items-center justify-center">5</span>
                <h2 className="font-serif text-2xl font-bold text-zinc-950">Online Payment Processing</h2>
              </div>
              <p className="text-sm font-light text-zinc-600 leading-relaxed mb-4">
                Our website integrates with certified, PCI-DSS Level 1 compliant payment gateways to process all digital transactions securely.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-light">
                <div className="p-3.5 rounded-xl border border-zinc-200">
                  <strong className="text-zinc-900 block mb-1">Instant Digital UPI:</strong>
                  Google Pay, PhonePe, Paytm, BHIM, and any bank-supported UPI QR web flow.
                </div>
                <div className="p-3.5 rounded-xl border border-zinc-200">
                  <strong className="text-zinc-900 block mb-1">Cards & Net Banking:</strong>
                  Major domestic and international Visa, MasterCard, RuPay, and Net Banking across all scheduled banks.
                </div>
                <div className="p-3.5 rounded-xl border border-zinc-200">
                  <strong className="text-zinc-900 block mb-1">Zero Financial Card Storage:</strong>
                  Credit/debit card credentials are tokenized directly with the banking gateway and never pass through our website database.
                </div>
                <div className="p-3.5 rounded-xl border border-zinc-200">
                  <strong className="text-zinc-900 block mb-1">Bank Transfers (NEFT/RTGS):</strong>
                  Accepted for bespoke bridal and high-value custom ensemble orders with verification through our concierge.
                </div>
              </div>
            </section>

            <div className="w-full h-px bg-zinc-100" />

            {/* Section 6 */}
            <section id="shipping-delivery" className="scroll-mt-32">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-7 h-7 rounded-lg bg-[#FF5E36]/10 text-[#FF5E36] font-bold text-xs flex items-center justify-center">6</span>
                <h2 className="font-serif text-2xl font-bold text-zinc-950">Shipping & Delivery Timelines</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-light mb-4">
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200">
                  <h4 className="font-bold text-zinc-900 mb-1 uppercase tracking-wider text-[11px]">Ready-to-Wear Pieces</h4>
                  <p className="text-zinc-600">
                    Dispatched within 2 to 3 business days. Estimated domestic doorstep delivery is 3–6 business days depending on delivery pin code.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200">
                  <h4 className="font-bold text-zinc-900 mb-1 uppercase tracking-wider text-[11px]">Bespoke Made-to-Order Pieces</h4>
                  <p className="text-zinc-600">
                    Requires 15 to 20 business days of artisanal cutting, hand-embroidery, and master finishing prior to quality inspection and dispatch.
                  </p>
                </div>
              </div>
              <p className="text-xs text-zinc-600 font-light leading-relaxed">
                <strong>International Web Orders:</strong> We ship worldwide via DHL Express and FedEx. Clients are responsible for any statutory import duties, customs tariffs, or local clearance assessments levied by the destination country&apos;s customs authorities.
              </p>
            </section>

            <div className="w-full h-px bg-zinc-100" />

            {/* Section 7 */}
            <section id="returns-exchanges" className="scroll-mt-32">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-7 h-7 rounded-lg bg-[#FF5E36]/10 text-[#FF5E36] font-bold text-xs flex items-center justify-center">7</span>
                <h2 className="font-serif text-2xl font-bold text-zinc-950">Exchanges, Returns & Cancellations</h2>
              </div>
              <p className="text-sm font-light text-zinc-600 leading-relaxed mb-4">
                Given the luxury artisanal craftsmanship of our ensembles, our return parameters are outlined below:
              </p>
              
              <div className="space-y-3 text-xs font-light">
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200">
                  <h4 className="font-bold text-zinc-900 mb-1">Standard Ready-to-Wear (7-Day Exchange Window)</h4>
                  <p className="text-zinc-600 leading-relaxed">
                    Unaltered standard sized garments (XS, S, M, L, XL) are eligible for an exchange or store credit within seven (7) days of delivery. Ensembles must be unworn, unwashed, unaltered, and returned in their original packaging with all security tags intact.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200/60">
                  <h4 className="font-bold text-rose-900 mb-1">Bespoke & Custom Sized Pieces (Final Sale, Free Alteration)</h4>
                  <p className="text-rose-800 leading-relaxed">
                    Suits tailored to custom anatomical dimensions, specialized neckline depths, or bespoke lengths are crafted exclusively for you and are non-refundable. They are fully protected by our Complimentary Alteration Guarantee.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200">
                  <h4 className="font-bold text-zinc-900 mb-1">Transit Damage or Packaging Tampering</h4>
                  <p className="text-zinc-600 leading-relaxed">
                    In the improbable event an ensemble arrives damaged, please notify our concierge within 48 hours of parcel receipt with unboxing photos or video documentation. We will immediately arrange courier collection and priority replacement.
                  </p>
                </div>
              </div>
            </section>

            <div className="w-full h-px bg-zinc-100" />

            {/* Section 8 */}
            <section id="garment-care" className="scroll-mt-32">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-7 h-7 rounded-lg bg-[#FF5E36]/10 text-[#FF5E36] font-bold text-xs flex items-center justify-center">8</span>
                <h2 className="font-serif text-2xl font-bold text-zinc-950">Garment Care & Fabric Longevity</h2>
              </div>
              <p className="text-sm font-light text-zinc-600 leading-relaxed mb-3">
                All JB51 handcrafted pieces are delicate heirloom textiles:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-zinc-600 font-light">
                <li><strong>Strictly Professional Dry Clean Only:</strong> Handloom silks, organza dupattas, and micro-velvet garments must never be machine-washed or water-soaked.</li>
                <li><strong>Storage Protocol:</strong> Store garments in breathable cotton muslin covers away from damp environments. Avoid spraying perfumes directly on metallic zardozi threads.</li>
                <li>JB51 cannot accept liability for fabric shrinkage, thread pulling, or discoloration resulting from domestic home washing or disregard of care instructions.</li>
              </ul>
            </section>

            <div className="w-full h-px bg-zinc-100" />

            {/* Section 9 */}
            <section id="intellectual-property" className="scroll-mt-32">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-7 h-7 rounded-lg bg-[#FF5E36]/10 text-[#FF5E36] font-bold text-xs flex items-center justify-center">9</span>
                <h2 className="font-serif text-2xl font-bold text-zinc-950">Website Intellectual Property & Copyright</h2>
              </div>
              <p className="text-sm font-light text-zinc-600 leading-relaxed mb-3">
                All content published on <strong className="text-zinc-800">jb51.shop</strong>—including garment silhouette designs, embroidery motifs, product photography, editorial lookbooks, website copy, layout architecture, logos, and the JB51 trademark—is the exclusive intellectual property of JB51 Clothing House Private Limited.
              </p>
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs font-light leading-relaxed">
                <strong className="text-zinc-900 block mb-1">Strict Prohibition of Commercial Scraping:</strong>
                Commercial reproduction, unauthorized duplication, digital scraping, or re-hosting of our visual assets without prior written consent from JB51 is strictly prohibited and subject to legal action under the Indian Copyright Act, 1957 and Trade Marks Act, 1999.
              </div>
            </section>

            <div className="w-full h-px bg-zinc-100" />

            {/* Section 10 */}
            <section id="cyber-security" className="scroll-mt-32">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-7 h-7 rounded-lg bg-[#FF5E36]/10 text-[#FF5E36] font-bold text-xs flex items-center justify-center">10</span>
                <h2 className="font-serif text-2xl font-bold text-zinc-950">Fair Use, Anti-Scraping & Rate Limits</h2>
              </div>
              <p className="text-sm font-light text-zinc-600 leading-relaxed mb-3">
                To guarantee optimal browsing speeds, uninterrupted service, and cyber security for all visitors:
              </p>
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs font-light leading-relaxed space-y-2">
                <p>
                  <strong>No Automated Bots or Crawlers:</strong> Automated scrapers, indexing bots, data extraction scripts, and unauthorized stress-testing of our website or API endpoints are strictly forbidden.
                </p>
                <p>
                  <strong>Enforced Multi-Tier Rate Limiting:</strong> Our web infrastructure enforces real-time rate limiting across search queries, product views, and cart operations. Attempts to bypass security controls or initiate denial-of-service (DoS) attacks will result in immediate IP blacklisting and statutory reporting under Section 66 of the Information Technology Act, 2000.
                </p>
              </div>
            </section>

            <div className="w-full h-px bg-zinc-100" />

            {/* Section 11 */}
            <section id="customer-reviews" className="scroll-mt-32">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-7 h-7 rounded-lg bg-[#FF5E36]/10 text-[#FF5E36] font-bold text-xs flex items-center justify-center">11</span>
                <h2 className="font-serif text-2xl font-bold text-zinc-950">Customer Reviews & User Media</h2>
              </div>
              <p className="text-sm font-light text-zinc-600 leading-relaxed mb-3">
                When you submit product testimonials, written reviews, or outfit styling photographs/videos through our website forms:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-zinc-600 font-light">
                <li>You warrant that you own or have obtained all necessary legal rights to submit the uploaded media.</li>
                <li>You grant JB51 a non-exclusive, royalty-free, perpetual license to display approved reviews and styling visuals across our website storefront.</li>
                <li>All submissions undergo administrative moderation to prevent spam, offensive content, or copyright violations before publication.</li>
              </ul>
            </section>

            <div className="w-full h-px bg-zinc-100" />

            {/* Section 12 */}
            <section id="limitation-liability" className="scroll-mt-32">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-7 h-7 rounded-lg bg-[#FF5E36]/10 text-[#FF5E36] font-bold text-xs flex items-center justify-center">12</span>
                <h2 className="font-serif text-2xl font-bold text-zinc-950">Limitation of Liability & Disclaimers</h2>
              </div>
              <p className="text-sm font-light text-zinc-600 leading-relaxed mb-3">
                The Website is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis. To the maximum extent permitted under applicable law, JB51 disclaims all warranties, express or implied.
              </p>
              <p className="text-sm font-light text-zinc-600 leading-relaxed mb-3">
                In no event shall JB51, its directors, artisans, or employees be liable for any indirect, incidental, punitive, or consequential damages arising from the use of the Website. Our maximum aggregate liability for any claim arising from an order placed through this Website shall strictly not exceed the total amount paid by you for the specific garment.
              </p>
              <p className="text-xs text-zinc-500 font-light leading-relaxed">
                <strong>Force Majeure:</strong> JB51 shall not be held liable for delivery delays or performance failure caused by events beyond reasonable control, including natural catastrophes, severe weather, regional transport strikes, raw silk embargoes, or statutory transit restrictions.
              </p>
            </section>

            <div className="w-full h-px bg-zinc-100" />

            {/* Section 13 */}
            <section id="governing-law" className="scroll-mt-32">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-7 h-7 rounded-lg bg-[#FF5E36]/10 text-[#FF5E36] font-bold text-xs flex items-center justify-center">13</span>
                <h2 className="font-serif text-2xl font-bold text-zinc-950">Governing Law & Legal Jurisdiction</h2>
              </div>
              <p className="text-sm font-light text-zinc-600 leading-relaxed">
                These Website Terms of Service & Conditions shall be governed by, interpreted, and construed in accordance with the substantive laws of the Republic of India. Any legal action, dispute, or proceeding arising out of or related to website orders or website access shall be subject to the exclusive jurisdiction of the competent courts in <strong className="text-zinc-800">Kaithal, Haryana, India</strong>.
              </p>
            </section>

            <div className="w-full h-px bg-zinc-100" />

            {/* Section 14 */}
            <section id="concierge-contact" className="scroll-mt-32">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-7 h-7 rounded-lg bg-[#FF5E36]/10 text-[#FF5E36] font-bold text-xs flex items-center justify-center">14</span>
                <h2 className="font-serif text-2xl font-bold text-zinc-950">Studio & Concierge Contact</h2>
              </div>
              <p className="text-sm font-light text-zinc-600 leading-relaxed mb-6">
                For questions regarding these Website Terms, bespoke orders, or fit consultations, please contact our team:
              </p>

              <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-4 text-xs font-light">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <MessageCircle size={16} className="text-[#FF5E36] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-zinc-900 block mb-0.5">Direct Web Concierge</strong>
                      <p className="text-zinc-600">WhatsApp: +{WHATSAPP_NUMBER}</p>
                      <p className="text-zinc-600">Email: {COMPANY_EMAIL}</p>
                      <p className="text-zinc-600">Hours: Mon – Sat, 10:00 AM – 7:00 PM IST</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

          </article>
        </div>

      </main>

    </div>
  );
}
