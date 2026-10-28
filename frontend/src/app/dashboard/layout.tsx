import { cookies } from "next/headers";
import AppShell from "@/components/AppShell";
import { SESSION_COOKIE, readSessionClaims } from "@/lib/session";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = readSessionClaims((await cookies()).get(SESSION_COOKIE)?.value);
  return <AppShell role={session?.role ?? "student"}>{children}</AppShell>;
}
