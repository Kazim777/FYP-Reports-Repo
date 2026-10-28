"use client";

import { useState } from "react";
import { api, User } from "@/lib/api";
import { isStrongPassword, PASSWORD_RULE_MESSAGE } from "@/lib/password";
import PasswordChecklist from "@/components/PasswordChecklist";
import { Alert, Button, Field, Input } from "@/components/ui";

const emptyFields = { currentPassword: "", newPassword: "", confirmPassword: "" };

export default function ChangePasswordForm({
  currentLabel = "Current password",
  submitLabel = "Update password",
  onChanged,
}: {
  currentLabel?: string;
  submitLabel?: string;
  onChanged: (user: User) => void;
}) {
  const [fields, setFields] = useState(emptyFields);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (key: keyof typeof emptyFields) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFields((current) => ({ ...current, [key]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!isStrongPassword(fields.newPassword)) return setError(PASSWORD_RULE_MESSAGE);
    if (fields.newPassword !== fields.confirmPassword) return setError("New passwords don't match.");

    setSaving(true);
    try {
      const { user } = await api<{ user: User }>("/auth/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword: fields.currentPassword, newPassword: fields.newPassword }),
      });
      setFields(emptyFields);
      onChanged(user);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <Alert>{error}</Alert>}
      <Field label={currentLabel} htmlFor="currentPassword">
        <Input
          id="currentPassword"
          type="password"
          autoComplete="current-password"
          value={fields.currentPassword}
          onChange={set("currentPassword")}
          required
        />
      </Field>
      <Field label="New password" htmlFor="newPassword">
        <Input
          id="newPassword"
          type="password"
          autoComplete="new-password"
          value={fields.newPassword}
          onChange={set("newPassword")}
          required
        />
        <PasswordChecklist password={fields.newPassword} />
      </Field>
      <Field label="Confirm new password" htmlFor="confirmPassword">
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={fields.confirmPassword}
          onChange={set("confirmPassword")}
          required
        />
      </Field>
      <Button type="submit" loading={saving}>
        {submitLabel}
      </Button>
    </form>
  );
}
