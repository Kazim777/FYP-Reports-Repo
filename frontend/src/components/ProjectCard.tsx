import Link from "next/link";
import { CalendarDays, UserRound } from "lucide-react";
import { Project } from "@/lib/api";
import { Badge } from "@/components/ui";

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/dashboard/projects/${project.id}`}
      className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md"
    >
      <div className="flex items-center gap-2">
        {project.domain && <Badge tone="brand">{project.domain}</Badge>}
        {project.year && (
          <span className="ml-auto flex items-center gap-1 text-xs text-slate-500">
            <CalendarDays className="size-3.5" />
            {project.year}
          </span>
        )}
      </div>
      <h3 className="mt-3 line-clamp-2 font-semibold text-slate-900 group-hover:text-brand-700">{project.title}</h3>
      <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-600">
        {project.abstract || "No abstract provided."}
      </p>
      {project.supervisor && (
        <p className="mt-4 flex items-center gap-1.5 border-t border-slate-100 pt-3 text-xs text-slate-500">
          <UserRound className="size-3.5" />
          {project.supervisor}
        </p>
      )}
    </Link>
  );
}
