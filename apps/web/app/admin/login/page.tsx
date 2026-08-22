'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin@123') {
      document.cookie = "admin_auth=true; path=/;";
      router.push('/admin');
      router.refresh();
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-charcoal fixed inset-0 z-[200]">
      <div className="bg-brand-cream p-12 max-w-sm w-full text-center">
        <h1 className="font-serif text-3xl mb-8">JB51 Admin</h1>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password" 
            className="w-full px-4 py-3 border border-brand-charcoal/20 outline-none focus:border-brand-charcoal bg-transparent text-sm"
          />
          {error && <p className="text-red-500 text-xs">Invalid password</p>}
          <button type="submit" className="w-full bg-brand-charcoal text-brand-cream py-3 text-sm tracking-widest uppercase mt-4">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
