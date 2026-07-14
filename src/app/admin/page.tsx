'use client';
import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Terminal, ShieldAlert, LogOut, Check, X, Brain, UserCheck, AlertTriangle, EyeOff } from 'lucide-react';

// TypeScript Interfaces definieren
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

  // 2. KI-Nutzeranalysen laden (Neu)
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
    ladeAntraege();
    ladeUserAnalyse(); // Direkt beim Start mitladen
  }, []);

  const handleStatusUpdate = async (id: number, neuerStatus: 'genehmigt' | 'abgelehnt') => {
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
    <div className="bg-[#020204] text-slate-100 min-h-screen font-sans selection:bg-cyan-500/30 overflow-x-hidden relative p-6 md:p-12">
      <div className="absolute top-[-10%] left-[-20%] w-[600px] h-[600px] rounded-full bg-purple-500/5 blur-[160px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-[5%] right-[-10%] w-[600px] h-[600px] rounded-full bg-cyan-500/10 blur-[150px] pointer-events-none mix-blend-screen" />

      <div className="max-w-5xl mx-auto space-y-10 relative z-10">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 via-cyan-500 to-purple-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Terminal className="w-4 h-4 text-black font-bold" />
            </div>
            <span className="font-bold tracking-tight text-lg bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              AURA.AI // Admin Control
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-xs font-mono text-red-400">
              <ShieldAlert className="w-3.5 h-3.5" /> SECURE NODE ACTIVE
            </div>
            <button onClick={handleLogout} className="bg-white/5 border border-white/10 text-slate-300 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 font-medium text-xs px-3 py-2 rounded-full transition flex items-center gap-1.5">
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>

        {/* --- NEU: KI-NUTZER-RADAR SECTION --- */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400 animate-pulse" />
            <h3 className="text-lg font-bold text-white">KI-Nutzer-Radar <span className="text-xs font-normal text-slate-400 font-mono">(Engagement & Churn-Fokus)</span></h3>
          </div>

          {loadingKi ? (
            <div className="text-center py-8 font-mono text-xs text-slate-500">Lade KI-Verhaltensdaten...</div>
          ) : userAnalysen.length === 0 ? (
            <div className="text-center py-8 font-mono text-xs text-slate-500">Keine Nutzer-Verbindungen getrackt.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userAnalysen.map((u) => {
                // Status-Zuweisung für Icons und Farben
                const badgeColor = 
                  u.kiStatus === 'Active' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                  u.kiStatus === 'At Risk' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' :
                  'bg-red-500/10 border-red-500/20 text-red-400';

                const StatusIcon = 
                  u.kiStatus === 'Active' ? UserCheck :
                  u.kiStatus === 'At Risk' ? AlertTriangle : EyeOff;

                return (
                  <div key={u.id} className="p-4 rounded-xl border border-white/5 bg-black/40 flex flex-col justify-between space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-200 truncate max-w-[200px]">{u.email}</p>
                        <p className="text-[10px] font-mono text-slate-500 mt-0.5">Logins: {u.loginCount} | Klicks: {u.featureClicks}</p>
                      </div>
                      <span className={`flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}>
                        <StatusIcon className="w-3 h-3" /> {u.kiStatus.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="space-y-1.5 text-xs">
                      <p className="text-slate-400 leading-relaxed"><strong className="text-slate-300">Analyse:</strong> {u.kiSummary}</p>
                      <p className="text-purple-300 font-mono text-[11px]"><strong className="text-purple-400">💡 Aktion:</strong> {u.kiRecommendation}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Tabelle (Bestehend) */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Eingehende Anträge der User</h3>
          
          <div className="rounded-md border border-white/5 bg-black/40">
            <Table className="">
              <TableHeader className="border-white/5 bg-white/[0.02]">
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="w-[80px] font-mono text-slate-400">ID</TableHead>
                  <TableHead className="font-bold text-white">Titel</TableHead>
                  <TableHead className="text-slate-400">Beschreibung</TableHead>
                  <TableHead className="text-center font-mono text-cyan-400">Status</TableHead>
                  <TableHead className="text-right font-mono text-slate-400">Aktion</TableHead>
                </TableRow>
              </TableHeader>
            <TableBody className="">
                {antraegeListe.length === 0 ? (
                  <TableRow className="border-white/5">
                    <TableCell colSpan={5} className="text-center text-slate-600 py-8 font-mono">Keine Anträge gefunden.</TableCell>
                  </TableRow>
                ) : (
                  antraegeListe.map((antrag) => {
                    const normalisierterStatus = (antrag.status || 'offen').toLowerCase();
                    const statusText = normalisierterStatus.toUpperCase();
                    
                    const statusColor = 
                      normalisierterStatus === 'genehmigt' ? 'text-emerald-400' : 
                      normalisierterStatus === 'abgelehnt' ? 'text-red-400' : 
                      'text-yellow-400';

                    return (
                      <TableRow key={antrag.id} className="border-white/5 hover:bg-white/[0.01]">
                        <TableCell className="font-mono text-slate-500">{antrag.id}</TableCell>
                        <TableCell className="font-medium text-slate-200">{antrag.titel}</TableCell>
                        <TableCell className="text-slate-400">{antrag.beschreibung || '-'}</TableCell>
                        <TableCell className={`text-center font-semibold font-mono ${statusColor}`}>{statusText}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <button onClick={() => handleStatusUpdate(antrag.id, 'genehmigt')} className="p-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition"><Check className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleStatusUpdate(antrag.id, 'abgelehnt')} className="p-1 rounded bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition"><X className="w-3.5 h-3.5" /></button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>

      </div>
    </div>
  );
}