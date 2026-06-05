import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple password-based admin protection
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const authCookie = request.cookies.get("admin_auth")?.value;

    if (authCookie !== ADMIN_PASSWORD) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};
