"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import AuthLayout from "@/components/AuthLayout";
import { Alert, ButtonLink, Spinner } from "@/components/ui";

type Result = { tone: "success" | "error"; text: string };

export default function VerifyEmailPage() {
  const [result, setResult] = useState<Result | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      setResult({ tone: "error", text: "This verification link is incomplete. Please open the link from your email again." });
      return;
    }

    api<{ message: string }>("/auth/verify-email", { method: "POST", body: JSON.stringify({ token }) })
      .then(({ message }) => setResult({ tone: "success", text: message }))
      .catch((err) => setResult({ tone: "error", text: (err as Error).message }));
  }, []);

  return (
    <AuthLayout title="Verify your email" subtitle="Confirming your email address for FYP Hub.">
      {!result ? (
        <Spinner />
      ) : (
        <div className="space-y-6">
          <Alert tone={result.tone}>{result.text}</Alert>
          {result.tone === "success" ? (
            <ButtonLink href="/login" className="w-full">
              Log in
            </ButtonLink>
          ) : (
            <p className="text-center text-sm text-slate-500">
              Need a new link?{" "}
              <Link href="/check-email" className="font-medium text-brand-600 hover:text-brand-700">
                Request another verification email
              </Link>
            </p>
          )}
        </div>
      )}
    </AuthLayout>
  );
}
