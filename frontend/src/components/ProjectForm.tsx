"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, Project, uploadProjectPdf } from "@/lib/api";
import PdfDropzone from "@/components/PdfDropzone";
import { Alert, Button, ButtonLink, Card, Field, Input, TagInput, Textarea } from "@/components/ui";

interface FormValues {
  title: string;
  abstract: string;
  domain: string;
  year: string;
  supervisor: string;
  teamMembers: string[];
}

type SaveStage = "idle" | "saving" | "uploading";

const toForm = (p?: Project): FormValues => ({
  title: p?.title ?? "",
  abstract: p?.abstract ?? "",
  domain: p?.domain ?? "",
  year: String(p?.year ?? new Date().getFullYear()),
  supervisor: p?.supervisor ?? "",
  teamMembers: p?.teamMembers ?? [],
});

const stageLabel: Record<SaveStage, string> = {
  idle: "",
  saving: "Saving…",
  uploading: "Reading PDF…",
};

export default function ProjectForm({ project }: { project?: Project }) {
  const router = useRouter();
  const [form, setForm] = useState<FormValues>(toForm(project));
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [removeExistingPdf, setRemoveExistingPdf] = useState(false);
  const [savedId, setSavedId] = useState(project?.id ?? null);
  const [error, setError] = useState("");
  const [stage, setStage] = useState<SaveStage>("idle");

  const existingPdf =
    project?.pdfName && !removeExistingPdf
      ? { name: project.pdfName, size: project.pdfSize, pageCount: project.text?.pageCount }
      : null;

  const set = (key: keyof FormValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [key]: e.target.value });

  async function saveDetails() {
    const body = JSON.stringify({ ...form, year: form.year ? Number(form.year) : null });
    if (savedId) {
      await api(`/projects/${savedId}`, { method: "PUT", body });
      return savedId;
    }
    const { project: created } = await api<{ project: Project }>("/projects", { method: "POST", body });
    setSavedId(created.id);
    return created.id;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      setStage("saving");
      const id = await saveDetails();

      if (removeExistingPdf && !pdfFile) {
        await api(`/projects/${id}/pdf`, { method: "DELETE" });
      }
      if (pdfFile) {
        setStage("uploading");
        await uploadProjectPdf(id, pdfFile);
      }

      router.push(`/dashboard/projects/${id}`);
    } catch (err) {
      setError((err as Error).message);
      setStage("idle");
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
            <Field label="Project report" hint="The text is extracted automatically so students can search inside the report.">
              <PdfDropzone
                file={pdfFile}
                existing={existingPdf}
                onFileChange={setPdfFile}
                onRemoveExisting={() => setRemoveExistingPdf(true)}
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field
              label="Abstract"
              htmlFor="abstract"
              hint="Leave empty to fill it in automatically from the abstract in the PDF."
            >
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
            <Input id="supervisor" value={form.supervisor} onChange={set("supervisor")} placeholder="Your Full Name" />
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
          <Button type="submit" loading={stage !== "idle"}>
            {stage !== "idle" ? stageLabel[stage] : project ? "Save changes" : "Add project"}
          </Button>
        </div>
      </Card>
    </form>
  );
}
