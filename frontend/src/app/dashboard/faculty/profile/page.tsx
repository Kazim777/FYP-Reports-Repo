"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, FacultyProfile } from "@/lib/api";
import { RESEARCH_AREA_OPTIONS } from "@/lib/options";
import { useCurrentUser } from "@/components/AppShell";
import TagPicker from "@/components/TagPicker";
import UserAvatar from "@/components/UserAvatar";
import { Alert, Button, Card, Field, Input, PageHeader, Spinner } from "@/components/ui";

const empty: FacultyProfile = {
  department: "",
  designation: "",
  researchAreas: [],
};

export default function FacultyProfilePage() {
  const user = useCurrentUser();
  const [profile, setProfile] = useState<FacultyProfile | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    api<{ profile: FacultyProfile | null }>("/profiles/me")
      .then((d) => setProfile({ ...empty, ...d.profile }))
      .catch(() => setProfile(empty));
  }, []);

  if (!profile) return <Spinner />;

  const set = <K extends keyof FacultyProfile>(key: K, value: FacultyProfile[K]) =>
    setProfile((current) => current && { ...current, [key]: value });

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    setSaving(true);
    try {
      await api("/profiles/me", { method: "PUT", body: JSON.stringify(profile) });
      setStatus({ tone: "success", text: "Profile saved." });
    } catch (err) {
      setStatus({ tone: "error", text: (err as Error).message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave}>
      <PageHeader
        title="My profile"
        description="Students see this when they look for a supervisor in your research area."
        action={
          <Button type="submit" loading={saving}>
            Save changes
          </Button>
        }
      />

      {status && (
        <div className="mb-6">
          <Alert tone={status.tone}>{status.text}</Alert>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="h-fit p-6 text-center">
          <UserAvatar name={user.name} avatar={user.avatar} size={64} className="mx-auto" />
          <h2 className="mt-4 font-semibold text-slate-900">{user.name}</h2>
          <p className="text-sm text-slate-500">{profile.designation || user.email}</p>
          <p className="mt-3 inline-block rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium capitalize text-slate-600">
            {user.role}
          </p>
          <Link
            href="/dashboard/account"
            className="mt-4 block text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            Change name or avatar
          </Link>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <Card className="p-6">
            <h3 className="font-semibold text-slate-900">Position</h3>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Field label="Department" htmlFor="dept">
                <Input
                  id="dept"
                  placeholder="Computer Science"
                  value={profile.department ?? ""}
                  onChange={(e) => set("department", e.target.value)}
                  maxLength={100}
                />
              </Field>
              <Field label="Designation" htmlFor="designation">
                <Input
                  id="designation"
                  placeholder="Assistant Professor"
                  value={profile.designation ?? ""}
                  onChange={(e) => set("designation", e.target.value)}
                  maxLength={100}
                />
              </Field>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-slate-900">Research areas</h3>
            <p className="mt-1 text-sm text-slate-500">Click to select or deselect, or add your own.</p>
            <div className="mt-6">
              <TagPicker
                options={RESEARCH_AREA_OPTIONS}
                value={profile.researchAreas}
                onChange={(v) => set("researchAreas", v)}
                addPlaceholder="Add another research area…"
              />
            </div>
          </Card>
        </div>
      </div>
    </form>
  );
}
