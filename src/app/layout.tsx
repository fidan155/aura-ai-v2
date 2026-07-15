import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// Typisiertes SEO-Metadata-Objekt
export const metadata: Metadata = {
  title: 'Aura.AI – Sicherheits-Infrastruktur der nächsten Generation',
  description:
    'Automatisiert Security-Compliance, wertet Telemetriedaten in Echtzeit aus und vereint verteilte Intelligenz-Ebenen in einem lokal betriebenen Zero-Trust-Ökosystem.',
  keywords: [
    'KI SaaS',
    'Cybersicherheit',
    'Enterprise KI',
    'Next.js',
    'Zero-Trust',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="de"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col relative bg-[#020204]">
        {children}
      </body>
    </html>
  );
}