'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Terminal, Sparkles, ArrowLeft } from 'lucide-react';

const FONT_IMPORT = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
* { font-family: 'Inter', sans-serif; }
.font-display { font-family: 'Space Grotesk', sans-serif; }
.font-mono { font-family: 'JetBrains Mono', monospace; }
`;

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage(`Erfolg! Weiterleitung...`);

        setTimeout(() => {
          if (data.role === 'admin') {
            router.push('/admin');
          } else {
            router.push('/dashboard');
          }
        }, 1000);
      } else {
        setMessage(`Fehler: ${data.error}`);
      }
    } catch (err) {
      setMessage('Fehler: Server nicht erreichbar');
    }
  };

  return (
    <div className="bg-[#0A0D12] text-[#ECEFF3] min-h-screen selection:bg-[#F5A623] selection:text-[#0A0D12] relative flex items-center justify-center p-4">
      <style>{FONT_IMPORT}</style>

      <div className="fixed inset-0 pointer-events-none opacity-[0.35] bg-[radial-gradient(circle_at_20%_0%,rgba(76,201,240,0.08),transparent_45%),radial-gradient(circle_at_85%_20%,rgba(245,166,35,0.06),transparent_40%)]" />

      <Link
        href="/"
        className="fixed top-6 left-6 inline-flex items-center gap-1.5 font-mono text-[11px] text-[#7C8494] hover:text-white transition-colors z-10"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Zurück zur Startseite
      </Link>

      <div className="w-full max-w-md space-y-6 rounded-2xl border border-[#1E2530] bg-[#12161D] p-8 shadow-2xl relative z-10">
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#1E2530] bg-[#0A0D12]">
            <Sparkles className="w-3.5 h-3.5 text-[#F5A623]" />
            <span className="font-mono text-[10px] text-[#7C8494] tracking-wide uppercase">
              Aura Secure Gateway
            </span>
          </div>
        </div>

        <div className="space-y-2 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-md bg-[#F5A623] flex items-center justify-center">
              <Terminal className="w-3.5 h-3.5 text-[#0A0D12]" strokeWidth={2.5} />
            </div>
            <span className="font-display font-bold tracking-tight text-sm">AURA</span>
            <span className="font-mono text-[10px] text-[#7C8494]">v2.6</span>
          </div>
          <h2 className="font-display font-bold text-2xl tracking-tight">Login</h2>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            type="email"
            placeholder="E-Mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-[#0A0D12] border-[#1E2530] text-[#ECEFF3] placeholder:text-[#7C8494] focus-visible:ring-[#4CC9F0]"
          />
          <Input
            type="password"
            placeholder="Passwort"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-[#0A0D12] border-[#1E2530] text-[#ECEFF3] placeholder:text-[#7C8494] focus-visible:ring-[#4CC9F0]"
          />
          <Button
            type="submit"
            className="w-full bg-[#F5A623] text-[#0A0D12] font-semibold hover:bg-[#ffb945] transition-colors"
          >
            Login
          </Button>
        </form>

        <div className="text-center mt-2">
          <button
            type="button"
            onClick={() => router.push('/register')}
            className="font-mono text-xs text-[#7C8494] hover:text-[#4CC9F0] underline underline-offset-4 transition-colors"
          >
            Noch kein Konto? Hier registrieren
          </button>
        </div>

        {message && (
          <p
            className={`text-center text-xs font-mono mt-4 ${
              message.includes('Erfolg') ? 'text-[#4CC9F0]' : 'text-red-400'
            }`}
          >
            {message.includes('Erfolg') ? `[OK] ${message}` : `[ERROR] ${message}`}
          </p>
        )}
      </div>
    </div>
  );
}
