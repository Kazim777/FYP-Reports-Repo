"use client";

import { useRef, useState } from "react";
import clsx from "clsx";
import { FileText, UploadCloud, X } from "lucide-react";
import { formatFileSize, MAX_PDF_SIZE_MB } from "@/lib/api";

export interface ExistingPdf {
  name: string;
  size: number | null;
  pageCount?: number;
}

function validatePdf(file: File) {
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) return "Only PDF files are allowed.";
  if (file.size > MAX_PDF_SIZE_MB * 1024 * 1024) return `PDF must be ${MAX_PDF_SIZE_MB} MB or smaller.`;
  return null;
}

export default function PdfDropzone({
  file,
  existing,
  onFileChange,
  onRemoveExisting,
}: {
  file: File | null;
  existing: ExistingPdf | null;
  onFileChange: (file: File | null) => void;
  onRemoveExisting: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");

  function pick(selected?: File) {
    if (!selected) return;
    const problem = validatePdf(selected);
    setError(problem ?? "");
    if (!problem) onFileChange(selected);
  }

  const browse = () => inputRef.current?.click();

  const input = (
    <input
      ref={inputRef}
      type="file"
      accept="application/pdf,.pdf"
      className="hidden"
      onChange={(e) => {
        pick(e.target.files?.[0]);
        e.target.value = "";
      }}
    />
  );

  const shown = file
    ? { name: file.name, detail: `${formatFileSize(file.size)} · will be uploaded when you save`, isNew: true }
    : existing
      ? {
          name: existing.name,
          detail: [existing.size && formatFileSize(existing.size), existing.pageCount && `${existing.pageCount} pages`]
            .filter(Boolean)
            .join(" · "),
          isNew: false,
        }
      : null;

  if (shown) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
        {input}
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-red-50 text-red-600">
          <FileText className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-slate-900">{shown.name}</p>
          <p className="text-xs text-slate-500">{shown.detail}</p>
        </div>
        <button type="button" onClick={browse} className="rounded-md px-2.5 py-1.5 text-sm font-medium text-brand-600 hover:bg-brand-50">
          Replace
        </button>
        <button
          type="button"
          onClick={() => (shown.isNew ? onFileChange(null) : onRemoveExisting())}
          className="rounded-md p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
          title="Remove PDF"
        >
          <X className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <div>
      {input}
      <button
        type="button"
        onClick={browse}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          pick(e.dataTransfer.files[0]);
        }}
        className={clsx(
          "flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-8 text-center transition",
          dragging ? "border-brand-500 bg-brand-50" : "border-slate-300 hover:border-brand-400 hover:bg-slate-50"
        )}
      >
        <span className="grid size-11 place-items-center rounded-full bg-brand-50 text-brand-600">
          <UploadCloud className="size-5" />
        </span>
        <p className="mt-3 text-sm text-slate-700">
          <span className="font-medium text-brand-600">Click to upload</span> or drag and drop the report
        </p>
        <p className="mt-1 text-xs text-slate-500">PDF up to {MAX_PDF_SIZE_MB} MB</p>
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
