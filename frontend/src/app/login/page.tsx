"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, ApiRequestError, User } from "@/lib/api";
import { landingPathFor, safeNextPath } from "@/lib/session";
import AuthLayout from "@/components/AuthLayout";
import ResendVerificationButton from "@/components/ResendVerificationButton";
import { Alert, Button, Field, Input } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setUnverifiedEmail("");
    setLoading(true);
    try {
      const { user } = await api<{ user: User }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      const next = safeNextPath(new URLSearchParams(window.location.search).get("next"));
      router.replace(user.mustChangePassword || !next ? landingPathFor(user) : next);
    } catch (err) {
      if (err instanceof ApiRequestError && err.code === "EMAIL_NOT_VERIFIED") setUnverifiedEmail(email.trim());
      setError((err as Error).message);
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to continue to your dashboard.">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <Alert>{error}</Alert>}
        {unverifiedEmail && <ResendVerificationButton email={unverifiedEmail} />}
        <Field label="Email" htmlFor="email">
          <Input
            id="email"
            type="email"
            placeholder="you@szabist.pk"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
        </Field>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <Link href="/forgot-password" className="text-sm font-medium text-brand-600 hover:text-brand-700">
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" loading={loading} className="w-full">
          Log in
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-brand-600 hover:text-brand-700">
          Create one
        </Link>
      </p>
    </AuthLayout>
  );
}
