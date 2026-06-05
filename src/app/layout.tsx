import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "HKBU TA Course Manager",
  description: "Course assignment and grade management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col theme-hkbu">
        {/* Top bar - HKBU style */}
        <header className="bg-hkbu-navy border-b border-hkbu-navy/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="flex items-center gap-2">
                  {/* HKBU Shield Icon */}
                  <svg className="w-8 h-8" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="15" y="5" width="70" height="90" rx="8" fill="#1a365d" />
                    <rect x="20" y="12" width="60" height="76" rx="4" fill="none" stroke="white" strokeWidth="2" />
                    <text x="50" y="40" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold" fontFamily="serif">HKBU</text>
                    <path d="M35 55 L50 68 L65 55" stroke="white" strokeWidth="2.5" fill="none" />
                    <rect x="38" y="70" width="24" height="6" rx="2" fill="white" />
                  </svg>
                  <div className="flex flex-col leading-tight">
                    <span className="text-sm font-bold text-white tracking-wide">
                      HKBU TA Manager
                    </span>
                    <span className="text-[10px] text-hkbu-gold font-medium tracking-wider uppercase">
                      School of Business
                    </span>
                  </div>
                </div>
              </Link>

              <nav className="flex items-center gap-1">
                <Link
                  href="/program/mscdabe"
                  className="px-4 py-2 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-md transition"
                >
                  MScDABE
                </Link>
                <Link
                  href="/program/mscaecon"
                  className="px-4 py-2 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-md transition"
                >
                  MScAECON
                </Link>
                <span className="mx-1 w-px h-5 bg-white/20" />
                <Link
                  href="/admin"
                  className="px-3 py-2 text-xs text-white/60 hover:text-white hover:bg-white/10 rounded-md transition"
                >
                  Admin
                </Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Sub-nav breadcrumb line */}
        <div className="bg-hkbu-navy/95 border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-8 flex items-center">
            <span className="text-[11px] text-white/40 tracking-wide">
              HONG KONG BAPTIST UNIVERSITY · SCHOOL OF BUSINESS
            </span>
          </div>
        </div>

        <main className="flex-1">{children}</main>

        <footer className="bg-hkbu-navy border-t border-white/10 py-6">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-xs text-white/40">
              HKBU TA Course Manager · School of Business · Hong Kong Baptist University
            </p>
            <p className="text-[10px] text-white/25 mt-1">
              © {new Date().getFullYear()} All rights reserved
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
