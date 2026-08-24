import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center bg-brand-ivory text-brand-brown px-6 pt-32 pb-24 relative overflow-hidden">
      {/* Editorial subtle pattern */}
      <div className="absolute inset-0 pattern-block-print opacity-25 pointer-events-none" />

      <div className="max-w-md w-full text-center relative z-10 flex flex-col items-center">
        {/* Editorial script ornament */}
        <span className="font-script text-4xl text-brand-saffron block mb-2">
          Lost in Silhouette
        </span>
        
        {/* Large premium 404 */}
        <h1 className="font-serif text-[8rem] md:text-[10rem] font-light text-brand-maroon/20 leading-none tracking-widest mb-6 select-none">
          404
        </h1>

        {/* Decorative divider ornament */}
        <div className="w-32 flex items-center justify-center gap-3 opacity-40 mb-8">
          <div className="h-[1px] flex-1 bg-brand-saffron" />
          <span className="text-[10px] text-brand-saffron">✤</span>
          <div className="h-[1px] flex-1 bg-brand-saffron" />
        </div>

        {/* Title & Description */}
        <h2 className="font-serif text-2xl md:text-3xl text-brand-maroon mb-4 tracking-widest uppercase font-semibold">
          Page Not Found
        </h2>
        <p className="text-brand-brown/70 font-light text-xs md:text-sm leading-relaxed mb-10 max-w-sm">
          The collection or piece you are searching for might have moved, or the page no longer exists. Let us guide you back to our curated collections.
        </p>

        {/* Interactive Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Link
            href="/shop"
            className="bg-brand-maroon hover:bg-brand-burgundy text-brand-cream py-4 px-8 text-xs tracking-[0.2em] uppercase transition-colors font-medium border border-transparent text-center shadow-sm"
          >
            Explore Collection
          </Link>
          <Link
            href="/"
            className="border border-brand-maroon text-brand-maroon hover:bg-brand-maroon hover:text-brand-cream py-4 px-8 text-xs tracking-[0.2em] uppercase transition-all duration-300 font-medium text-center"
          >
            Return Home
          </Link>
        </div>
      </div>

      {/* Decorative background motifs */}
      <div className="absolute -bottom-10 -left-10 opacity-5 pointer-events-none select-none text-[15rem] font-serif font-light text-brand-gold">
        ✤
      </div>
      <div className="absolute -top-10 -right-10 opacity-5 pointer-events-none select-none text-[15rem] font-serif font-light text-brand-gold">
        ✤
      </div>
    </div>
  );
}
