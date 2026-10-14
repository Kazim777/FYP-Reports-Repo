"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, Database, FilePlus2, Layers } from "lucide-react";
import { api, Project } from "@/lib/api";
import { useCurrentUser } from "@/components/AppShell";
import StatCard from "@/components/StatCard";
import { Badge, ButtonLink, Card, EmptyState, PageHeader, Spinner } from "@/components/ui";

export default function FacultyOverview() {
  const user = useCurrentUser();
  const [projects, setProjects] = useState<Project[] | null>(null);

  useEffect(() => {
    api<{ projects: Project[] }>("/projects").then((d) => setProjects(d.projects)).catch(() => setProjects([]));
  }, []);

  const domains = new Set(projects?.map((p) => p.domain).filter(Boolean));
  const years = projects?.map((p) => p.year).filter((y): y is number => !!y) ?? [];
  const recent = [...(projects ?? [])]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  return (
    <>
      <PageHeader
        title={`Welcome, ${user.name}`}
        description="Manage the FYP repository for your department."
        action={
          <ButtonLink href="/dashboard/faculty/projects/new">
            <FilePlus2 className="size-4" /> Add project
          </ButtonLink>
        }
      />

      <div className="grid gap-5 sm:grid-cols-3">
        <StatCard icon={Database} label="Total projects" value={projects?.length ?? "–"} />
        <StatCard icon={Layers} label="Domains covered" value={projects ? domains.size : "–"} />
        <StatCard
          icon={CalendarDays}
          label="Years covered"
          value={years.length ? `${Math.min(...years)}–${Math.max(...years)}` : "–"}
        />
      </div>

      <Card className="mt-8">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="font-semibold text-slate-900">Recently added</h2>
          <Link
            href="/dashboard/faculty/projects"
            className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            Manage all <ArrowRight className="size-3.5" />
          </Link>
        </div>
        {!projects ? (
          <Spinner />
        ) : recent.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={Database}
              title="The repository is empty"
              description="Add past FYPs so students can search them."
              action={<ButtonLink href="/dashboard/faculty/projects/new">Add first project</ButtonLink>}
            />
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {recent.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/dashboard/projects/${p.id}`}
                  className="flex items-center gap-4 px-6 py-4 transition hover:bg-slate-50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-slate-900">{p.title}</p>
                    <p className="mt-0.5 text-sm text-slate-500">
                      {[p.supervisor, p.year].filter(Boolean).join(" · ") || "No details"}
                    </p>
                  </div>
                  {p.domain && <Badge tone="brand">{p.domain}</Badge>}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
