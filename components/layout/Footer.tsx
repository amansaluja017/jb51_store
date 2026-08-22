import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-brand-charcoal text-brand-cream py-20 px-6 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-1">
          <Link href="/" className="font-serif text-3xl tracking-wide uppercase font-medium block mb-6">
            JB51
          </Link>
          <p className="text-brand-cream/70 text-sm max-w-xs leading-relaxed">
            Premium women's suits and formalwear designed for the modern executive. Crafted with precision and quiet luxury in mind.
          </p>
        </div>

        <div>
          <h4 className="font-serif text-lg mb-6 tracking-wide">Shop</h4>
          <ul className="space-y-4 text-sm text-brand-cream/70">
            <li><Link href="/shop" className="hover:text-brand-cream transition-colors">All Products</Link></li>
            <li><Link href="/shop?category=formal-suits" className="hover:text-brand-cream transition-colors">Suits</Link></li>
            <li><Link href="/shop?category=blazers" className="hover:text-brand-cream transition-colors">Blazers</Link></li>
            <li><Link href="/shop?category=trousers" className="hover:text-brand-cream transition-colors">Trousers</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-serif text-lg mb-6 tracking-wide">Customer Care</h4>
          <ul className="space-y-4 text-sm text-brand-cream/70">
            <li><Link href="/contact" className="hover:text-brand-cream transition-colors">Contact Us</Link></li>
            <li><Link href="/shipping" className="hover:text-brand-cream transition-colors">Shipping & Returns</Link></li>
            <li><Link href="/size-guide" className="hover:text-brand-cream transition-colors">Size Guide</Link></li>
            <li><Link href="/faq" className="hover:text-brand-cream transition-colors">FAQ</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-serif text-lg mb-6 tracking-wide">Newsletter</h4>
          <p className="text-brand-cream/70 text-sm mb-4 leading-relaxed">
            Subscribe to receive updates on new arrivals, special offers, and styling inspiration.
          </p>
          <form className="flex border-b border-brand-cream/30 pb-2">
            <input 
              type="email" 
              placeholder="Your email address" 
              className="bg-transparent border-none outline-none flex-1 text-sm placeholder:text-brand-cream/40"
            />
            <button type="submit" className="text-sm tracking-widest uppercase hover:text-brand-cream/70 transition-colors">
              Join
            </button>
          </form>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-brand-cream/10 flex flex-col md:flex-row justify-between items-center text-xs text-brand-cream/50">
        <p>&copy; {new Date().getFullYear()} JB51 Clothing Store. All rights reserved.</p>
        <div className="flex space-x-6 mt-4 md:mt-0">
          <Link href="/privacy" className="hover:text-brand-cream transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-brand-cream transition-colors">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
