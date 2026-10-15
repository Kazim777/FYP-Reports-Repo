"use client";

import { useState } from "react";
import { Check, Copy, KeyRound } from "lucide-react";
import { TemporaryPasswordResult } from "@/lib/api";

export default function TemporaryPasswordCard({
  result,
  title,
  children,
}: {
  result: TemporaryPasswordResult;
  title: string;
  children?: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(result.temporaryPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700">
          <KeyRound className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-emerald-900">{title}</h3>
          <p className="mt-1 text-sm text-emerald-800">
            Share these login details with <strong>{result.user.name}</strong>. They&apos;ll be asked to choose their
            own password when they first log in. This password won&apos;t be shown again.
          </p>

          <dl className="mt-4 grid gap-3 rounded-lg bg-white p-4 text-sm sm:grid-cols-[auto_1fr] sm:gap-x-6">
            <dt className="text-slate-500">Email</dt>
            <dd className="font-medium text-slate-900">{result.user.email}</dd>
            <dt className="text-slate-500">Temporary password</dt>
            <dd className="flex items-center gap-2">
              <code className="rounded bg-slate-100 px-2 py-1 font-mono text-slate-900">{result.temporaryPassword}</code>
              <button
                type="button"
                onClick={copy}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-brand-600 hover:bg-brand-50"
              >
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </dd>
          </dl>

          {children && <div className="mt-4 flex flex-wrap gap-3">{children}</div>}
        </div>
      </div>
    </div>
  );
}
