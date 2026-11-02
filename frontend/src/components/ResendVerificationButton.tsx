"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Alert, Button } from "@/components/ui";

const COOLDOWN_SECONDS = 60;

export default function ResendVerificationButton({ email }: { email: string }) {
  const [sending, setSending] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [status, setStatus] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  async function resend() {
    setStatus(null);
    setSending(true);
    try {
      const { message } = await api<{ message: string }>("/auth/resend-verification", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setStatus({ tone: "success", text: message });
      setSecondsLeft(COOLDOWN_SECONDS);
    } catch (err) {
      setStatus({ tone: "error", text: (err as Error).message });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-3">
      {status && <Alert tone={status.tone}>{status.text}</Alert>}
      <Button
        type="button"
        variant="secondary"
        className="w-full"
        loading={sending}
        disabled={!email || secondsLeft > 0}
        onClick={resend}
      >
        {secondsLeft > 0 ? `Resend available in ${secondsLeft}s` : "Resend verification email"}
      </Button>
    </div>
  );
}
