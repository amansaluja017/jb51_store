import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  FileText, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Award, 
  Scale, 
  Scissors, 
  Truck, 
  RefreshCw, 
  ShieldAlert, 
  MessageCircle, 
  Mail, 
  MapPin,
  HelpCircle,
  Gem
} from 'lucide-react';
import { WHATSAPP_NUMBER, SITE_URL } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Terms of Service | JB51',
  description: 'Review the terms and conditions governing the purchase of handcrafted ensembles, bespoke tailoring services, and concierge orders at JB51.',
  keywords: ['terms of service', 'JB51 terms and conditions', 'bespoke tailoring policy', 'couture return policy'],
  alternates: {
    canonical: `${SITE_URL}/terms-of-service`,
  },
  openGraph: {
    title: 'Terms of Service | JB51',
    description: 'Guidelines, artisanal craftsmanship standards, and purchase terms for JB51.',
    url: `${SITE_URL}/terms-of-service`,
    siteName: 'JB51',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Terms of Service | JB51',
    description: 'Guidelines, artisanal craftsmanship standards, and purchase terms for JB51.',
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
  const lastUpdated = "October 22, 2026";
  const effectiveDate = "January 1, 2026";

  const keyHighlights = [
    {
      icon: Gem,
      title: "Artisanal Integrity",
      desc: "Each ensemble is handwoven and embroidered; subtle variations in weave and dye celebrate authentic handcraft."
    },
    {
      icon: Scissors,
      title: "Bespoke Guarantee",
      desc: "Complimentary sizing adjustments on all custom-tailored suits to ensure an impeccable fit."
    },
    {
      icon: Truck,
      title: "Insured Transit",
      desc: "Complimentary insured express delivery across India on milestone orders, with worldwide shipping available."
    },
    {
      icon: Scale,
      title: "Transparent Terms",
      desc: "Clear policies on exchanges, cancellations, and statutory consumer rights under Indian law."
    }
  ];

  const sections = [
    { id: "acceptance", label: "1. Acceptance of Terms" },
    { id: "artisanal-nature", label: "2. Handcrafted & Textile Characteristics" },
    { id: "bespoke-tailoring", label: "3. Bespoke Sizing & Alterations" },
    { id: "pricing-payment", label: "4. Pricing, Taxes & Reservations" },
    { id: "shipping-delivery", label: "5. Shipping, Timelines & Customs" },
    { id: "returns-exchanges", label: "6. Exchange & Return Policy" },
    { id: "garment-care", label: "7. Garment Care & Warranty" },
    { id: "intellectual-property", label: "8. Intellectual Property & Reviews" },
    { id: "client-conduct", label: "9. Platform Integrity & Conduct" },
    { id: "limitation-liability", label: "10. Limitation of Liability & Force Majeure" },
    { id: "governing-law", label: "11. Governing Law & Jurisdiction" },
    { id: "concierge-contact", label: "12. Concierge Contact Information" },
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
              <span className="text-zinc-700">Terms of Service</span>
            </div>
          </div>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FF5E36]/10 border border-[#FF5E36]/20 mb-4">
              <LotusIcon className="w-4 h-4 text-[#FF5E36]" />
              <span className="text-[10px] tracking-[0.25em] uppercase font-bold text-[#FF5E36]">
                Client Service Agreement
              </span>
            </div>
            
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-zinc-950 tracking-tight leading-[1.1] mb-5">
              Terms of Service
            </h1>

            <p className="text-zinc-600 text-sm md:text-base font-light leading-relaxed mb-6">
              Welcome to JB51. These terms govern your engagement with our storefront, artisanal collections, bespoke tailoring appointments, and customer concierge channels.
            </p>

            <div className="flex flex-wrap items-center gap-4 text-[10px] tracking-wider uppercase text-zinc-500 font-bold pt-2 border-t border-zinc-200">
              <span className="inline-flex items-center gap-1.5">
                <Clock size={12} className="text-[#FF5E36]" />
                Last Revised: <strong className="text-zinc-800">{lastUpdated}</strong>
              </span>
              <span>·</span>
              <span>Effective Date: <strong className="text-zinc-800">{effectiveDate}</strong></span>
              <span>·</span>
              <span>Boutique & Concierge Terms</span>
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
                  Have an Order Inquiry?
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed font-light mb-4">
                  Our tailoring concierge is available to guide you on sizing, delivery dates, and custom specifications.
                </p>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hello JB51, I have a question regarding your Terms of Service and an upcoming order.")}`}
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
                <h2 className="font-serif text-2xl font-bold text-zinc-950">Acceptance of Terms</h2>
              </div>
              <p className="text-sm font-light text-zinc-600 leading-relaxed mb-4">
                By browsing, accessing, or placing an order through the website <strong className="text-zinc-800">jb51.in</strong>, our digital catalogs, or via our official WhatsApp and Instagram concierge lines, you acknowledge and agree to be legally bound by these Terms of Service.
              </p>
              <p className="text-sm font-light text-zinc-600 leading-relaxed">
                If you do not agree with any part of these terms, please refrain from using our services. These terms apply to all visitors, registered clients, and patrons of JB51 Clothing House Private Limited (&ldquo;JB51&rdquo;).
              </p>
            </section>

            <div className="w-full h-px bg-zinc-100" />

            {/* Section 2 */}
            <section id="artisanal-nature" className="scroll-mt-32">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-7 h-7 rounded-lg bg-[#FF5E36]/10 text-[#FF5E36] font-bold text-xs flex items-center justify-center">2</span>
                <h2 className="font-serif text-2xl font-bold text-zinc-950">Handcrafted & Textile Characteristics</h2>
              </div>
              <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 mb-4">
                <div className="flex items-center gap-2 mb-2 text-amber-700 font-bold text-xs uppercase tracking-wider">
                  <Award size={14} />
                  <span>The Hallmark of Authentic Craftsmanship</span>
                </div>
                <p className="text-xs text-zinc-700 leading-relaxed font-light">
                  Our silhouettes are crafted from pure handloom silks, raw Chanderi, bespoke micro-velvet, and adorned with authentic zardozi, tilla, and gotta-patti hand-embroidery.
                </p>
              </div>
              <p className="text-sm font-light text-zinc-600 leading-relaxed mb-3">
                Clients are advised that handcrafted textiles naturally possess unique irregularities:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-xs text-zinc-600 font-light">
                <li><strong>Weave Variations:</strong> Slight variations in thread thickness (slubs), motifs, and weave alignment are intrinsic to hand-woven textiles and are not considered manufacturing defects.</li>
                <li><strong>Color Calibration:</strong> While we capture photographs under natural studio illumination, slight variations in color perception may occur across individual display screens and device color calibrations.</li>
                <li><strong>Artisanal Dyes:</strong> Hand-dyed fabrics and vegetable-based tints may release minor excess dye during initial professional dry cleans, characteristic of genuine organic dye processes.</li>
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
                JB51 prides itself on complimentary custom sizing. Under our bespoke tailoring commitment:
              </p>
              <div className="space-y-3 text-xs font-light">
                <div className="p-3.5 rounded-xl border border-zinc-200">
                  <strong className="text-zinc-900 block mb-1">Measurement Accuracy:</strong>
                  Clients are responsible for providing accurate anatomical measurements. Our concierge team will gladly guide you over WhatsApp video consultation to verify measurements prior to cutting.
                </div>
                <div className="p-3.5 rounded-xl border border-zinc-200">
                  <strong className="text-zinc-900 block mb-1">Tailoring Margin:</strong>
                  All bespoke kurtas, trousers, and lehengas are crafted with a generous 1.5-inch inner seam margin to accommodate future adjustments should your fit preference evolve.
                </div>
                <div className="p-3.5 rounded-xl border border-zinc-200">
                  <strong className="text-zinc-900 block mb-1">Complimentary Alteration Guarantee:</strong>
                  If a custom-made suit does not fit to your exact satisfaction upon delivery, we provide one complimentary round of alteration at our flagship boutique. Courier pick-up for alterations is coordinated by our concierge.
                </div>
              </div>
            </section>

            <div className="w-full h-px bg-zinc-100" />

            {/* Section 4 */}
            <section id="pricing-payment" className="scroll-mt-32">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-7 h-7 rounded-lg bg-[#FF5E36]/10 text-[#FF5E36] font-bold text-xs flex items-center justify-center">4</span>
                <h2 className="font-serif text-2xl font-bold text-zinc-950">Pricing, Taxes & Inventory Reservations</h2>
              </div>
              <ul className="list-disc pl-5 space-y-2 text-xs text-zinc-600 font-light">
                <li><strong>All-Inclusive Pricing & GST:</strong> All prices listed on the website are in Indian National Rupees (INR ₹) and are inclusive of Goods and Services Tax (GST). Official itemized GST tax invoices detailing applicable CGST, SGST, or IGST based on destination state codes are provided with each order.</li>
                <li><strong>Inventory Reservations:</strong> When an order is initiated, our real-time inventory system marks units as reserved stock. Reservations remain active during checkout; uncompleted sessions or unpaid orders automatically release reserved inventory back to available stock.</li>
                <li><strong>Payment Channels:</strong> We accept payments via major credit/debit cards, Net Banking, UPI (Google Pay, PhonePe, Paytm), and direct bank transfers for bespoke commission orders.</li>
                <li><strong>Made-to-Measure Commissions:</strong> For made-to-measure orders initiated via our WhatsApp Concierge, production commences upon receipt of full advance payment or an agreed bespoke booking deposit.</li>
                <li><strong>Pricing Errors:</strong> In the unlikely event an item is listed with an erroneous price due to a typographical or system error, JB51 reserves the right to cancel the order and provide a full refund.</li>
              </ul>
            </section>

            <div className="w-full h-px bg-zinc-100" />

            {/* Section 5 */}
            <section id="shipping-delivery" className="scroll-mt-32">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-7 h-7 rounded-lg bg-[#FF5E36]/10 text-[#FF5E36] font-bold text-xs flex items-center justify-center">5</span>
                <h2 className="font-serif text-2xl font-bold text-zinc-950">Shipping, Timelines & Customs</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-light mb-4">
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200">
                  <h4 className="font-bold text-zinc-900 mb-1 uppercase tracking-wider text-[11px]">Ready-to-Wear</h4>
                  <p className="text-zinc-600">
                    Dispatched within 2 to 3 business days. Estimated domestic delivery timeline is 3–6 business days depending on location.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200">
                  <h4 className="font-bold text-zinc-900 mb-1 uppercase tracking-wider text-[11px]">Bespoke Made-to-Order</h4>
                  <p className="text-zinc-600">
                    Requires 15 to 20 business days of artisanal cutting, hand-embroidery, and finishing prior to quality inspection and dispatch.
                  </p>
                </div>
              </div>
              <p className="text-xs text-zinc-600 font-light leading-relaxed">
                <strong>International Shipments:</strong> We deliver worldwide via DHL and FedEx. Clients are responsible for any applicable import duties, customs tariffs, or local clearance fees assessed by the destination country&apos;s customs authorities.
              </p>
            </section>

            <div className="w-full h-px bg-zinc-100" />

            {/* Section 6 */}
            <section id="returns-exchanges" className="scroll-mt-32">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-7 h-7 rounded-lg bg-[#FF5E36]/10 text-[#FF5E36] font-bold text-xs flex items-center justify-center">6</span>
                <h2 className="font-serif text-2xl font-bold text-zinc-950">Exchange & Return Policy</h2>
              </div>
              <p className="text-sm font-light text-zinc-600 leading-relaxed mb-4">
                Because of the luxury artisanal nature of our garments, our return parameters are established as follows:
              </p>
              
              <div className="space-y-3 text-xs font-light">
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200">
                  <h4 className="font-bold text-zinc-900 mb-1">Standard Ready-to-Wear (7-Day Exchange)</h4>
                  <p className="text-zinc-600 leading-relaxed">
                    Standard sized pieces (unaltered XS, S, M, L, XL) are eligible for an exchange or store credit within seven (7) days of delivery. Garments must be unworn, unwashed, unaltered, and returned in their original packaging with all original tags intact.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200/60">
                  <h4 className="font-bold text-rose-900 mb-1">Bespoke & Custom Sized Pieces (Final Sale, Free Alterations)</h4>
                  <p className="text-rose-800 leading-relaxed">
                    Ensembles that have been custom tailored to specific measurements, personalized necklines, or bespoke lengths are crafted uniquely for you and are non-refundable. They are fully backed by our Complimentary Alteration Guarantee.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200">
                  <h4 className="font-bold text-zinc-900 mb-1">Damaged in Transit</h4>
                  <p className="text-zinc-600 leading-relaxed">
                    If an ensemble arrives damaged or tampered with, please notify our concierge within 48 hours of receipt with unboxing photographs or video documentation. We will immediately arrange collection and express replacement.
                  </p>
                </div>
              </div>
            </section>

            <div className="w-full h-px bg-zinc-100" />

            {/* Section 7 */}
            <section id="garment-care" className="scroll-mt-32">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-7 h-7 rounded-lg bg-[#FF5E36]/10 text-[#FF5E36] font-bold text-xs flex items-center justify-center">7</span>
                <h2 className="font-serif text-2xl font-bold text-zinc-950">Garment Care & Fabric Longevity</h2>
              </div>
              <p className="text-sm font-light text-zinc-600 leading-relaxed mb-3">
                All JB51 handcrafted pieces are delicate heirloom textiles:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-zinc-600 font-light">
                <li><strong>Strictly Professional Dry Clean Only:</strong> Handloom silks, organza dupattas, and velvet pieces must never be machine-washed or hand-soaked.</li>
                <li><strong>Storage:</strong> Store garments in breathable cotton muslin covers. Avoid direct contact with heavy perfumes or alcoholic sprays on metallic zardozi threads.</li>
                <li>JB51 cannot assume liability for fabric shrinkage, thread unraveling, or discoloration resulting from domestic washing or failure to observe care instructions.</li>
              </ul>
            </section>

            <div className="w-full h-px bg-zinc-100" />

            {/* Section 8 */}
            <section id="intellectual-property" className="scroll-mt-32">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-7 h-7 rounded-lg bg-[#FF5E36]/10 text-[#FF5E36] font-bold text-xs flex items-center justify-center">8</span>
                <h2 className="font-serif text-2xl font-bold text-zinc-950">Intellectual Property & Design Rights</h2>
              </div>
              <p className="text-sm font-light text-zinc-600 leading-relaxed mb-3">
                All textile patterns, silhouette designs, product photography, editorial copy, logos, and trademarks displayed on this site and our social channels are the exclusive intellectual property of JB51 Clothing House Private Limited. Unauthorized duplication, commercial reproduction, or digital scraping of our assets is strictly prohibited and subject to legal prosecution under Indian Copyright and Trademark laws.
              </p>
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs font-light leading-relaxed">
                <strong className="text-zinc-900 block mb-1">Customer Reviews & Visual Content Licensing:</strong>
                When you submit a review or upload outfit photographs/videos via our platform, you warrant that you hold all legal rights to the submitted media. By submitting, you grant JB51 a non-exclusive, royalty-free, worldwide license to display approved submissions across our storefront and promotional media. All reviews are subject to our administrative moderation queue and may be published, held, or removed at our discretion.
              </div>
            </section>

            <div className="w-full h-px bg-zinc-100" />

            {/* Section 9 */}
            <section id="client-conduct" className="scroll-mt-32">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-7 h-7 rounded-lg bg-[#FF5E36]/10 text-[#FF5E36] font-bold text-xs flex items-center justify-center">9</span>
                <h2 className="font-serif text-2xl font-bold text-zinc-950">Platform Integrity, Rate Limits & Conduct</h2>
              </div>
              <p className="text-sm font-light text-zinc-600 leading-relaxed mb-3">
                Our concierge service is staffed by real stylists and master artisans committed to assisting you with utmost courtesy. We expect reciprocal respect. We reserve the right to decline service, cancel pending consultations, or block communications from individuals engaging in abusive, defamatory, or unlawful conduct toward our personnel.
              </p>
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs font-light leading-relaxed">
                <strong className="text-zinc-900 block mb-1">Prohibition of Automated Scraping & API Abuse:</strong>
                Automated requests, bots, crawlers, unauthorized batch downloads, or deliberate tampering with our tRPC and upload API endpoints are strictly prohibited. Our systems actively enforce multi-tier rate limiting; any attempt to circumvent rate restrictions or conduct denial-of-service attacks will result in immediate IP termination and statutory reporting under the Information Technology Act 2000.
              </div>
            </section>

            <div className="w-full h-px bg-zinc-100" />

            {/* Section 10 */}
            <section id="limitation-liability" className="scroll-mt-32">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-7 h-7 rounded-lg bg-[#FF5E36]/10 text-[#FF5E36] font-bold text-xs flex items-center justify-center">10</span>
                <h2 className="font-serif text-2xl font-bold text-zinc-950">Limitation of Liability & Force Majeure</h2>
              </div>
              <p className="text-sm font-light text-zinc-600 leading-relaxed mb-3">
                To the fullest extent permitted by law, JB51 shall not be liable for any indirect, incidental, or consequential damages arising from the use of our website, delay in shipping, or reliance on information presented herein. Our maximum aggregate liability shall not exceed the purchase price of the specific ensemble giving rise to the claim.
              </p>
              <p className="text-sm font-light text-zinc-600 leading-relaxed">
                Neither party shall be held accountable for failure or delay in performance resulting from acts of God, strikes, pandemics, regional civil disturbances, raw silk embargoes, or catastrophic courier transit disruption (Force Majeure events).
              </p>
            </section>

            <div className="w-full h-px bg-zinc-100" />

            {/* Section 11 */}
            <section id="governing-law" className="scroll-mt-32">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-7 h-7 rounded-lg bg-[#FF5E36]/10 text-[#FF5E36] font-bold text-xs flex items-center justify-center">11</span>
                <h2 className="font-serif text-2xl font-bold text-zinc-950">Governing Law & Jurisdiction</h2>
              </div>
              <p className="text-sm font-light text-zinc-600 leading-relaxed">
                These Terms of Service and any contractual dispute arising from transactions on this platform shall be governed by and construed in accordance with the substantive laws of India. Any legal dispute, arbitration, or proceedings shall be subject to the exclusive jurisdiction of the competent courts in <strong className="text-zinc-800">Hyderabad, Telangana, India</strong>.
              </p>
            </section>

            <div className="w-full h-px bg-zinc-100" />

            {/* Section 12 */}
            <section id="concierge-contact" className="scroll-mt-32">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-7 h-7 rounded-lg bg-[#FF5E36]/10 text-[#FF5E36] font-bold text-xs flex items-center justify-center">12</span>
                <h2 className="font-serif text-2xl font-bold text-zinc-950">Concierge Contact Information</h2>
              </div>
              <p className="text-sm font-light text-zinc-600 leading-relaxed mb-6">
                For questions regarding these terms, bespoke orders, or order status inquiries, please contact our team:
              </p>

              <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-4 text-xs font-light">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-2.5">
                    <MapPin size={16} className="text-[#FF5E36] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-zinc-900 block mb-0.5">Flagship Studio</strong>
                      <p className="text-zinc-600 leading-relaxed">
                        JB51 Studio, 12, Heritage Villa, Banjara Hills<br />
                        Hyderabad, Telangana 500034, India
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <MessageCircle size={16} className="text-[#FF5E36] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-zinc-900 block mb-0.5">Direct Channels</strong>
                      <p className="text-zinc-600">WhatsApp: +{WHATSAPP_NUMBER}</p>
                      <p className="text-zinc-600">Email: support@jb51.shop</p>
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
