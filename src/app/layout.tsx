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
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center gap-8">
                <Link
                  href="/"
                  className="text-lg font-bold text-blue-700 hover:text-blue-800"
                >
                  HKBU TA Manager
                </Link>
                <div className="hidden sm:flex gap-6">
                  <Link
                    href="/course/ECON7880"
                    className="text-sm text-gray-600 hover:text-blue-600 transition"
                  >
                    ECON7880
                  </Link>
                  <Link
                    href="/course/ECON3105"
                    className="text-sm text-gray-600 hover:text-blue-600 transition"
                  >
                    ECON3105
                  </Link>
                </div>
              </div>
              <Link
                href="/admin"
                className="text-sm text-gray-500 hover:text-blue-600 transition"
              >
                Admin
              </Link>
            </div>
          </div>
        </nav>
        <main className="flex-1">{children}</main>
        <footer className="bg-white border-t border-gray-200 py-4 text-center text-xs text-gray-400">
          HKBU TA Course Manager &copy; {new Date().getFullYear()}
        </footer>
      </body>
    </html>
  );
}
