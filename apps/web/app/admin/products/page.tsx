import { apiServer } from '@/lib/trpc/client/server';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminProducts() {
  const products = await apiServer.products.getAll.query();

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-serif text-3xl">Products</h1>
        <Link 
          href="/admin/products/new" 
          className="bg-brand-brown text-brand-cream px-4 py-2 flex items-center gap-2 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity"
        >
          <Plus size={16} /> Add Product
        </Link>
      </div>
      
      <div className="bg-white border border-brand-brown/10 rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-brand-brown/10 bg-brand-brown/5">
                <th className="p-4 text-xs font-medium tracking-widest uppercase text-brand-brown/60">Product</th>
                <th className="p-4 text-xs font-medium tracking-widest uppercase text-brand-brown/60">Category</th>
                <th className="p-4 text-xs font-medium tracking-widest uppercase text-brand-brown/60">Price</th>
                <th className="p-4 text-xs font-medium tracking-widest uppercase text-brand-brown/60">Status</th>
                <th className="p-4 text-xs font-medium tracking-widest uppercase text-brand-brown/60 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id} className="border-b border-brand-brown/10 hover:bg-brand-brown/5 transition-colors">
                  <td className="p-4 flex items-center gap-4">
                    <div className="relative w-12 h-16 bg-brand-sand overflow-hidden">
                      <Image src={product.images[0]} alt={product.name} fill className="object-cover" sizes="48px" />
                    </div>
                    <div className="font-medium">{product.name}</div>
                  </td>
                  <td className="p-4 text-sm text-brand-brown/80">{product.category}</td>
                  <td className="p-4 text-sm font-medium">{formatPrice(product.price)}</td>
                  <td className="p-4">
                    <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-[10px] tracking-widest uppercase rounded-sm">Active</span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button className="text-brand-brown/60 hover:text-brand-brown transition-colors p-1"><Edit2 size={16} /></button>
                      <button className="text-red-500/60 hover:text-red-500 transition-colors p-1"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
