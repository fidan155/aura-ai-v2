'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Terminal, Sparkles, Home, Shield, AlertTriangle, ArrowLeft } from 'lucide-react';

interface PasswordAnalysis {
  score: number;
  feedback: string[];
  warning: string | null;
}

const FONT_IMPORT = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
* { font-family: 'Inter', sans-serif; }
.font-display { font-family: 'Space Grotesk', sans-serif; }
.font-mono { font-family: 'JetBrains Mono', monospace; }
`;

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordAnalysis, setPasswordAnalysis] = useState<PasswordAnalysis | null>(null);
  const [strasse, setStrasse] = useState('');
  const [plz, setPlz] = useState('');
  const [stadt, setStadt] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  // Passwort-Checker ansteuern
  useEffect(() => {
    if (!password) {
      setPasswordAnalysis(null);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        const res = await fetch(`/api/check-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password }),
        });
        if (res.ok) {
          const data = await res.json();
          setPasswordAnalysis(data);
        }
      } catch (err) {
        console.error('Fehler beim Passwort-Check', err);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [password]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch(`/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, strasse, plz, stadt }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      setMessage(`Erfolg! Weiterleitung zum Login...`);
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } else {
      setMessage(`Fehler: ${data.error}`);
    }
  };

  const getScoreColor = (score: number) => {
    if (score <= 1) return 'bg-red-500';
    if (score === 2) return 'bg-orange-500';
    if (score === 3) return 'bg-yellow-500';
    return 'bg-[#4CC9F0]';
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
              Aura Identity Setup
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
          <h2 className="font-display font-bold text-2xl tracking-tight">Registrierung</h2>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Login-Daten */}
          <div className="space-y-3">
            <Input
              type="email"
              placeholder="E-Mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-[#0A0D12] border-[#1E2530] text-[#ECEFF3] placeholder:text-[#7C8494] focus-visible:ring-[#4CC9F0]"
            />
            <div>
              <Input
                type="password"
                placeholder="Passwort"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-[#0A0D12] border-[#1E2530] text-[#ECEFF3] placeholder:text-[#7C8494] focus-visible:ring-[#4CC9F0]"
              />

              {/* Passwort-Stärken-Indikator */}
              {passwordAnalysis && (
                <div className="mt-2 space-y-1.5 p-2 rounded-lg bg-[#0A0D12] border border-[#1E2530]">
                  <div className="flex items-center justify-between font-mono text-[10px] text-[#7C8494]">
                    <span className="flex items-center gap-1">
                      <Shield className="w-3 h-3 text-[#4CC9F0]" /> STÄRKE:
                    </span>
                    <span className="font-bold text-[#ECEFF3]">{passwordAnalysis.score} / 4</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {[0, 1, 2, 3].map((index) => (
                      <div
                        key={index}
                        className={`h-1 rounded-sm transition-colors duration-300 ${
                          index <= passwordAnalysis.score - 1 ? getScoreColor(passwordAnalysis.score) : 'bg-[#1E2530]'
                        }`}
                      />
                    ))}
                  </div>
                  {passwordAnalysis.warning && (
                    <p className="font-mono text-[10px] text-[#F5A623] flex items-start gap-1 leading-tight pt-1">
                      <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                      <span>{passwordAnalysis.warning}</span>
                    </p>
                  )}
                  {passwordAnalysis.feedback.length > 0 && (
                    <ul className="font-mono text-[9px] text-[#7C8494] list-disc list-inside space-y-0.5 pl-0.5">
                      {passwordAnalysis.feedback.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Adress-Trennlinie */}
          <div className="flex items-center gap-2 pt-2 font-mono text-[11px] text-[#7C8494] tracking-wide">
            <Home className="w-3 h-3 text-[#F5A623]" />
            <span>STANDORTDATEN</span>
            <div className="h-[1px] bg-[#1E2530] flex-grow" />
          </div>

          {/* Adress-Daten */}
          <div className="space-y-3">
            <Input
              type="text"
              placeholder="Straße & Hausnummer"
              value={strasse}
              onChange={(e) => setStrasse(e.target.value)}
              required
              className="bg-[#0A0D12] border-[#1E2530] text-[#ECEFF3] placeholder:text-[#7C8494] focus-visible:ring-[#4CC9F0]"
            />
            <div className="grid grid-cols-3 gap-2">
              <Input
                type="text"
                placeholder="PLZ"
                value={plz}
                onChange={(e) => setPlz(e.target.value)}
                required
                className="bg-[#0A0D12] border-[#1E2530] text-[#ECEFF3] placeholder:text-[#7C8494] focus-visible:ring-[#4CC9F0]"
              />
              <Input
                type="text"
                placeholder="Stadt"
                value={stadt}
                onChange={(e) => setStadt(e.target.value)}
                required
                className="col-span-2 bg-[#0A0D12] border-[#1E2530] text-[#ECEFF3] placeholder:text-[#7C8494] focus-visible:ring-[#4CC9F0]"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-[#F5A623] text-[#0A0D12] font-semibold hover:bg-[#ffb945] transition-colors mt-2"
          >
            Account erstellen
          </Button>
        </form>

        <div className="text-center mt-2">
          <button
            type="button"
            onClick={() => router.push('/login')}
            className="font-mono text-xs text-[#7C8494] hover:text-[#4CC9F0] underline underline-offset-4 transition-colors"
          >
            Bereits ein Konto? Hier anmelden
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
