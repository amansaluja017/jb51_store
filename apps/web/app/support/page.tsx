'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Mail, MessageCircle, MapPin, ChevronDown } from 'lucide-react';
import { WHATSAPP_NUMBER, INSTAGRAM_HANDLE, COMPANY_EMAIL } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';

const Dropdown = dynamic(() => import('@/components/ui/Dropdown').then(mod => mod.Dropdown), { ssr: false });

export default function SupportPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("");

  const subjects = [
    { value: "order", label: "Order Status / Issue" },
    { value: "styling", label: "Styling Advice" },
    { value: "customization", label: "Bespoke Customization" },
    { value: "other", label: "Other Inquiry" }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      alert('Thank you for reaching out. Our concierge will contact you shortly.');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-brand-ivory text-brand-brown pt-32 pb-24">
      {/* Subtle Pattern */}
      <div className="absolute inset-0 pattern-block-print opacity-50 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span className="font-script text-4xl text-brand-saffron block mb-4">We are here for you</span>
          <h1 className="font-serif text-5xl md:text-6xl text-brand-maroon mb-6">Client Services</h1>
          <p className="text-brand-brown/80 font-light text-lg">
            Whether you need assistance with an order, styling advice, or bespoke customization, our dedicated concierge team is at your service.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* Contact Information */}
          <div className="lg:col-span-5 flex flex-col gap-12">
            <div className="bg-brand-sand border border-brand-brass/20 p-8">
              <h2 className="font-serif text-2xl text-brand-maroon mb-8">Direct Contact</h2>
              
              <div className="flex flex-col gap-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 border border-brand-brass/30 text-brand-saffron">
                    <MessageCircle size={20} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-sm tracking-widest uppercase font-medium mb-1">WhatsApp Concierge</h3>
                    <p className="text-brand-brown/70 font-light mb-2">Available Mon-Sat, 10am to 7pm IST</p>
                    <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="text-brand-maroon hover:text-brand-sienna transition-colors border-b border-brand-maroon pb-0.5">
                      +{WHATSAPP_NUMBER}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2 border border-brand-brass/30 text-brand-saffron">
                    <Mail size={20} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-sm tracking-widest uppercase font-medium mb-1">Email Support</h3>
                    <p className="text-brand-brown/70 font-light mb-2">Expect a response within 24 hours</p>
                    <a href={`mailto:${COMPANY_EMAIL}`} className="text-brand-maroon hover:text-brand-sienna transition-colors border-b border-brand-maroon pb-0.5">
                      {COMPANY_EMAIL}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2 border border-brand-brass/30 text-brand-saffron">
                    <MapPin size={20} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-sm tracking-widest uppercase font-medium mb-1">Flagship Studio</h3>
                    <p className="text-brand-brown/70 font-light leading-relaxed">
                      12, Heritage Villa, Banjara Hills<br />
                      Hyderabad, Telangana 500034<br />
                      India
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQs */}
            <div>
              <h2 className="font-serif text-2xl text-brand-maroon mb-6">Frequently Asked</h2>
              <div className="border-t border-brand-brass/20">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="shipping" className="border-b border-brand-brass/20">
                    <AccordionTrigger className="font-serif text-lg py-4 hover:no-underline hover:text-brand-maroon">Shipping Timelines</AccordionTrigger>
                    <AccordionContent className="text-sm text-brand-brown/70 leading-relaxed pb-4 font-light">
                      Ready-to-ship items are dispatched within 2 business days. Bespoke and made-to-order garments typically require 3-4 weeks for meticulous crafting.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="customization" className="border-b border-brand-brass/20">
                    <AccordionTrigger className="font-serif text-lg py-4 hover:no-underline hover:text-brand-maroon">Bespoke Customization</AccordionTrigger>
                    <AccordionContent className="text-sm text-brand-brown/70 leading-relaxed pb-4 font-light">
                      Yes, we offer bespoke sizing and minor design alterations. Please reach out via WhatsApp prior to placing your order to discuss possibilities with our designers.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="returns" className="border-b border-brand-brass/20">
                    <AccordionTrigger className="font-serif text-lg py-4 hover:no-underline hover:text-brand-maroon">Returns & Exchanges</AccordionTrigger>
                    <AccordionContent className="text-sm text-brand-brown/70 leading-relaxed pb-4 font-light">
                      We offer a 7-day exchange policy for standard sizing. Custom-made outfits are crafted specifically for you and are backed by our Complimentary Alteration Guarantee. Read the full details in our <Link href="/terms-of-service" className="underline hover:text-brand-maroon font-medium">Terms of Service</Link>.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="privacy" className="border-b border-brand-brass/20">
                    <AccordionTrigger className="font-serif text-lg py-4 hover:no-underline hover:text-brand-maroon">Data Privacy & Fitting Records</AccordionTrigger>
                    <AccordionContent className="text-sm text-brand-brown/70 leading-relaxed pb-4 font-light">
                      Your personal information and bespoke sizing records are encrypted and protected under Indian DPDPA regulations. We never share or sell your details. Review our complete <Link href="/privacy-policy" className="underline hover:text-brand-maroon font-medium">Privacy Policy</Link>.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-white/50 backdrop-blur-md p-8 md:p-12 border border-brand-brass/10">
              <h2 className="font-serif text-3xl text-brand-maroon mb-2">Send an Inquiry</h2>
              <p className="text-brand-brown/70 font-light mb-8">Fill out the form below and our team will get back to you promptly.</p>
              
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="firstName" className="text-[10px] tracking-widest uppercase font-medium">First Name *</label>
                    <input required id="firstName" type="text" className="w-full bg-transparent border-b border-brand-brass/30 py-2 outline-none focus:border-brand-maroon transition-colors" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="lastName" className="text-[10px] tracking-widest uppercase font-medium">Last Name *</label>
                    <input required id="lastName" type="text" className="w-full bg-transparent border-b border-brand-brass/30 py-2 outline-none focus:border-brand-maroon transition-colors" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="email" className="text-[10px] tracking-widest uppercase font-medium">Email Address *</label>
                    <input required id="email" type="email" className="w-full bg-transparent border-b border-brand-brass/30 py-2 outline-none focus:border-brand-maroon transition-colors" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="phone" className="text-[10px] tracking-widest uppercase font-medium">Phone Number</label>
                    <input id="phone" type="tel" className="w-full bg-transparent border-b border-brand-brass/30 py-2 outline-none focus:border-brand-maroon transition-colors" />
                  </div>
                </div>

                 <div className="flex flex-col gap-2 mt-4">
                  <label className="text-[10px] tracking-widest uppercase font-medium">Subject *</label>
                  <Dropdown
                    options={subjects}
                    value={selectedSubject}
                    onChange={setSelectedSubject}
                    placeholder="Select inquiry subject..."
                    className="w-full text-left"
                    triggerClassName="w-full bg-transparent border-b border-brand-brass/30 py-2 rounded-none px-0 hover:bg-transparent border-t-0 border-x-0 outline-none focus:ring-0 focus:border-brand-maroon focus:border-b"
                    menuClassName="w-full origin-top-left"
                  />
                </div>

                <div className="flex flex-col gap-2 mt-4">
                  <label htmlFor="message" className="text-[10px] tracking-widest uppercase font-medium">Message *</label>
                  <textarea required id="message" rows={4} className="w-full bg-transparent border-b border-brand-brass/30 py-2 outline-none focus:border-brand-maroon transition-colors resize-none" />
                </div>

                <Button 
                  type="submit" 
                  isLoading={isSubmitting}
                  className="mt-8 w-full"
                  aria-label={isSubmitting ? "Submitting Inquiry" : "Submit Inquiry"}
                >
                  Submit Inquiry
                </Button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
