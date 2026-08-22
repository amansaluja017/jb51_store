export const metadata = {
  title: 'About Us | JB51',
  description: 'The story behind JB51, crafting premium women\'s suits.',
};

export default function AboutPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-24">
      <h1 className="font-serif text-5xl md:text-6xl text-brand-charcoal mb-8">The Architecture of Confidence.</h1>
      
      <div className="space-y-8 text-brand-charcoal/80 leading-relaxed text-lg">
        <p>
          JB51 was founded on a simple principle: women's formalwear should be as uncompromising in its craftsmanship as the women who wear it. For too long, the industry has offered suits that are either poorly constructed or simply miniaturized versions of men's tailoring. 
        </p>
        
        <p>
          We set out to change that.
        </p>

        <h2 className="font-serif text-3xl text-brand-charcoal mt-16 mb-6">Our Craft</h2>
        
        <p>
          Every JB51 garment begins in our studio with a focus on the female silhouette. We drape, we tailor, and we refine. We source only the highest grade Italian wools, pure silks, and sustainable blends that offer structure without sacrificing fluidity or comfort.
        </p>

        <p>
          Our construction process involves over 40 hours of meticulous handiwork. From the hand-stitched canvassing in our blazers that mold to your shape over time, to the precisely engineered waistbands of our trousers—every detail is intentional.
        </p>
      </div>
    </div>
  );
}
