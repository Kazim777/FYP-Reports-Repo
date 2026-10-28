"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, logout, User } from "@/lib/api";
import { homePathFor } from "@/lib/session";
import AuthLayout from "@/components/AuthLayout";
import ChangePasswordForm from "@/components/ChangePasswordForm";
import { Spinner } from "@/components/ui";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    api<{ user: User }>("/auth/me").then(({ user }) => setUser(user));
  }, []);

  async function handleLogout() {
    await logout().catch(() => undefined);
    router.replace("/login");
  }

  if (!user) return <Spinner className="min-h-screen" />;

  return (
    <AuthLayout
      title="Choose a new password"
      subtitle={`Welcome, ${user.name}. Your account was created with a temporary password. Set your own password to continue.`}
    >
      <ChangePasswordForm
        currentLabel="Temporary password"
        submitLabel="Save and continue"
        onChanged={(updated) => router.replace(homePathFor(updated.role))}
      />
      <button
        type="button"
        onClick={handleLogout}
        className="mt-6 text-sm font-medium text-slate-500 hover:text-slate-900"
      >
        Log out instead
      </button>
    </AuthLayout>
  );
}
