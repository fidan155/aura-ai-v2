'use client';

'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import {
  Shield,
  Cpu,
  Zap,
  Terminal,
  Lock,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Sparkles,
  TrendingUp,
  Menu,
  X,
  Radar as RadarIcon,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Design tokens
//  bg        #0A0D12  (graphite night)
//  panel     #12161D
//  border    #1E2530
//  amber     #F5A623  (alert / signal accent)
//  cyan      #4CC9F0  (telemetry / data accent)
//  text      #ECEFF3
//  muted     #7C8494
// ---------------------------------------------------------------------------

const FONT_IMPORT = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

* { font-family: 'Inter', sans-serif; }
.font-display { font-family: 'Space Grotesk', sans-serif; }
.font-mono { font-family: 'JetBrains Mono', monospace; }

@keyframes radar-spin { to { transform: rotate(360deg); } }
.radar-sweep { animation: radar-spin 7s linear infinite; transform-origin: 200px 200px; }

@keyframes pulse-ring { 0% { opacity: .5; } 50% { opacity: 1; } 100% { opacity: .5; } }
.pulse-ring { animation: pulse-ring 3.5s ease-in-out infinite; }

@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
.animate-marquee { animation: marquee 28s linear infinite; }

@keyframes rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
.animate-rise { animation: rise .6s cubic-bezier(.16,1,.3,1) both; }

@media (prefers-reduced-motion: reduce) {
  .radar-sweep, .pulse-ring, .animate-marquee, .animate-rise { animation: none !important; }
}
`;

const logos = ['VECTORA', 'NORTHBEAM', 'GRIDLOCK', 'FERROX', 'HALFDOME', 'OPALINE'];

const stats = [
  { value: '99.98%', label: 'Detection accuracy', bar: 'w-[98%]' },
  { value: '4.2 min', label: 'Avg. time to detect', bar: 'w-[85%]' },
  { value: '24/7', label: 'Autonomous coverage', bar: 'w-full' },
  { value: '<12ms', label: 'Edge response time', bar: 'w-[93%]' },
];

const features = [
  {
    icon: <Cpu className="w-5 h-5" />,
    tag: '01',
    title: 'Autonomous detection engine',
    description:
      'Models trained on your infrastructure\u2019s own baseline flag deviations the moment they happen \u2014 not after the postmortem.',
  },
  {
    icon: <Shield className="w-5 h-5" />,
    tag: '02',
    title: 'Zero-trust by default',
    description:
      'Every service call is verified and every credential scoped. Nothing on the network is trusted implicitly \u2014 including Aura itself.',
  },
  {
    icon: <Zap className="w-5 h-5" />,
    tag: '03',
    title: 'Deploys where your data lives',
    description:
      'Run fully on-prem, inside your VPC, or air-gapped. Telemetry never leaves your perimeter unless you say so.',
  },
];

const testimonials = [
  {
    quote:
      'We cut our mean time to detect from hours to minutes without adding headcount to the SOC. The policy engine catches things our old rules-based tooling never would have.',
    author: 'S. Jenkins',
    role: 'CISO, Vectora',
  },
  {
    quote:
      'Rolling Aura out air-gapped was the deciding factor. Everything runs inside our own boundary, and the audit trail holds up to our compliance team\u2019s scrutiny.',
    author: 'M. Vance',
    role: 'VP Engineering, Northbeam',
  },
];

const faqs = [
  {
    q: 'Does Aura train on our data?',
    a: 'No. Detection models are fine-tuned per tenant and isolated \u2014 your telemetry never contributes to a shared or public model.',
  },
  {
    q: 'Can we run Aura fully offline?',
    a: 'Yes. Air-gapped and on-prem deployments are fully supported, including policy updates delivered via signed offline bundles.',
  },
  {
    q: 'What compliance certifications do you hold?',
    a: 'SOC 2 Type II and ISO 27001 are complete. FedRAMP Moderate authorization is in progress, targeted for Q1 next year.',
  },
];

const NavLink = ({ href, children }) => (
  <a href={href} className="hover:text-white transition-colors">
    {children}
  </a>
);

const Eyebrow = ({ n, children }) => (
  <div className="flex items-center gap-2 mb-4 justify-center">
    <span className="font-mono text-[11px] text-[#F5A623] tracking-widest">// {n}</span>
    <span className="font-mono text-[11px] text-[#7C8494] tracking-[0.25em] uppercase">{children}</span>
  </div>
);

function RadarSignature() {
  const nodes = [
    { x: 260, y: 120, d: '0s' },
    { x: 120, y: 260, d: '1.2s' },
    { x: 300, y: 300, d: '2.1s' },
    { x: 90, y: 140, d: '0.6s' },
  ];
  return (
    <div className="relative w-full max-w-[420px] mx-auto aspect-square">
      <svg viewBox="0 0 400 400" className="w-full h-full">
        <defs>
          <radialGradient id="sweepGrad" cx="0%" cy="0%" r="100%">
            <stop offset="0%" stopColor="#4CC9F0" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#4CC9F0" stopOpacity="0" />
          </radialGradient>
        </defs>

        {[70, 120, 170].map((r) => (
          <circle
            key={r}
            cx="200"
            cy="200"
            r={r}
            fill="none"
            stroke="#1E2530"
            strokeWidth="1"
          />
        ))}
        <line x1="30" y1="200" x2="370" y2="200" stroke="#1E2530" strokeWidth="1" />
        <line x1="200" y1="30" x2="200" y2="370" stroke="#1E2530" strokeWidth="1" />

        <g className="radar-sweep">
          <path d="M200 200 L200 30 A170 170 0 0 1 347 115 Z" fill="url(#sweepGrad)" />
        </g>

        <circle cx="200" cy="200" r="170" fill="none" stroke="#4CC9F0" strokeOpacity="0.35" strokeWidth="1.5" />

        {nodes.map((n, i) => (
          <g key={i}>
            <circle cx={n.x} cy={n.y} r="3.5" fill="#F5A623" />
            <circle
              cx={n.x}
              cy={n.y}
              r="9"
              fill="none"
              stroke="#F5A623"
              strokeWidth="1"
              className="pulse-ring"
              style={{ animationDelay: n.d }}
            />
          </g>
        ))}
        <circle cx="200" cy="200" r="4" fill="#ECEFF3" />
      </svg>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-[0.3em] text-[#7C8494] uppercase">
        live telemetry
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="bg-[#0A0D12] text-[#ECEFF3] min-h-screen selection:bg-[#F5A623] selection:text-[#0A0D12]">
      <style>{FONT_IMPORT}</style>

      {/* background texture */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.35] bg-[radial-gradient(circle_at_20%_0%,rgba(76,201,240,0.08),transparent_45%),radial-gradient(circle_at_85%_20%,rgba(245,166,35,0.06),transparent_40%)]" />

      {/* NAV */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 w-[94%] max-w-5xl z-50">
        <div className="rounded-2xl border border-[#1E2530] bg-[#0A0D12]/80 backdrop-blur-xl px-5 py-3 flex items-center justify-between shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-[#F5A623] flex items-center justify-center">
              <Terminal className="w-3.5 h-3.5 text-[#0A0D12]" strokeWidth={2.5} />
            </div>
            <span className="font-display font-bold tracking-tight text-sm">AURA</span>
            <span className="font-mono text-[10px] text-[#7C8494]">v2.6</span>
          </div>

          <div className="hidden md:flex items-center gap-7 font-mono text-xs text-[#7C8494] uppercase tracking-wider">
            <NavLink href="#capabilities">Capabilities</NavLink>
            <NavLink href="#deployment">Deployment</NavLink>
            <NavLink href="#trust">Trust</NavLink>
            <NavLink href="#faq">FAQ</NavLink>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <Link href="/login" className="text-xs font-medium text-[#7C8494] hover:text-white transition-colors px-3 py-1.5">
              Sign in
            </Link>
            <Link
              href="/register"
              className="bg-[#F5A623] text-[#0A0D12] font-semibold text-xs px-4 py-2 rounded-lg hover:bg-[#ffb945] transition-colors flex items-center gap-1"
            >
              Sign up <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <button className="sm:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="sm:hidden mt-2 rounded-2xl border border-[#1E2530] bg-[#0A0D12] p-4 flex flex-col gap-3 font-mono text-xs text-[#7C8494] uppercase tracking-wider">
            <NavLink href="#capabilities">Capabilities</NavLink>
            <NavLink href="#deployment">Deployment</NavLink>
            <NavLink href="#trust">Trust</NavLink>
            <NavLink href="#faq">FAQ</NavLink>
            <Link href="/login" className="hover:text-white transition-colors">
              Sign in
            </Link>
            <Link
              href="/register"
              className="mt-1 bg-[#F5A623] text-[#0A0D12] font-semibold text-xs px-4 py-2 rounded-lg text-center"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>

      {/* HERO */}
      <section className="relative pt-40 pb-20 px-6 max-w-6xl mx-auto z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          <div className="animate-rise">
            <div className="inline-flex items-center gap-1.5 border border-[#1E2530] bg-[#12161D] rounded-full px-3 py-1 mb-6">
              <Sparkles className="w-3 h-3 text-[#F5A623]" />
              <span className="font-mono text-[11px] text-[#7C8494] tracking-wide">now watching 40,000+ services</span>
            </div>

            <h1 className="font-display font-bold tracking-tight text-4xl sm:text-5xl md:text-6xl leading-[1.08] mb-6">
              Security operations
              <br />
              that never sleep.
            </h1>

            <p className="text-[#7C8494] text-base sm:text-lg leading-relaxed mb-9 max-w-lg">
              Aura watches your infrastructure in real time, flags what actually
              matters, and closes the loop before an incident becomes a headline.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setIsOpen(true)}
                className="bg-[#F5A623] text-[#0A0D12] font-semibold text-sm px-6 py-3.5 rounded-xl hover:bg-[#ffb945] transition-colors flex items-center justify-center gap-1.5"
              >
                Request access <ArrowUpRight className="w-4 h-4" />
              </button>
              <button className="border border-[#1E2530] text-[#ECEFF3] font-medium text-sm px-6 py-3.5 rounded-xl hover:bg-[#12161D] transition-colors">
                View architecture
              </button>
            </div>
          </div>

          <RadarSignature />
        </div>
      </section>

      {/* LOGO MARQUEE */}
      <section className="border-y border-[#1E2530] py-8 overflow-hidden">
        <p className="text-center font-mono text-[11px] text-[#7C8494] tracking-[0.25em] uppercase mb-6">
          Trusted by security teams at
        </p>
        <div className="flex whitespace-nowrap">
          <div className="flex gap-16 animate-marquee pr-16">
            {[...logos, ...logos].map((logo, idx) => (
              <span key={idx} className="font-display font-semibold text-lg text-[#7C8494] tracking-wide">
                {logo}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="capabilities" className="py-24 px-6 max-w-6xl mx-auto">
        <Eyebrow n="01">Capabilities</Eyebrow>
        <h2 className="font-display font-bold text-3xl sm:text-4xl text-center mb-4 tracking-tight">
          Built to notice what rules miss
        </h2>
        <p className="text-[#7C8494] text-center max-w-xl mx-auto mb-16 text-sm sm:text-base">
          No static rule sets. No alert fatigue. Just a model that knows what
          normal looks like for your systems.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {features.map((feat, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-[#1E2530] bg-[#12161D] p-7 hover:border-[#4CC9F0]/40 transition-colors duration-300 group"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="w-10 h-10 rounded-lg bg-[#0A0D12] border border-[#1E2530] flex items-center justify-center text-[#4CC9F0] group-hover:text-[#F5A623] group-hover:border-[#F5A623]/40 transition-colors">
                  {feat.icon}
                </div>
                <span className="font-mono text-[11px] text-[#7C8494]">{feat.tag}</span>
              </div>
              <h3 className="font-display font-semibold text-base mb-2.5">{feat.title}</h3>
              <p className="text-[#7C8494] text-sm leading-relaxed">{feat.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DEPLOYMENT / TERMINAL SHOWCASE */}
      <section id="deployment" className="py-12 px-6 max-w-6xl mx-auto">
        <Eyebrow n="02">Deployment</Eyebrow>
        <div className="rounded-3xl border border-[#1E2530] bg-[#12161D] p-8 md:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-1.5 border border-[#1E2530] rounded-full px-3 py-1 mb-5">
                <Lock className="w-3.5 h-3.5 text-[#F5A623]" />
                <span className="font-mono text-[11px] text-[#7C8494]">isolated by design</span>
              </div>
              <h3 className="font-display font-bold text-2xl md:text-3xl tracking-tight mb-4">
                Runs inside your own perimeter
              </h3>
              <p className="text-[#7C8494] text-sm leading-relaxed mb-6">
                Deploy on-prem, inside your VPC, or fully air-gapped. Your
                telemetry stays where you put it, full stop.
              </p>
              <ul className="space-y-3 text-sm text-[#ECEFF3]">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#4CC9F0] shrink-0" /> SOC 2 Type II, ISO 27001 certified
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#4CC9F0] shrink-0" /> Signed offline policy updates
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#4CC9F0] shrink-0" /> Full audit trail, exportable on demand
                </li>
              </ul>
            </div>

            <div className="rounded-xl bg-[#0A0D12] border border-[#1E2530] p-6 font-mono text-xs leading-relaxed">
              <div className="flex items-center gap-1.5 border-b border-[#1E2530] pb-3 mb-4">
                <div className="w-2.5 h-2.5 rounded-full bg-[#1E2530]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#1E2530]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#1E2530]" />
                <span className="ml-2 text-[10px] text-[#7C8494] tracking-widest uppercase">aura-cli</span>
              </div>
              <p className="text-[#7C8494]">$ aura init --scope=prod-us-east</p>
              <p className="text-[#4CC9F0]">[ok] baseline captured — 14,203 services mapped</p>
              <p className="text-[#4CC9F0]">[ok] policy engine active</p>
              <p className="text-[#7C8494] mt-3">$ aura status</p>
              <p className="text-white">autonomous coverage: 100% · open incidents: 0</p>
              <span className="inline-block w-2 h-4 bg-[#F5A623] align-middle mt-1" />
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <Eyebrow n="03">Metrics</Eyebrow>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((stat, idx) => (
            <div key={idx} className="rounded-2xl border border-[#1E2530] bg-[#12161D] p-6">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-display font-bold text-2xl sm:text-3xl tracking-tight">{stat.value}</span>
                <TrendingUp className="w-3.5 h-3.5 text-[#4CC9F0]" />
              </div>
              <div className="font-mono text-[11px] text-[#7C8494] uppercase tracking-wider mb-4">{stat.label}</div>
              <div className="h-1 rounded-full bg-[#0A0D12] overflow-hidden">
                <div className={`${stat.bar} h-full bg-[#4CC9F0] rounded-full`} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="trust" className="py-12 px-6 max-w-6xl mx-auto">
        <Eyebrow n="04">Trust</Eyebrow>
        <h2 className="font-display font-bold text-3xl text-center mb-14 tracking-tight">
          Vouched for by security leaders
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {testimonials.map((t, idx) => (
            <div key={idx} className="rounded-2xl border border-[#1E2530] bg-[#12161D] p-8 flex flex-col justify-between">
              <p className="text-[#ECEFF3] text-sm md:text-base leading-relaxed mb-8">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-3 border-t border-[#1E2530] pt-5">
                <div className="w-9 h-9 rounded-full bg-[#0A0D12] border border-[#1E2530] flex items-center justify-center font-mono text-xs text-[#F5A623]">
                  {t.author.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <div className="font-semibold text-sm">{t.author}</div>
                  <div className="text-xs text-[#7C8494]">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 max-w-5xl mx-auto">
        <div className="relative rounded-3xl border border-[#F5A623]/25 bg-gradient-to-b from-[#12161D] to-[#0A0D12] p-10 md:p-14 text-center overflow-hidden">
          <RadarIcon className="w-6 h-6 text-[#F5A623] mx-auto mb-5" />
          <h2 className="font-display font-bold text-3xl md:text-5xl tracking-tight mb-4">
            Put your infrastructure on watch.
          </h2>
          <p className="text-[#7C8494] mb-8 max-w-md mx-auto text-sm">
            Onboarding your first environment takes under ten minutes.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={() => setIsOpen(true)}
              className="bg-[#F5A623] text-[#0A0D12] font-semibold text-sm px-6 py-3.5 rounded-xl hover:bg-[#ffb945] transition-colors"
            >
              Request access
            </button>
            <button className="border border-[#1E2530] text-[#ECEFF3] font-medium text-sm px-6 py-3.5 rounded-xl hover:bg-[#12161D] transition-colors">
              Book a demo
            </button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16 px-6 max-w-3xl mx-auto">
        <Eyebrow n="05">FAQ</Eyebrow>
        <h3 className="font-display font-bold text-2xl text-center mb-10">Frequently asked questions</h3>
        <div className="rounded-2xl border border-[#1E2530] bg-[#12161D] divide-y divide-[#1E2530]">
          {faqs.map((f, idx) => (
            <div key={idx}>
              <button
                onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                className="w-full flex items-center justify-between px-6 py-4 text-left"
              >
                <span className="font-medium text-sm">{f.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-[#7C8494] shrink-0 transition-transform duration-300 ${
                    openFaq === idx ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openFaq === idx && (
                <p className="px-6 pb-4 text-[#7C8494] text-sm leading-relaxed">{f.a}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      <footer className="py-10 px-6 text-center font-mono text-[11px] text-[#7C8494] tracking-wider border-t border-[#1E2530]">
        AURA.AI — SECURITY OPERATIONS CONSOLE
      </footer>

      {/* MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="relative bg-[#12161D] border border-[#1E2530] rounded-2xl p-6 w-full max-w-md shadow-2xl z-10 animate-rise">
            <h3 className="font-display font-semibold text-lg mb-1">Request access</h3>
            <p className="text-[#7C8494] text-xs sm:text-sm mb-5">
              Tell us about your environment and we&apos;ll reach out within one business day.
            </p>
            <div className="space-y-3 mb-5">
              <input
                type="email"
                placeholder="name@company.com"
                className="w-full px-3.5 py-2.5 text-sm bg-[#0A0D12] border border-[#1E2530] rounded-lg focus:outline-none focus:border-[#4CC9F0] placeholder:text-[#7C8494]"
              />
              <input
                type="text"
                placeholder="Company"
                className="w-full px-3.5 py-2.5 text-sm bg-[#0A0D12] border border-[#1E2530] rounded-lg focus:outline-none focus:border-[#4CC9F0] placeholder:text-[#7C8494]"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-xs font-semibold border border-[#1E2530] rounded-lg hover:bg-[#0A0D12] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-xs font-semibold bg-[#F5A623] text-[#0A0D12] rounded-lg hover:bg-[#ffb945] transition-colors"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}