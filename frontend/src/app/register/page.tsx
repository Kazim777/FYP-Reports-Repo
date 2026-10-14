"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { BookOpen, GraduationCap } from "lucide-react";
import { api, saveSession, dashboardPath, Role, User } from "@/lib/api";
import AuthLayout from "@/components/AuthLayout";
import { Alert, Button, Field, Input } from "@/components/ui";

const roles: { value: Role; label: string; icon: React.ElementType }[] = [
  { value: "student", label: "Student", icon: GraduationCap },
  { value: "faculty", label: "Faculty", icon: BookOpen },
];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student" as Role });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const { token, user } = await api<{ token: string; user: User }>("/auth/register", {
        method: "POST",
        body: JSON.stringify(form),
      });
      saveSession(token, user);
      router.push(dashboardPath(user.role));
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Create your account" subtitle="Join the FYP repository in less than a minute.">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <Alert>{error}</Alert>}

        <div className="grid grid-cols-2 gap-3">
          {roles.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setForm({ ...form, role: r.value })}
              className={clsx(
                "flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition",
                form.role === r.value
                  ? "border-brand-500 bg-brand-50 text-brand-700 ring-4 ring-brand-100"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              )}
            >
              <r.icon className="size-4" />
              {r.label}
            </button>
          ))}
        </div>

        <Field label="Full name" htmlFor="name">
          <Input
            id="name"
            placeholder="Ali Khan"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </Field>
        <Field label="Email" htmlFor="email">
          <Input
            id="email"
            type="email"
            placeholder="you@szabist.pk"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </Field>
        <Field label="Password" htmlFor="password" hint="At least 6 characters.">
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </Field>
        <Button type="submit" loading={loading} className="w-full">
          Create account
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        Already registered?{" "}
        <Link href="/login" className="font-medium text-brand-600 hover:text-brand-700">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}
