"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    // Login page is always accessible
    if (pathname === "/admin/login") {
      setAuthed(true);
      return;
    }

    // Check cookie
    const authCookie = document.cookie
      .split("; ")
      .find((r) => r.startsWith("admin_auth="))
      ?.split("=")[1];

    if (authCookie) {
      // We have a cookie - assume valid (API validates on login)
      setAuthed(true);
    } else {
      router.replace("/admin/login");
    }
  }, [pathname, router]);

  if (authed === null) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return <>{children}</>;
}
