"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { isStrongPassword, PASSWORD_RULE_MESSAGE } from "@/lib/password";
import AuthLayout from "@/components/AuthLayout";
import PasswordChecklist from "@/components/PasswordChecklist";
import { Alert, Button, ButtonLink, Field, Input } from "@/components/ui";

export default function ResetPasswordPage() {
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [doneMessage, setDoneMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get("token") ?? "");
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!isStrongPassword(password)) return setError(PASSWORD_RULE_MESSAGE);
    if (password !== confirmPassword) return setError("Passwords don't match.");

    setLoading(true);
    try {
      const { message } = await api<{ message: string }>("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password }),
      });
      setDoneMessage(message);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const invalidLink = token === "";

  return (
    <AuthLayout title="Choose a new password" subtitle="Your new password replaces the old one straight away.">
      {doneMessage ? (
        <div className="space-y-6">
          <Alert tone="success">{doneMessage}</Alert>
          <ButtonLink href="/login" className="w-full">
            Log in
          </ButtonLink>
        </div>
      ) : invalidLink ? (
        <Alert>This reset link is incomplete. Please open the link from your email again.</Alert>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <Alert>{error}</Alert>}
          <Field label="New password" htmlFor="password">
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
            />
            <PasswordChecklist password={password} />
          </Field>
          <Field label="Confirm new password" htmlFor="confirmPassword">
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </Field>
          <Button type="submit" loading={loading} disabled={token === null} className="w-full">
            Reset password
          </Button>
        </form>
      )}
      {!doneMessage && (
        <p className="mt-6 text-center text-sm text-slate-500">
          Link expired?{" "}
          <Link href="/forgot-password" className="font-medium text-brand-600 hover:text-brand-700">
            Request a new one
          </Link>
        </p>
      )}
    </AuthLayout>
  );
}
