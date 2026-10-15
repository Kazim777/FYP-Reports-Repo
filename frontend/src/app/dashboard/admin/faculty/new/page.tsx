"use client";

import { useState } from "react";
import { api, TemporaryPasswordResult } from "@/lib/api";
import TemporaryPasswordCard from "@/components/TemporaryPasswordCard";
import { Alert, Button, ButtonLink, Card, Field, Input, PageHeader } from "@/components/ui";

const emptyForm = { name: "", email: "" };

export default function AddFacultyPage() {
  const [form, setForm] = useState(emptyForm);
  const [created, setCreated] = useState<TemporaryPasswordResult | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      setCreated(
        await api<TemporaryPasswordResult>("/admin/users/faculty", { method: "POST", body: JSON.stringify(form) })
      );
      setForm(emptyForm);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Add faculty"
        description="Create an account for a faculty member. A temporary password is generated for them."
      />

      {created ? (
        <TemporaryPasswordCard result={created} title="Faculty account created">
          <Button variant="secondary" onClick={() => setCreated(null)}>
            Add another
          </Button>
          <ButtonLink href="/dashboard/admin/users" variant="ghost">
            View all users
          </ButtonLink>
        </TemporaryPasswordCard>
      ) : (
        <Card className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <Alert>{error}</Alert>}
            <Field label="Full name" htmlFor="name">
              <Input
                id="name"
                placeholder="Your Full Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                minLength={2}
              />
            </Field>
            <Field label="University email" htmlFor="email">
              <Input
                id="email"
                type="email"
                placeholder="name@szabist.edu.pk"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </Field>
            <div className="flex justify-end border-t border-slate-100 pt-5">
              <Button type="submit" loading={saving}>
                Create faculty account
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}
