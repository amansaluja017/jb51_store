'use client';

import Link from 'next/link';
import { Package, LayoutDashboard, Settings, LogOut, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

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
    <div className="flex flex-col md:flex-row h-screen bg-brand-sand absolute inset-0 z-[100] top-0 left-0 overflow-hidden">
      
      {/* Mobile Top Header */}
      <header className="flex md:hidden items-center justify-between bg-brand-brown text-brand-cream px-6 py-4 h-16 w-full border-b border-white/5 shrink-0 z-30">
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-1 hover:text-brand-saffron transition-colors"
        >
          <Menu size={22} />
        </button>
        <Link href="/" className="font-serif text-xl tracking-wide uppercase font-medium">
          JB51 Admin
        </Link>
        <button 
          onClick={handleLogout}
          className="p-1 hover:text-red-400 transition-colors opacity-70"
        >
          <LogOut size={18} />
        </button>
      </header>

      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300"
        />
      )}

      {/* Sidebar (Responsive drawer on mobile, static on desktop) */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-brand-brown text-brand-cream flex flex-col h-full z-50 transition-transform duration-300 ease-in-out
        md:static md:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 flex items-center justify-between border-b border-white/5 md:border-none md:p-6">
          <Link href="/" className="font-serif text-2xl tracking-wide uppercase font-medium block">
            JB51 Admin
          </Link>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden p-1 text-brand-cream/80 hover:text-brand-cream"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 px-4 mt-6 space-y-2">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded hover:bg-white/10 transition-colors">
            <LayoutDashboard size={20} />
            <span className="text-sm tracking-wide uppercase font-medium">Dashboard</span>
          </Link>
          <Link href="/admin/products" className="flex items-center gap-3 px-4 py-3 rounded hover:bg-white/10 transition-colors">
            <Package size={20} />
            <span className="text-sm tracking-wide uppercase font-medium">Products</span>
          </Link>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded hover:bg-white/10 transition-colors opacity-50 cursor-not-allowed text-left">
            <Settings size={20} />
            <span className="text-sm tracking-wide uppercase font-medium">Settings</span>
          </button>
        </nav>
        <div className="p-4 mt-auto border-t border-white/10 hidden md:block">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded hover:bg-white/10 transition-colors text-brand-cream/70">
            <LogOut size={20} />
            <span className="text-sm tracking-wide uppercase font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
