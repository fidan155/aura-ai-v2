import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Datenschutzerklärung – Aura.AI',
};

export default function DatenschutzPage() {
  return (
    <div className="bg-[#0A0D12] text-[#ECEFF3] min-h-screen p-4 py-16">
      <div className="max-w-2xl mx-auto space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[#7C8494] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Zurück zur Startseite
        </Link>

        <div className="rounded-2xl border border-[#1E2530] bg-[#12161D] p-8 space-y-6 text-sm leading-relaxed">
          <h1 className="font-display font-bold text-2xl tracking-tight">
            Datenschutzerklärung
          </h1>

          <p className="text-[#F5A623] border border-[#F5A623]/30 bg-[#F5A623]/10 rounded-lg p-3">
            Platzhalter – dieser Text ersetzt keine Rechtsberatung. Vor dem
            Live-Betrieb mit den tatsächlichen Angaben (Verantwortlicher,
            Hosting-Anbieter, Speicherdauer, Auftragsverarbeiter) ausfüllen bzw.
            anwaltlich prüfen lassen.
          </p>

          <section className="space-y-1.5">
            <h2 className="font-semibold text-[#7C8494] uppercase text-xs tracking-wide">
              1. Verantwortlicher
            </h2>
            <p>
              Verantwortlicher im Sinne der Datenschutz-Grundverordnung (DSGVO)
              ist: [Name / Firma, Anschrift, E-Mail-Adresse].
            </p>
          </section>

          <section className="space-y-1.5">
            <h2 className="font-semibold text-[#7C8494] uppercase text-xs tracking-wide">
              2. Erhebung und Speicherung personenbezogener Daten
            </h2>
            <p>
              Bei der Registrierung erheben und speichern wir E-Mail-Adresse,
              ein gehashtes Passwort sowie die von dir angegebene Adresse
              (Straße, PLZ, Stadt), um dein Konto anzulegen und den Zugang zur
              Anwendung zu ermöglichen. Beim Login erfassen wir zusätzlich
              Zeitpunkt und Anzahl der Anmeldungen sowie Interaktionen innerhalb
              der Anwendung (Funktionsnutzung), um den Dienst technisch
              bereitzustellen und auszuwerten.
            </p>
          </section>

          <section className="space-y-1.5">
            <h2 className="font-semibold text-[#7C8494] uppercase text-xs tracking-wide">
              3. Weitergabe von Daten
            </h2>
            <p>
              Eine Übermittlung deiner Daten an Dritte findet nicht statt, außer
              soweit gesetzlich vorgeschrieben oder zur Bereitstellung des
              Dienstes technisch erforderlich (z. B. Hosting-Infrastruktur).
              [Hosting-Anbieter benennen, falls vorhanden.]
            </p>
          </section>

          <section className="space-y-1.5">
            <h2 className="font-semibold text-[#7C8494] uppercase text-xs tracking-wide">
              4. Speicherdauer
            </h2>
            <p>
              Deine Daten werden gespeichert, solange dein Konto besteht.
              [Konkrete Löschfristen nach Kontolöschung ergänzen.]
            </p>
          </section>

          <section className="space-y-1.5">
            <h2 className="font-semibold text-[#7C8494] uppercase text-xs tracking-wide">
              5. Deine Rechte
            </h2>
            <p>
              Du hast jederzeit das Recht auf Auskunft, Berichtigung, Löschung
              und Einschränkung der Verarbeitung deiner personenbezogenen Daten
              sowie ein Widerspruchsrecht gegen die Verarbeitung und ein Recht
              auf Datenübertragbarkeit. Zur Ausübung dieser Rechte wende dich
              an: [Kontakt-E-Mail-Adresse].
            </p>
          </section>

          <section className="space-y-1.5">
            <h2 className="font-semibold text-[#7C8494] uppercase text-xs tracking-wide">
              6. Beschwerderecht
            </h2>
            <p>
              Du hast das Recht, dich bei einer Datenschutz-Aufsichtsbehörde
              über die Verarbeitung deiner personenbezogenen Daten zu
              beschweren.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
