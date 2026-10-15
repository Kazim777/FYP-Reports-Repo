"use client";

import { useState } from "react";
import clsx from "clsx";
import { Check, Plus } from "lucide-react";

export default function TagPicker({
  options,
  value,
  onChange,
  addPlaceholder = "Add another…",
}: {
  options: string[];
  value: string[];
  onChange: (tags: string[]) => void;
  addPlaceholder?: string;
}) {
  const [draft, setDraft] = useState("");
  const isSelected = (tag: string) => value.some((v) => v.toLowerCase() === tag.toLowerCase());
  const custom = value.filter((v) => !options.some((o) => o.toLowerCase() === v.toLowerCase()));

  const toggle = (tag: string) =>
    onChange(isSelected(tag) ? value.filter((v) => v.toLowerCase() !== tag.toLowerCase()) : [...value, tag]);

  function addDraft() {
    const tag = draft.trim();
    if (tag && !isSelected(tag)) onChange([...value, tag]);
    setDraft("");
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {[...options, ...custom].map((tag) => {
          const selected = isSelected(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => toggle(tag)}
              aria-pressed={selected}
              className={clsx(
                "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition",
                selected
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-brand-300 hover:text-brand-700"
              )}
            >
              {selected && <Check className="size-3" />}
              {tag}
            </button>
          );
        })}
      </div>
      <div className="flex max-w-xs items-center gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addDraft();
            }
          }}
          placeholder={addPlaceholder}
          maxLength={50}
          className="h-8 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-xs shadow-sm placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100"
        />
        <button
          type="button"
          onClick={addDraft}
          disabled={!draft.trim()}
          className="grid size-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40"
          aria-label="Add"
        >
          <Plus className="size-4" />
        </button>
      </div>
    </div>
  );
}
