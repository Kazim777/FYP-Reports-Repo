"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CalendarDays, Pencil, UserRound, Users } from "lucide-react";
import { api, Project } from "@/lib/api";
import { useCurrentUser } from "@/components/AppShell";
import { Alert, Badge, ButtonLink, Card, Spinner } from "@/components/ui";

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const user = useCurrentUser();
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<{ project: Project }>(`/projects/${id}`)
      .then((d) => setProject(d.project))
      .catch((err) => setError(err.message));
  }, [id]);

  if (error) return <Alert>{error}</Alert>;
  if (!project) return <Spinner />;

  const team = project.teamMembers;

  return (
    <div className="mx-auto max-w-4xl">
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="size-4" /> Back
      </button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            {project.domain && <Badge tone="brand">{project.domain}</Badge>}
            {project.year && <Badge>{project.year}</Badge>}
          </div>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">{project.title}</h1>
        </div>
        {user.role === "faculty" && (
          <ButtonLink href={`/dashboard/faculty/projects/${project.id}/edit`} variant="secondary">
            <Pencil className="size-4" /> Edit
          </ButtonLink>
        )}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Abstract</h2>
          <p className="mt-3 whitespace-pre-line leading-relaxed text-slate-700">
            {project.abstract || "No abstract provided."}
          </p>
        </Card>

        <Card className="h-fit divide-y divide-slate-100">
          <Detail icon={UserRound} label="Supervisor" value={project.supervisor || "—"} />
          <Detail icon={CalendarDays} label="Year" value={project.year ?? "—"} />
          <div className="flex gap-3 p-5">
            <Users className="mt-0.5 size-4 text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">Team</p>
              {team.length ? (
                <ul className="mt-1 space-y-0.5 text-sm font-medium text-slate-900">
                  {team.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm font-medium text-slate-900">—</p>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Detail({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-3 p-5">
      <Icon className="mt-0.5 size-4 text-slate-400" />
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm font-medium text-slate-900">{value}</p>
      </div>
    </div>
  );
}
