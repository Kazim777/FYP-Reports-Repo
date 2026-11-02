"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { readPendingEmail } from "@/lib/pendingEmail";
import AuthLayout from "@/components/AuthLayout";
import ResendVerificationButton from "@/components/ResendVerificationButton";
import { Field, Input } from "@/components/ui";

export default function CheckEmailPage() {
  const [email, setEmail] = useState("");
  const [knownEmail, setKnownEmail] = useState(false);

  useEffect(() => {
    const pending = readPendingEmail();
    setEmail(pending);
    setKnownEmail(Boolean(pending));
  }, []);

  return (
    <AuthLayout title="Check your email" subtitle="One more step to activate your student account.">
      <div className="space-y-6">
        <div className="flex items-start gap-3 rounded-lg border border-brand-100 bg-brand-50 p-4 text-sm text-brand-900">
          <MailCheck className="mt-0.5 size-5 shrink-0 text-brand-600" />
          <p>
            We sent a verification link to {knownEmail ? <strong className="break-all">{email}</strong> : "your email"}.
            Open it to activate your account, then log in. The link expires in 24 hours.
          </p>
        </div>

        <p className="text-sm text-slate-500">
          Can&apos;t find it? Check your spam folder or request a new link.
        </p>

        {!knownEmail && (
          <Field label="Email" htmlFor="email">
            <Input
              id="email"
              type="email"
              placeholder="you@szabist.pk"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
        )}

        <ResendVerificationButton email={email.trim()} />
      </div>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already verified?{" "}
        <Link href="/login" className="font-medium text-brand-600 hover:text-brand-700">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}
