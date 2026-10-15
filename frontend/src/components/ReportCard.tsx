"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, ExternalLink, FileText, UploadCloud } from "lucide-react";
import { formatFileSize, openProjectPdf, Project } from "@/lib/api";
import { Button, Card } from "@/components/ui";

const MIN_READABLE_WORDS = 50;

export default function ReportCard({ project, canEdit }: { project: Project; canEdit: boolean }) {
  const [opening, setOpening] = useState(false);
  const [error, setError] = useState("");

  async function handleOpen() {
    setError("");
    setOpening(true);
    try {
      await openProjectPdf(project.id);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setOpening(false);
    }
  }

  if (!project.pdfName) {
    return (
      <Card className="p-5">
        <h2 className="text-sm font-semibold text-slate-900">Project report</h2>
        <p className="mt-1 text-sm text-slate-500">No PDF report has been uploaded yet.</p>
        {canEdit && (
          <Link
            href={`/dashboard/faculty/projects/${project.id}/edit`}
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            <UploadCloud className="size-4" /> Upload report
          </Link>
        )}
      </Card>
    );
  }

  const text = project.text;
  const details = [
    text && `${text.pageCount} pages`,
    text && `${text.wordCount.toLocaleString()} words`,
    project.pdfSize && formatFileSize(project.pdfSize),
  ].filter(Boolean);
  const looksScanned = text && text.wordCount < MIN_READABLE_WORDS;

  return (
    <Card className="p-5">
      <h2 className="text-sm font-semibold text-slate-900">Project report</h2>
      <div className="mt-3 flex items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-red-50 text-red-600">
          <FileText className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-900">{project.pdfName}</p>
          <p className="text-xs text-slate-500">{details.join(" · ")}</p>
        </div>
      </div>

      {looksScanned && (
        <p className="mt-3 flex gap-2 rounded-lg bg-amber-50 p-2.5 text-xs text-amber-800">
          <AlertTriangle className="size-4 shrink-0" />
          Very little text could be read. This PDF may contain scanned images, so its content won&apos;t appear in search.
        </p>
      )}
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <Button variant="secondary" className="mt-4 w-full" loading={opening} onClick={handleOpen}>
        {!opening && <ExternalLink className="size-4" />} View PDF
      </Button>
    </Card>
  );
}
