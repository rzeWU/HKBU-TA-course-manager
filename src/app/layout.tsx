import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "HKBU TA Course Manager",
  description: "Course assignment and grade management system",
};

function HkbuEmblem() {
  return (
    <svg width="36" height="44" viewBox="0 0 160 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Shield outline */}
      <path d="M80 8 L148 28 L148 100 C148 150 80 192 80 192 C80 192 12 150 12 100 L12 28 Z"
        fill="#1a365d" stroke="none" />
      {/* Inner border */}
      <path d="M80 20 L136 36 L136 96 C136 138 80 172 80 172 C80 172 24 138 24 96 L24 36 Z"
        fill="none" stroke="#C4922A" strokeWidth="2.5" />
      {/* Open book */}
      <path d="M50 56 L80 52 L110 56 L110 100 L80 96 L50 100 Z"
        fill="white" stroke="none" opacity="0.92" />
      <line x1="80" y1="52" x2="80" y2="96" stroke="#1a365d" strokeWidth="1.5" />
      {/* Book lines */}
      <line x1="58" y1="65" x2="78" y2="62" stroke="#1a365d" strokeWidth="0.8" opacity="0.5" />
      <line x1="58" y1="73" x2="78" y2="70" stroke="#1a365d" strokeWidth="0.8" opacity="0.5" />
      <line x1="58" y1="81" x2="78" y2="78" stroke="#1a365d" strokeWidth="0.8" opacity="0.5" />
      <line x1="102" y1="62" x2="82" y2="65" stroke="#1a365d" strokeWidth="0.8" opacity="0.5" />
      <line x1="102" y1="70" x2="82" y2="73" stroke="#1a365d" strokeWidth="0.8" opacity="0.5" />
      <line x1="102" y1="78" x2="82" y2="81" stroke="#1a365d" strokeWidth="0.8" opacity="0.5" />
      {/* Cross on book */}
      <line x1="80" y1="50" x2="80" y2="90" stroke="white" strokeWidth="3" />
      <line x1="68" y1="70" x2="92" y2="70" stroke="white" strokeWidth="3" />
      {/* BU text below book */}
      <text x="80" y="136" textAnchor="middle" fill="white"
        fontFamily="serif" fontSize="32" fontWeight="bold" letterSpacing="3">
        BU
      </text>
      {/* Waves at bottom */}
      <path d="M36 152 Q44 148 52 152 Q60 156 68 152 Q76 148 84 152 Q92 156 100 152 Q108 148 116 152 Q124 156 124 152"
        fill="none" stroke="#C4922A" strokeWidth="1.5" />
    </svg>
  );
}

function HkbuBusinessLogo() {
  return (
    <svg width="130" height="20" viewBox="0 0 260 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="22" fill="white" fontFamily="serif" fontSize="14" fontWeight="600" letterSpacing="2">
        SCHOOL OF BUSINESS
      </text>
      <line x1="0" y1="30" x2="260" y2="30" stroke="#C4922A" strokeWidth="1" opacity="0.6" />
    </svg>
  );
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col relative overflow-x-hidden">
        {/* Background watermark - large semi-transparent BU emblem */}
        <div className="fixed inset-0 pointer-events-none select-none z-0 overflow-hidden">
          <div className="absolute -right-32 -bottom-40 opacity-[0.03]">
            <svg width="600" height="700" viewBox="0 0 160 200">
              <path d="M80 8 L148 28 L148 100 C148 150 80 192 80 192 C80 192 12 150 12 100 L12 28 Z"
                fill="#1a365d" />
              <path d="M80 20 L136 36 L136 96 C136 138 80 172 80 172 C80 172 24 138 24 96 L24 36 Z"
                fill="none" stroke="currentColor" strokeWidth="2.5" />
              <text x="80" y="130" textAnchor="middle" fill="currentColor"
                fontFamily="serif" fontSize="28" fontWeight="bold" letterSpacing="3">
                BU
              </text>
            </svg>
          </div>
          <div className="absolute -left-20 top-1/3 opacity-[0.02]">
            <svg width="400" height="500" viewBox="0 0 160 200">
              <path d="M80 8 L148 28 L148 100 C148 150 80 192 80 192 C80 192 12 150 12 100 L12 28 Z"
                fill="#C4922A" />
              <text x="80" y="130" textAnchor="middle" fill="currentColor"
                fontFamily="serif" fontSize="28" fontWeight="bold" letterSpacing="3">
                BU
              </text>
            </svg>
          </div>
        </div>

        <div className="relative z-10 flex flex-col min-h-full">
          {/* Top bar */}
          <header className="bg-hkbu-navy border-b border-hkbu-navy/90 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                {/* Left: Logos */}
                <div className="flex items-center gap-3">
                  <a
                    href="https://www.hkbu.edu.hk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 hover:opacity-90 transition-opacity"
                    title="Hong Kong Baptist University"
                  >
                    <HkbuEmblem />
                  </a>
                  <a
                    href="https://mscdabe.hkbu.edu.hk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col gap-0.5 hover:opacity-80 transition-opacity group"
                    title="MSc in Data Analytics and Business Economics"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white tracking-wide">
                        HKBU TA Manager
                      </span>
                    </div>
                    <HkbuBusinessLogo />
                  </a>
                </div>

                {/* Right: Navigation */}
                <nav className="flex items-center gap-0.5">
                  <Link
                    href="/program/mscdabe"
                    className="px-4 py-2 text-sm font-medium text-white/85 hover:text-white hover:bg-white/10 rounded-md transition-all"
                  >
                    MScDABE
                  </Link>
                  <Link
                    href="/program/mscaecon"
                    className="px-4 py-2 text-sm font-medium text-white/85 hover:text-white hover:bg-white/10 rounded-md transition-all"
                  >
                    MScAECON
                  </Link>
                  <span className="mx-2 w-px h-5 bg-white/20" />
                  <Link
                    href="/admin"
                    className="px-3 py-2 text-xs text-white/60 hover:text-white hover:bg-white/10 rounded-md transition-all"
                  >
                    Admin
                  </Link>
                </nav>
              </div>
            </div>
          </header>

          {/* Breadcrumb bar */}
          <div className="bg-hkbu-navy/95 border-b border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-7 flex items-center">
              <span className="text-[10px] text-white/35 tracking-[0.2em] uppercase">
                Hong Kong Baptist University · School of Business · MScDABE / MScAECON
              </span>
            </div>
          </div>

          <main className="flex-1">{children}</main>

          {/* Footer */}
          <footer className="bg-hkbu-navy border-t border-white/10 mt-auto">
            <div className="max-w-7xl mx-auto px-4 py-5">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <a href="https://www.hkbu.edu.hk" target="_blank" rel="noopener"
                    className="text-[10px] text-white/40 hover:text-white/70 transition">
                    hkbu.edu.hk
                  </a>
                  <span className="text-white/20">·</span>
                  <a href="https://mscdabe.hkbu.edu.hk" target="_blank" rel="noopener"
                    className="text-[10px] text-white/40 hover:text-white/70 transition">
                    mscdabe.hkbu.edu.hk
                  </a>
                </div>
                <p className="text-[10px] text-white/25">
                  © {new Date().getFullYear()} HKBU TA Course Manager
                </p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
