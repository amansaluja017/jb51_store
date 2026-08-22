import { apiServer } from '@/lib/trpc/client/server';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const products = await apiServer.getProducts.query();
  const activeProducts = products.length;
  const outOfStock = products.filter(p => p.variants.every(v => v.stock === 0)).length;

  return (
    <div>
      <h1 className="font-serif text-3xl mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 border border-brand-charcoal/10 rounded">
          <p className="text-sm text-brand-charcoal/60 uppercase tracking-widest mb-2">Total Products</p>
          <p className="text-4xl font-serif">{products.length}</p>
        </div>
        <div className="bg-white p-6 border border-brand-charcoal/10 rounded">
          <p className="text-sm text-brand-charcoal/60 uppercase tracking-widest mb-2">Active</p>
          <p className="text-4xl font-serif">{activeProducts}</p>
        </div>
        <div className="bg-white p-6 border border-brand-charcoal/10 rounded">
          <p className="text-sm text-brand-charcoal/60 uppercase tracking-widest mb-2">Out of Stock</p>
          <p className="text-4xl font-serif">{outOfStock}</p>
        </div>
      </div>

      <div className="bg-white p-6 border border-brand-charcoal/10 rounded">
        <h2 className="font-serif text-xl mb-6">Recent Customer Inquiries</h2>
        <div className="text-center py-12 text-brand-charcoal/60 text-sm">
          No recent inquiries recorded via tracking. Most orders happen directly on WhatsApp/Instagram.
        </div>
      </div>
    </div>
  );
}
