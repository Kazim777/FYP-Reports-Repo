"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, Project } from "@/lib/api";
import { Alert, Button, ButtonLink, Card, Field, Input, TagInput, Textarea } from "@/components/ui";

interface FormValues {
  title: string;
  abstract: string;
  domain: string;
  year: string;
  supervisor: string;
  teamMembers: string[];
}

const toForm = (p?: Project): FormValues => ({
  title: p?.title ?? "",
  abstract: p?.abstract ?? "",
  domain: p?.domain ?? "",
  year: String(p?.year ?? new Date().getFullYear()),
  supervisor: p?.supervisor ?? "",
  teamMembers: p?.teamMembers ?? [],
});

export default function ProjectForm({ project }: { project?: Project }) {
  const router = useRouter();
  const [form, setForm] = useState<FormValues>(toForm(project));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (key: keyof FormValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [key]: e.target.value });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const body = JSON.stringify({ ...form, year: form.year ? Number(form.year) : null });
      if (project) {
        await api(`/projects/${project.id}`, { method: "PUT", body });
      } else {
        await api("/projects", { method: "POST", body });
      }
      router.push("/dashboard/faculty/projects");
    } catch (err) {
      setError((err as Error).message);
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="p-6 sm:p-8">
        {error && (
          <div className="mb-6">
            <Alert>{error}</Alert>
          </div>
        )}
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Project title" htmlFor="title">
              <Input
                id="title"
                value={form.title}
                onChange={set("title")}
                placeholder="Smart Attendance System using Face Recognition"
                required
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Abstract" htmlFor="abstract" hint="A short summary of the problem, approach and outcome.">
              <Textarea id="abstract" value={form.abstract} onChange={set("abstract")} className="min-h-36" />
            </Field>
          </div>
          <Field label="Domain" htmlFor="domain">
            <Input id="domain" value={form.domain} onChange={set("domain")} placeholder="AI/ML" />
          </Field>
          <Field label="Year" htmlFor="year">
            <Input id="year" type="number" min={1990} max={2100} value={form.year} onChange={set("year")} />
          </Field>
          <Field label="Supervisor" htmlFor="supervisor">
            <Input id="supervisor" value={form.supervisor} onChange={set("supervisor")} placeholder="Dr. Adeel Ansari" />
          </Field>
          <Field label="Team members" hint="Type a name and press Enter.">
            <TagInput
              value={form.teamMembers}
              onChange={(teamMembers) => setForm({ ...form, teamMembers })}
              placeholder="Ali Khan"
            />
          </Field>
        </div>

        <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-6">
          <ButtonLink href="/dashboard/faculty/projects" variant="secondary">
            Cancel
          </ButtonLink>
          <Button type="submit" loading={saving}>
            {project ? "Save changes" : "Add project"}
          </Button>
        </div>
      </Card>
    </form>
  );
}
