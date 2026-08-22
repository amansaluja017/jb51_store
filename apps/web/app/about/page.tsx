export const metadata = {
  title: 'Our Story | JB51',
  description: 'The story behind JB51, crafting premium contemporary Indian women\'s suits.',
};

export default function AboutPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-24 bg-brand-cream relative">
      <div className="absolute inset-0 opacity-[0.01] pointer-events-none paisley-bg" />

      <h1 className="font-serif text-5xl md:text-6xl text-brand-charcoal mb-8 tracking-wide">The Grace of Heritage.</h1>
      
      <div className="space-y-8 text-brand-charcoal/80 leading-relaxed text-base md:text-lg font-light">
        <p>
          JB51 was founded on a simple principle: contemporary Indian women's suits should celebrate rich handloom heritage while remaining uncompromisingly modern, structural, and elegant.
        </p>
        
        <p>
          We blend the luxury of traditional Indian textiles—such as handspun Chanderi silk, Banarasi gold zari, and royal velvets—with minimal, modern silhouettes that flow effortlessly from celebrations to everyday executive settings.
        </p>

        <h2 className="font-serif text-3xl text-brand-charcoal mt-16 mb-6">Our Handloom Heritage</h2>
        
        <p>
          We cooperate directly with artisan weaving families across Varanasi, Chanderi, and Rajasthan. By preserving these ancient craftsmanship styles, we ensure every thread carries a story of generations.
        </p>

        <p>
          Our tailoring process involves meticulous pattern-making, hand-stitched Resham pipings, and delicate zardozi needlework. From unstructured flowy kurtas to tailored straight pants, every detail is crafted as a contemporary heirloom.
        </p>
      </div>
    </div>
  );
}
