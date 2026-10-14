"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { FolderSearch, Search } from "lucide-react";
import { api, Project } from "@/lib/api";
import ProjectCard from "@/components/ProjectCard";
import { EmptyState, Input, PageHeader, Spinner } from "@/components/ui";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [domain, setDomain] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      const qs = query.trim() ? `?q=${encodeURIComponent(query.trim())}` : "";
      api<{ projects: Project[] }>(`/projects${qs}`)
        .then((d) => setProjects(d.projects))
        .catch(() => setProjects([]));
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const domains = useMemo(
    () => [...new Set(projects?.map((p) => p.domain).filter((d): d is string => !!d))].sort(),
    [projects]
  );
  const visible = domain ? projects?.filter((p) => p.domain === domain) : projects;

  return (
    <>
      <PageHeader title="Search projects" description="Find past FYPs by title, abstract or domain." />

      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. machine learning, attendance system, e-commerce…"
          className="h-12 pl-10 text-base"
          autoFocus
        />
      </div>

      {domains.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {[null, ...domains].map((d) => (
            <button
              key={d ?? "all"}
              onClick={() => setDomain(d)}
              className={clsx(
                "rounded-full border px-3 py-1 text-xs font-medium transition",
                domain === d
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              )}
            >
              {d ?? "All domains"}
            </button>
          ))}
        </div>
      )}

      <div className="mt-6">
        {!visible ? (
          <Spinner />
        ) : visible.length === 0 ? (
          <EmptyState
            icon={FolderSearch}
            title="No matching projects"
            description="Try a different keyword or clear the domain filter."
          />
        ) : (
          <>
            <p className="mb-4 text-sm text-slate-500">
              {visible.length} project{visible.length !== 1 && "s"} found
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
