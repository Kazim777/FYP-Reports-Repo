"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import AuthLayout from "@/components/AuthLayout";
import { Alert, Button, Field, Input } from "@/components/ui";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sentMessage, setSentMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { message } = await api<{ message: string }>("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setSentMessage(message);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Forgot your password?" subtitle="Enter your email and we'll send you a link to reset it.">
      {sentMessage ? (
        <div className="space-y-4">
          <Alert tone="success">{sentMessage}</Alert>
          <p className="text-sm text-slate-500">The link expires in 30 minutes. Check your spam folder if you can&apos;t find it.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <Alert>{error}</Alert>}
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
          <Button type="submit" loading={loading} className="w-full">
            Send reset link
          </Button>
        </form>
      )}
      <p className="mt-6 text-center text-sm text-slate-500">
        Remembered it?{" "}
        <Link href="/login" className="font-medium text-brand-600 hover:text-brand-700">
          Back to log in
        </Link>
      </p>
    </AuthLayout>
  );
}
