"use client";

import { useEffect, useState } from "react";
import { api, StudentProfile } from "@/lib/api";
import { useCurrentUser } from "@/components/AppShell";
import { Alert, Button, Card, Field, Input, PageHeader, Spinner, TagInput, Textarea } from "@/components/ui";

const empty: StudentProfile = {
  studentId: "",
  department: "",
  bio: "",
  skills: [],
  interests: [],
  technologies: [],
  domains: [],
};

export default function ProfilePage() {
  const user = useCurrentUser();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    api<{ profile: StudentProfile | null }>("/profiles/me")
      .then((d) => setProfile({ ...empty, ...d.profile }))
      .catch(() => setProfile(empty));
  }, []);

  if (!profile) return <Spinner />;

  const set = <K extends keyof StudentProfile>(key: K, value: StudentProfile[K]) =>
    setProfile({ ...profile, [key]: value });

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
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
        description="This information is used to match you with potential FYP partners."
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
          <span className="mx-auto grid size-20 place-items-center rounded-full bg-brand-100 text-2xl font-semibold text-brand-700">
            {user.name.charAt(0).toUpperCase()}
          </span>
          <h2 className="mt-4 font-semibold text-slate-900">{user.name}</h2>
          <p className="text-sm text-slate-500">{user.email}</p>
          <p className="mt-3 inline-block rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium capitalize text-slate-600">
            {user.role}
          </p>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <Card className="p-6">
            <h3 className="font-semibold text-slate-900">Basic information</h3>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Field label="Student ID" htmlFor="sid">
                <Input
                  id="sid"
                  placeholder="2312219"
                  value={profile.studentId ?? ""}
                  onChange={(e) => set("studentId", e.target.value)}
                />
              </Field>
              <Field label="Department" htmlFor="dept">
                <Input
                  id="dept"
                  placeholder="Computer Science"
                  value={profile.department ?? ""}
                  onChange={(e) => set("department", e.target.value)}
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Bio" htmlFor="bio">
                  <Textarea
                    id="bio"
                    placeholder="A short introduction about yourself and the kind of project you want to build."
                    value={profile.bio ?? ""}
                    onChange={(e) => set("bio", e.target.value)}
                  />
                </Field>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-slate-900">Skills & interests</h3>
            <p className="mt-1 text-sm text-slate-500">Type and press Enter to add each item.</p>
            <div className="mt-5 space-y-5">
              <Field label="Skills">
                <TagInput value={profile.skills} onChange={(v) => set("skills", v)} placeholder="UI design, APIs, testing…" />
              </Field>
              <Field label="Technologies">
                <TagInput
                  value={profile.technologies}
                  onChange={(v) => set("technologies", v)}
                  placeholder="React, Node.js, Python…"
                />
              </Field>
              <Field label="Interests">
                <TagInput
                  value={profile.interests}
                  onChange={(v) => set("interests", v)}
                  placeholder="Healthcare, education, fintech…"
                />
              </Field>
              <Field label="Preferred project domains">
                <TagInput
                  value={profile.domains}
                  onChange={(v) => set("domains", v)}
                  placeholder="AI/ML, Web, Mobile, IoT…"
                />
              </Field>
            </div>
          </Card>
        </div>
      </div>
    </form>
  );
}
