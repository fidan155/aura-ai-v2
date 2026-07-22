import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, SearchX } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="bg-[#0A0D12] text-[#ECEFF3] min-h-screen flex items-center justify-center p-4">
      <div className="fixed inset-0 pointer-events-none opacity-[0.35] bg-[radial-gradient(circle_at_20%_0%,rgba(76,201,240,0.08),transparent_45%),radial-gradient(circle_at_85%_20%,rgba(245,166,35,0.06),transparent_40%)]" />

      <div className="w-full max-w-md space-y-6 rounded-2xl border border-[#1E2530] bg-[#12161D] p-8 shadow-2xl relative z-10 text-center">
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#1E2530] bg-[#0A0D12]">
            <SearchX className="w-3.5 h-3.5 text-[#F5A623]" />
            <span className="font-mono text-[10px] text-[#7C8494] tracking-wide uppercase">
              404
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-semibold">Seite nicht gefunden</h1>
          <p className="text-sm text-[#7C8494]">
            Die angeforderte Seite existiert nicht oder wurde verschoben.
          </p>
        </div>

        <Button asChild className="w-full">
          <Link href="/">
            <ArrowLeft className="w-4 h-4 mr-2" /> Zurück zur Startseite
          </Link>
        </Button>
      </div>
    </div>
  );
}
