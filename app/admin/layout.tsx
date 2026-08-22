'use client';

import Link from 'next/link';
import { Package, LayoutDashboard, Settings, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Simple mock auth check
    const authCookie = document.cookie.split('; ').find(row => row.startsWith('admin_auth='));
    if (authCookie && authCookie.split('=')[1] === 'true') {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      if (pathname !== '/admin/login') {
        router.push('/admin/login');
      }
    }
  }, [pathname, router]);

  const handleLogout = () => {
    document.cookie = "admin_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setIsAuthenticated(false);
    router.push('/admin/login');
  };

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (isAuthenticated === null || isAuthenticated === false) {
    return null; // Don't render admin layout until auth is confirmed
  }

  return (
    <div className="flex h-screen bg-brand-beige absolute inset-0 z-[100] top-0 left-0">
      {/* Sidebar */}
      <aside className="w-64 bg-brand-charcoal text-brand-cream flex flex-col h-full">
        <div className="p-6">
          <Link href="/" className="font-serif text-2xl tracking-wide uppercase font-medium block">
            JB51 Admin
          </Link>
        </div>
        <nav className="flex-1 px-4 mt-6 space-y-2">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded hover:bg-white/10 transition-colors">
            <LayoutDashboard size={20} />
            <span className="text-sm tracking-wide uppercase">Dashboard</span>
          </Link>
          <Link href="/admin/products" className="flex items-center gap-3 px-4 py-3 rounded hover:bg-white/10 transition-colors">
            <Package size={20} />
            <span className="text-sm tracking-wide uppercase">Products</span>
          </Link>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded hover:bg-white/10 transition-colors opacity-50 cursor-not-allowed">
            <Settings size={20} />
            <span className="text-sm tracking-wide uppercase">Settings</span>
          </button>
        </nav>
        <div className="p-4 mt-auto border-t border-white/10">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded hover:bg-white/10 transition-colors text-brand-cream/70">
            <LogOut size={20} />
            <span className="text-sm tracking-wide uppercase">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
