"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser, logout, Role, User } from "@/lib/api";

// Redirects to /login if not signed in or if the user's role doesn't match
export default function DashboardShell({
  role,
  title,
  children,
}: {
  role: Role;
  title: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const u = getUser();
    if (!u || u.role !== role) {
      router.replace("/login");
      return;
    }
    setUser(u);
  }, [role, router]);

  if (!user) return null;

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <h1 className="text-xl font-semibold">{title}</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{user.name}</span>
          <button
            onClick={() => {
              logout();
              router.push("/login");
            }}
            className="rounded border px-3 py-1 text-sm hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
