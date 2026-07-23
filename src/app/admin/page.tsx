'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Terminal,
  ShieldAlert,
  LogOut,
  Check,
  X,
  Brain,
  UserCheck,
  AlertTriangle,
  EyeOff,
} from 'lucide-react';

// Interfaces
interface Antrag {
  id: number;
  titel: string;
  status: string | null;
  beschreibung: string | null;
  createdAt?: string;
}

interface UserKiAnalyse {
  id: number;
  email: string;
  loginCount: number;
  featureClicks: number;
  kiStatus: 'Active' | 'At Risk' | 'Inactive' | 'Error';
  kiSummary: string;
  kiRecommendation: string;
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

export default function AdminPage() {
  const [antraegeListe, setAntraegeListe] = useState<Antrag[]>([]);
  const [userAnalysen, setUserAnalysen] = useState<UserKiAnalyse[]>([]);
  const [loadingKi, setLoadingKi] = useState<boolean>(true);

  // 1. Anträge laden
  const ladeAntraege = async () => {
    const res = await fetch('/api/antraege');
    const data = await res.json();
    setAntraegeListe(data);
  };

  // 2. KI-Nutzeranalysen laden
  const ladeUserAnalyse = async () => {
    try {
      setLoadingKi(true);
      const res = await fetch('/api/admin/user-analyse');
      const data = await res.json();
      setUserAnalysen(data);
    } catch (err) {
      console.error('Fehler beim Laden der KI-Analyse:', err);
    } finally {
      setLoadingKi(false);
    }
  };

  useEffect(() => {
    // Initialer Datenabruf beim Mount, kein Ableiten von Props/State im Effekt selbst.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    ladeAntraege();
    ladeUserAnalyse();
  }, []);

  const handleStatusUpdate = async (
    id: number,
    neuerStatus: 'genehmigt' | 'abgelehnt'
  ) => {
    await fetch('/api/antraege', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: neuerStatus }),
    });
    ladeAntraege();
  };

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
      {/* Glow-Effekte passend zur Aura-Farbpalette */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.35] bg-[radial-gradient(circle_at_20%_0%,rgba(76,201,240,0.08),transparent_45%),radial-gradient(circle_at_85%_20%,rgba(245,166,35,0.06),transparent_40%)]" />

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#0A0D12]/80 backdrop-blur-xl border-b border-[#1E2530] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-[#F5A623] flex items-center justify-center">
              <Terminal className="w-4 h-4 text-[#0A0D12]" strokeWidth={2.5} />
            </div>
            <span className="font-display font-bold tracking-tight text-lg">
              AURA
            </span>
            <span className="font-mono text-[10px] text-[#7C8494]">
              v2.6 // ADMIN
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-red-500/20 bg-red-500/10">
              <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
              <span className="font-mono text-[11px] text-red-400 uppercase tracking-wide">
                Sicherer Knoten aktiv
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-[#12161D] border border-[#1E2530] text-[#7C8494] hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 font-medium text-xs px-3 py-2 rounded-full transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" /> Abmelden
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto pt-32 pb-24 px-6 relative z-10 space-y-12">
        <motion.div {...fadeIn}>
          <h1 className="font-display font-bold text-4xl tracking-tight mb-4">
            Admin-Kontrollzentrum
          </h1>
          <p className="text-[#7C8494] max-w-xl">
            Überwache die KI-Nutzeranalysen und verwalte eingehende
            Systemanträge.
          </p>
        </motion.div>

        {/* KI-NUTZER-RADAR SECTION */}
        <motion.div
          {...fadeIn}
          transition={{ delay: 0.15 }}
          className="rounded-2xl border border-[#1E2530] bg-[#12161D] p-6 space-y-4"
        >
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-[#4CC9F0] animate-pulse" />
            <h3 className="font-display font-semibold text-lg">
              KI-Nutzer-Radar{' '}
              <span className="font-mono text-xs font-normal text-[#7C8494]">
                (Nutzung & Abwanderungsrisiko)
              </span>
            </h3>
          </div>

          {loadingKi ? (
            <div className="text-center py-8 font-mono text-xs text-[#7C8494]">
              Lade KI-Verhaltensdaten...
            </div>
          ) : userAnalysen.length === 0 ? (
            <div className="text-center py-8 font-mono text-xs text-[#7C8494]">
              Keine Nutzer-Verbindungen getrackt.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userAnalysen.map((u) => {
                const badgeColor =
                  u.kiStatus === 'Active'
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    : u.kiStatus === 'At Risk'
                      ? 'bg-[#F5A623]/10 border-[#F5A623]/20 text-[#F5A623]'
                      : 'bg-red-500/10 border-red-500/20 text-red-400';

                const StatusIcon =
                  u.kiStatus === 'Active'
                    ? UserCheck
                    : u.kiStatus === 'At Risk'
                      ? AlertTriangle
                      : EyeOff;

                return (
                  <div
                    key={u.id}
                    className="p-4 rounded-xl border border-[#1E2530] bg-[#0A0D12] flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold text-[#ECEFF3] truncate max-w-[200px]">
                          {u.email}
                        </p>
                        <p className="text-[10px] font-mono text-[#7C8494] mt-0.5">
                          Logins: {u.loginCount} | Klicks: {u.featureClicks}
                        </p>
                      </div>
                      <span
                        className={`flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}
                      >
                        <StatusIcon className="w-3 h-3" />{' '}
                        {u.kiStatus.toUpperCase()}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <p className="text-[#7C8494] leading-relaxed">
                        <strong className="text-[#ECEFF3]">Analyse:</strong>{' '}
                        {u.kiSummary}
                      </p>
                      <p className="text-[#4CC9F0] font-mono text-[11px]">
                        <strong className="text-[#4CC9F0]">💡 Aktion:</strong>{' '}
                        {u.kiRecommendation}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* EINGEHENDE ANTRÄGE TABELLE */}
        <motion.div
          {...fadeIn}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-[#1E2530] bg-[#12161D] p-6"
        >
          <h3 className="font-display font-semibold text-lg mb-4">
            Eingehende Anträge der Nutzer
          </h3>

          <div className="rounded-md border border-[#1E2530] bg-[#0A0D12]">
            <Table className="">
              <TableHeader className="border-[#1E2530] bg-[#12161D]">
                <TableRow className="border-[#1E2530] hover:bg-transparent">
                  <TableHead className="w-[80px] font-mono text-[#7C8494]">
                    ID
                  </TableHead>
                  <TableHead className="font-semibold text-[#ECEFF3]">
                    Titel
                  </TableHead>
                  <TableHead className="text-[#7C8494]">Beschreibung</TableHead>
                  <TableHead className="text-center font-mono text-[#4CC9F0]">
                    Status
                  </TableHead>
                  <TableHead className="text-right font-mono text-[#7C8494]">
                    Aktion
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="">
                {antraegeListe.length === 0 ? (
                  <TableRow className="border-[#1E2530]">
                    <TableCell
                      colSpan={5}
                      className="text-center text-[#7C8494] py-8 font-mono text-sm"
                    >
                      Keine Anträge gefunden.
                    </TableCell>
                  </TableRow>
                ) : (
                  antraegeListe.map((antrag) => {
                    const normalisierterStatus = (
                      antrag.status || 'offen'
                    ).toLowerCase();
                    const statusText = normalisierterStatus.toUpperCase();

                    const statusColor =
                      normalisierterStatus === 'genehmigt'
                        ? 'text-[#4CC9F0]'
                        : normalisierterStatus === 'abgelehnt'
                          ? 'text-red-400'
                          : 'text-[#F5A623]';

                    return (
                      <TableRow
                        key={antrag.id}
                        className="border-[#1E2530] hover:bg-white/[0.02]"
                      >
                        <TableCell className="font-mono text-[#7C8494]">
                          {antrag.id}
                        </TableCell>
                        <TableCell className="font-medium text-[#ECEFF3]">
                          {antrag.titel}
                        </TableCell>
                        <TableCell className="text-[#7C8494]">
                          {antrag.beschreibung || '-'}
                        </TableCell>
                        <TableCell
                          className={`text-center font-semibold font-mono ${statusColor}`}
                        >
                          {statusText}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <button
                            onClick={() =>
                              handleStatusUpdate(antrag.id, 'genehmigt')
                            }
                            aria-label="Antrag genehmigen"
                            className="p-2.5 rounded bg-[#4CC9F0]/10 border border-[#4CC9F0]/30 text-[#4CC9F0] hover:bg-[#4CC9F0]/20 transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() =>
                              handleStatusUpdate(antrag.id, 'abgelehnt')
                            }
                            aria-label="Antrag ablehnen"
                            className="p-2.5 rounded bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
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
