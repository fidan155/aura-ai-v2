'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Terminal, Cpu, User, LogOut, PlusCircle, Activity } from 'lucide-react';

interface Antrag {
  id: number;
  titel: string;
  status: 'offen' | 'genehmigt' | 'abgelehnt' | string | null;
  beschreibung: string | null;
  createdAt?: string;
}

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: 'easeOut' },
} as const;

const FONT_IMPORT = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
* { font-family: 'Inter', sans-serif; }
.font-display { font-family: 'Space Grotesk', sans-serif; }
.font-mono { font-family: 'JetBrains Mono', monospace; }
`;

export default function DashboardPage() {
  const [antraegeListe, setAntraegeListe] = useState<Antrag[]>([]);
  const [titel, setTitel] = useState('');
  const [beschreibung, setBeschreibung] = useState('');

  const ladeEigeneAntraege = async () => {
    const res = await fetch('/api/antraege');
    const data = await res.json();
    setAntraegeListe(data);
  };

  useEffect(() => {
    ladeEigeneAntraege();
  }, []);

  const handleAntragSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/antraege', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titel, beschreibung }),
    });
    setTitel('');
    setBeschreibung('');
    ladeEigeneAntraege();
  };

  // Sicheres Logout über die serverseitige Next.js API-Route mit Redirect auf die Homepage
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout Fehler:', err);
    }
    window.location.href = '/';
  };

  return (
    <div className="bg-[#0A0D12] text-[#ECEFF3] min-h-screen selection:bg-[#F5A623] selection:text-[#0A0D12] overflow-x-hidden relative">
      <style>{FONT_IMPORT}</style>
      <div className="fixed inset-0 pointer-events-none opacity-[0.35] bg-[radial-gradient(circle_at_20%_0%,rgba(76,201,240,0.08),transparent_45%),radial-gradient(circle_at_85%_20%,rgba(245,166,35,0.06),transparent_40%)]" />

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#0A0D12]/80 backdrop-blur-xl border-b border-[#1E2530] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-[#F5A623] flex items-center justify-center">
              <Terminal className="w-4 h-4 text-[#0A0D12]" strokeWidth={2.5} />
            </div>
            <span className="font-display font-bold tracking-tight text-lg">AURA</span>
            <span className="font-mono text-[10px] text-[#7C8494]">v2.6</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#1E2530] bg-[#12161D]">
              <User className="w-3.5 h-3.5 text-[#4CC9F0]" />
              <span className="font-mono text-[11px] text-[#7C8494] uppercase tracking-wide">User Space</span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-[#12161D] border border-[#1E2530] text-[#7C8494] hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 font-medium text-xs px-3 py-2 rounded-full transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto pt-32 pb-24 px-6 relative z-10 space-y-12">
        <motion.div {...fadeIn}>
          <h1 className="font-display font-bold text-4xl tracking-tight mb-4">Willkommen zurück, Operator.</h1>
          <p className="text-[#7C8494] max-w-xl">Erstelle neue Anträge oder verwalte deine dezentralisierten Nodes.</p>
        </motion.div>

        {/* Formular & Status Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Linke Seite: Status & Stats */}
          <div className="space-y-5">
            <motion.div {...fadeIn} transition={{ delay: 0.1 }} className="p-6 rounded-2xl bg-[#12161D] border border-[#1E2530]">
              <div className="w-10 h-10 rounded-lg bg-[#0A0D12] border border-[#1E2530] flex items-center justify-center mb-4">
                <Activity className="w-5 h-5 text-[#4CC9F0]" />
              </div>
              <h3 className="font-display font-semibold text-base mb-1.5">System-Integrität</h3>
              <div className="font-mono text-[11px] text-[#4CC9F0] bg-[#4CC9F0]/10 px-2 py-1 rounded inline-block">
                ● ONLINE // SECURE
              </div>
            </motion.div>

            <motion.div {...fadeIn} transition={{ delay: 0.2 }} className="p-6 rounded-2xl bg-[#12161D] border border-[#1E2530]">
              <div className="w-10 h-10 rounded-lg bg-[#0A0D12] border border-[#1E2530] flex items-center justify-center mb-4">
                <Cpu className="w-5 h-5 text-[#F5A623]" />
              </div>
              <h3 className="font-display font-semibold text-base mb-1.5">Deine Anträge</h3>
              <span className="font-display font-bold text-2xl tracking-tight">
                {antraegeListe.length} <span className="font-mono text-xs font-normal text-[#7C8494]">Gesamt</span>
              </span>
            </motion.div>
          </div>

          {/* Rechte Seite: Formular */}
          <motion.div
            {...fadeIn}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 p-8 rounded-2xl border border-[#1E2530] bg-[#12161D] space-y-4"
          >
            <h3 className="font-display font-semibold text-xl flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-[#F5A623]" /> Neuer Core-Antrag
            </h3>

            <form onSubmit={handleAntragSubmit} className="space-y-4 pt-2">
              <Input
                type="text"
                placeholder="Antrag Titel"
                value={titel}
                onChange={(e) => setTitel(e.target.value)}
                required
                className="bg-[#0A0D12] border-[#1E2530] text-[#ECEFF3] placeholder:text-[#7C8494] focus-visible:ring-[#4CC9F0]"
              />
              <textarea
                placeholder="Beschreibung der Anforderung..."
                value={beschreibung}
                onChange={(e) => setBeschreibung(e.target.value)}
                className="flex min-h-[100px] w-full rounded-md border border-[#1E2530] bg-[#0A0D12] px-3 py-2 text-sm text-[#ECEFF3] placeholder:text-[#7C8494] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4CC9F0]"
              />
              <Button
                type="submit"
                className="w-full bg-[#F5A623] text-[#0A0D12] font-semibold hover:bg-[#ffb945] transition-colors"
              >
                Antrag absenden
              </Button>
            </form>
          </motion.div>
        </div>

        {/* EIGENE ANTRÄGE LIVE-TABELLE */}
        <motion.div
          {...fadeIn}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border border-[#1E2530] bg-[#12161D] p-6"
        >
          <h3 className="font-display font-semibold text-lg mb-4">Deine eingereichten Anträge & Status</h3>
          <div className="rounded-md border border-[#1E2530] bg-[#0A0D12]">
            <Table className="">
              <TableHeader className="border-[#1E2530] bg-[#12161D]">
                <TableRow className="border-[#1E2530] hover:bg-transparent">
                  <TableHead className="w-[80px] font-mono text-[#7C8494]">ID</TableHead>
                  <TableHead className="font-semibold text-[#ECEFF3]">Titel</TableHead>
                  <TableHead className="text-[#7C8494]">Beschreibung</TableHead>
                  <TableHead className="text-right font-mono text-[#4CC9F0]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="">
                {antraegeListe.length === 0 ? (
                  <TableRow className="border-[#1E2530]">
                    <TableCell colSpan={4} className="text-center text-[#7C8494] py-8 font-mono text-sm">
                      Du hast noch keine Anträge eingereicht.
                    </TableCell>
                  </TableRow>
                ) : (
                  antraegeListe.map((antrag) => {
                    const statusText = antrag.status ? antrag.status.toUpperCase() : 'OFFEN';
                    const statusColor =
                      statusText === 'GENEHMIGT'
                        ? 'text-[#4CC9F0]'
                        : statusText === 'ABGELEHNT'
                        ? 'text-red-400'
                        : 'text-[#F5A623]';

                    return (
                      <TableRow key={antrag.id} className="border-[#1E2530] hover:bg-white/[0.02]">
                        <TableCell className="font-mono text-[#7C8494]">{antrag.id}</TableCell>
                        <TableCell className="font-medium text-[#ECEFF3]">{antrag.titel}</TableCell>
                        <TableCell className="text-[#7C8494]">{antrag.beschreibung || '-'}</TableCell>
                        <TableCell className={`text-right font-semibold font-mono ${statusColor}`}>
                          {statusText}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
