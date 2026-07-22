import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Impressum – Aura.AI',
};

export default function ImpressumPage() {
  return (
    <div className="bg-[#0A0D12] text-[#ECEFF3] min-h-screen p-4 py-16">
      <div className="max-w-2xl mx-auto space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[#7C8494] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Zurück zur Startseite
        </Link>

        <div className="rounded-2xl border border-[#1E2530] bg-[#12161D] p-8 space-y-6">
          <h1 className="font-display font-bold text-2xl tracking-tight">
            Impressum
          </h1>

          <p className="text-sm text-[#F5A623] border border-[#F5A623]/30 bg-[#F5A623]/10 rounded-lg p-3">
            Platzhalter – vor dem Live-Betrieb mit den echten Angaben gemäß § 5
            TMG ausfüllen.
          </p>

          <div className="space-y-1.5 text-sm text-[#ECEFF3]">
            <h2 className="font-semibold text-[#7C8494] uppercase text-xs tracking-wide">
              Angaben gemäß § 5 TMG
            </h2>
            <p>[Name / Firma]</p>
            <p>[Straße und Hausnummer]</p>
            <p>[PLZ und Ort]</p>
          </div>

          <div className="space-y-1.5 text-sm text-[#ECEFF3]">
            <h2 className="font-semibold text-[#7C8494] uppercase text-xs tracking-wide">
              Kontakt
            </h2>
            <p>Telefon: [Telefonnummer]</p>
            <p>E-Mail: [E-Mail-Adresse]</p>
          </div>

          <div className="space-y-1.5 text-sm text-[#ECEFF3]">
            <h2 className="font-semibold text-[#7C8494] uppercase text-xs tracking-wide">
              Vertretungsberechtigte Person
            </h2>
            <p>[Name des Vertretungsberechtigten]</p>
          </div>

          <div className="space-y-1.5 text-sm text-[#ECEFF3]">
            <h2 className="font-semibold text-[#7C8494] uppercase text-xs tracking-wide">
              Umsatzsteuer-Identifikationsnummer
            </h2>
            <p>
              Umsatzsteuer-Identifikationsnummer gemäß § 27 a
              Umsatzsteuergesetz: [USt-IdNr.]
            </p>
          </div>

          <div className="space-y-1.5 text-sm text-[#ECEFF3]">
            <h2 className="font-semibold text-[#7C8494] uppercase text-xs tracking-wide">
              Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV
            </h2>
            <p>[Name, Anschrift wie oben]</p>
          </div>
        </div>
      </div>
    </div>
  );
}
