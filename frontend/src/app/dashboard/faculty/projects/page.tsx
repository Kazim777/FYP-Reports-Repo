"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FolderKanban, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { api, Project } from "@/lib/api";
import { Alert, Badge, ButtonLink, Card, EmptyState, Input, PageHeader, Spinner } from "@/components/ui";

export default function ManageProjectsPage() {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [filter, setFilter] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api<{ projects: Project[] }>("/projects")
      .then((d) => setProjects(d.projects))
      .catch((err) => setError(err.message));
  }, []);

  async function handleDelete(p: Project) {
    if (!confirm(`Delete "${p.title}"? This cannot be undone.`)) return;
    try {
      await api(`/projects/${p.id}`, { method: "DELETE" });
      setProjects((list) => list?.filter((x) => x.id !== p.id) ?? null);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  const q = filter.toLowerCase();
  const visible = projects?.filter(
    (p) => p.title.toLowerCase().includes(q) || p.domain?.toLowerCase().includes(q) || p.supervisor?.toLowerCase().includes(q)
  );

  return (
    <>
      <PageHeader
        title="Manage projects"
        description="Add, edit and remove past FYPs in the repository."
        action={
          <ButtonLink href="/dashboard/faculty/projects/new">
            <Plus className="size-4" /> Add project
          </ButtonLink>
        }
      />

      {error && (
        <div className="mb-6">
          <Alert>{error}</Alert>
        </div>
      )}

      {!projects ? (
        !error && <Spinner />
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Start building the repository by adding the first past FYP."
          action={
            <ButtonLink href="/dashboard/faculty/projects/new">
              <Plus className="size-4" /> Add project
            </ButtonLink>
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="border-b border-slate-200 p-4">
            <div className="relative max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter projects…" className="pl-9" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Title</th>
                  <th className="px-5 py-3 font-medium">Domain</th>
                  <th className="px-5 py-3 font-medium">Year</th>
                  <th className="px-5 py-3 font-medium">Supervisor</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visible?.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60">
                    <td className="max-w-sm px-5 py-4">
                      <Link href={`/dashboard/projects/${p.id}`} className="font-medium text-slate-900 hover:text-brand-700">
                        {p.title}
                      </Link>
                    </td>
                    <td className="px-5 py-4">{p.domain ? <Badge tone="brand">{p.domain}</Badge> : "—"}</td>
                    <td className="px-5 py-4 text-slate-600">{p.year ?? "—"}</td>
                    <td className="px-5 py-4 text-slate-600">{p.supervisor ?? "—"}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1">
                        <Link
                          href={`/dashboard/faculty/projects/${p.id}/edit`}
                          className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                          title="Edit"
                        >
                          <Pencil className="size-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(p)}
                          className="rounded-md p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {visible?.length === 0 && <p className="px-5 py-10 text-center text-sm text-slate-500">No projects match your filter.</p>}
          </div>
        </Card>
      )}
    </>
  );
}
