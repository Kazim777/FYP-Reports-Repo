"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { dashboardPath, getUser, logout, saveUser, User } from "@/lib/api";
import AuthLayout from "@/components/AuthLayout";
import ChangePasswordForm from "@/components/ChangePasswordForm";
import { Spinner } from "@/components/ui";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const current = getUser();
    if (!current) router.replace("/login");
    else if (!current.mustChangePassword) router.replace(dashboardPath(current.role));
    else setUser(current);
  }, [router]);

  if (!user) return <Spinner className="min-h-screen" />;

  return (
    <AuthLayout
      title="Choose a new password"
      subtitle={`Welcome, ${user.name}. Your account was created with a temporary password. Set your own password to continue.`}
    >
      <ChangePasswordForm
        currentLabel="Temporary password"
        submitLabel="Save and continue"
        onChanged={(updated) => {
          saveUser(updated);
          router.replace(dashboardPath(updated.role));
        }}
      />
      <button
        type="button"
        onClick={() => {
          logout();
          router.replace("/login");
        }}
        className="mt-6 text-sm font-medium text-slate-500 hover:text-slate-900"
      >
        Log out instead
      </button>
    </AuthLayout>
  );
}
