"use client";

import { useState } from "react";
import { api, User } from "@/lib/api";
import { useCurrentUser, useUpdateUser } from "@/components/AppShell";
import AvatarPicker from "@/components/AvatarPicker";
import ChangePasswordForm from "@/components/ChangePasswordForm";
import UserAvatar from "@/components/UserAvatar";
import { Alert, Button, Card, Field, Input, PageHeader } from "@/components/ui";

export default function AccountPage() {
  const user = useCurrentUser();
  const updateUser = useUpdateUser();
  const [name, setName] = useState(user.name);
  const [avatar, setAvatar] = useState(user.avatar);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [passwordChanged, setPasswordChanged] = useState(false);

  const hasChanges = name.trim() !== user.name || avatar !== user.avatar;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      const { user: updated } = await api<{ user: User }>("/auth/me", {
        method: "PATCH",
        body: JSON.stringify({ name: name.trim(), avatar }),
      });
      updateUser(updated);
      setStatus({ tone: "success", text: "Account updated." });
    } catch (err) {
      setStatus({ tone: "error", text: (err as Error).message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Account"
        description="Choose how you appear to other people on FYP Hub."
        action={
          <Button type="submit" form="account-form" loading={saving} disabled={!hasChanges}>
            Save changes
          </Button>
        }
      />

      {status && (
        <div className="mb-6">
          <Alert tone={status.tone}>{status.text}</Alert>
        </div>
      )}

      <form id="account-form" onSubmit={handleSave} className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <UserAvatar name={name || user.name} avatar={avatar} size={48} />
            <div>
              <h2 className="font-semibold text-slate-900">Profile picture</h2>
              <p className="text-sm text-slate-500">Pick an avatar, or click the selected one again to use your initial.</p>
            </div>
          </div>
          <div className="mt-6 max-w-md">
            <AvatarPicker value={avatar} onChange={setAvatar} />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold text-slate-900">Details</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field label="Full name" htmlFor="name">
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
            </Field>
            <Field label="Email" htmlFor="email" hint="Email can't be changed.">
              <Input id="email" value={user.email} disabled className="bg-slate-50 text-slate-500" />
            </Field>
            <Field label="Role" htmlFor="role">
              <Input id="role" value={user.role} disabled className="bg-slate-50 capitalize text-slate-500" />
            </Field>
          </div>
        </Card>
      </form>

      <Card className="mt-6 p-6">
        <h2 className="font-semibold text-slate-900">Password</h2>
        <p className="mt-1 text-sm text-slate-500">Choose a strong password you don&apos;t use anywhere else.</p>
        {passwordChanged && (
          <div className="mt-5">
            <Alert tone="success">Password updated.</Alert>
          </div>
        )}
        <div className="mt-5 max-w-sm">
          <ChangePasswordForm
            onChanged={(updated) => {
              updateUser(updated);
              setPasswordChanged(true);
            }}
          />
        </div>
      </Card>
    </div>
  );
}
