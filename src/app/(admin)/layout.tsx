import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminAuthLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("admin_auth");

  if (!authCookie || authCookie.value !== "1") {
    redirect("/admin/login");
  }

  return <>{children}</>;
}
